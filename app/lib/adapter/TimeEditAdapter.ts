import { Calendar, CalendarEvent } from 'iamcal'
import { NextRequest } from 'next/server'
import Adapter from './Adapter'
import HashSlicer from '../slicer/HashSlicer'
import Slicer, { EventGroup, applySlicer } from '../slicer/Slicer'
import {
    createCalendarDescription,
    createCalendarName,
    createEventDescription,
    createEventLocation,
    createEventSummary,
    createExamEvents,
    timeEditGroupByOptions,
    isGlobalEvent,
    isGuCourseCode,
    parseEventData,
    serializeEventData,
    shortenCourseCode,
    TimeEditGroupByOption,
} from '../timeedit'
import {
    AvailableGroup,
    GroupedUrlExtras,
    parseAllowedValues,
    parseGroupBy,
    prepareSetForComparison,
} from '../group'

export default class TimeEditAdapter extends Adapter {
    override createUrl(id: string): URL {
        const [category, filename] = id.split('.')
        return new URL(
            `https://cloud.timeedit.net/chalmers/web/${category}/${filename}.ics`
        )
    }

    override getId(url: URL): string {
        const urlPattern =
            /^(https|webcal):\/\/cloud\.timeedit\.net\/\w+\/web\/\w+\/[^/]+\.ics$/
        if (!urlPattern.test(url.href)) {
            throw new Error('Invalid URL')
        }

        const organizationPattern = /(?<=cloud\.timeedit\.net\/).+?(?=\/)/
        const organization = organizationPattern.exec(url.href)?.[0]
        if (organization !== 'chalmers') {
            throw new Error(
                'Unsupported organization. Calendar must be from Chalmers.'
            )
        }

        const categoryPattern = /(?<=web\/).+?(?=\/)/
        const category = categoryPattern.exec(url.href)?.[0]

        if (category !== 'public')
            throw new Error(
                'Unsupported category. Calendar must be from the "public" schedule ("Öppen schemavisning").'
            )

        const filenamePattern = /[^/]+?(?=\.ics)/
        const filename = filenamePattern.exec(url.href)![0]

        const id = `${category}.${filename}`
        return id
    }

    override async patchCalendar(
        calendar: Calendar,
        req?: NextRequest
    ): Promise<Calendar> {
        const addExams =
            req == undefined ||
            !['1', 'true', 't'].includes(
                req.nextUrl.searchParams.get('noExam') ?? '0'
            )

        const keepGlobalEvents =
            req != undefined &&
            ['1', 'true', 't'].includes(
                req.nextUrl.searchParams.get('keepGlobal') ?? '0'
            )

        const hideGu =
            req != undefined &&
            ['1', 'true', 't'].includes(
                req.nextUrl.searchParams.get('hideGu') ?? '0'
            )

        const courseCodeSets: string[][] = []
        const oldEvents = calendar.getEvents()
        oldEvents.forEach(event => {
            if (isGlobalEvent(event) && !keepGlobalEvents) {
                calendar.removeEvent(event.getUid())
                return
            }

            const eventData = parseEventData(event)

            if (hideGu && eventData.kurskod) {
                eventData.kurskod = eventData.kurskod.filter(
                    code => !isGuCourseCode(code)
                )
                // Patch event
                event.setSummary(serializeEventData(eventData))
                event.setDescription('')
                event.setLocation('')
            }

            const courseCodes = eventData.kurskod?.map(shortenCourseCode)
            if (courseCodes === undefined) return

            for (const courseCodeSet of courseCodeSets) {
                for (const courseCode of courseCodes) {
                    if (courseCodeSet.includes(courseCode)) {
                        courseCodes.forEach(c => {
                            if (!courseCodeSet.includes(c))
                                courseCodeSet.push(c)
                        })
                        return
                    }
                }
            }
            // New course code set
            courseCodeSets.push(courseCodes)
        })

        const groupedCourseCodes = courseCodeSets.map(s => [...s])

        if (addExams) {
            const examEvents = await createExamEvents([...groupedCourseCodes])
            calendar.addComponents(examEvents)
        }

        // Update calendar metadata
        const calendarName = createCalendarName(groupedCourseCodes)
        calendar.setCalendarName(calendarName)
        const calendarDescription = createCalendarDescription(
            calendar.getCalendarDescription()
        )
        calendar.setCalendarDescription(calendarDescription)

        return calendar
    }

    override convertCalendar(calendar: Calendar, req?: NextRequest): Calendar {
        if (req?.nextUrl.searchParams.get('group')) {
            const groupBy = parseGroupBy(req)
            const allowedValues = parseAllowedValues(req)
            const slicer = createGroupSlicer(groupBy, allowedValues)

            // Include only the group which has events with the included values
            const mask = 0b10
            applySlicer(calendar, slicer, mask)
        }

        calendar.getEvents().forEach(event => convertEvent(event))
        return calendar
    }

    override getExtras(
        calendar: Calendar
    ): GroupedUrlExtras<TimeEditGroupByOption> {
        const groups: AvailableGroup<TimeEditGroupByOption>[] =
            timeEditGroupByOptions.map(option => ({
                property: option,
                propertyIndex: timeEditGroupByOptions.indexOf(option),
                values: {},
            }))

        calendar.getEvents().forEach(event => {
            const data = parseEventData(event)
            // For each groupable property name
            for (let i = 0; i < timeEditGroupByOptions.length; i++) {
                const property = timeEditGroupByOptions[i]

                if (data[property]) {
                    // Event has property
                    const key = prepareSetForComparison(data[property])
                    const prettyValues =
                        property === 'kurskod'
                            ? data[property].map(shortenCourseCode)
                            : data[property]
                    groups[i].values[key] = prettyValues.join(', ')
                } else {
                    // Event does not have property
                    groups[i].values['_'] = ''
                }
            }
        })

        const extras: GroupedUrlExtras<TimeEditGroupByOption> = {
            name: calendar.getCalendarName(),
            groups: groups,
        }

        return extras
    }
}

/**
 * Create a slicer for a group.
 * @param groupBy The index of the property to group by in {@link groupByOptions}.
 * @param allowedValues The property values to include in the slicer.
 * @returns The new slicer.
 * @throws {Error} If {@link groupBy} does not refer to a valid property.
 */
export function createGroupSlicer(
    groupBy: number,
    allowedValues: Set<string>
): Slicer<EventGroup> {
    if (groupBy >= timeEditGroupByOptions.length) {
        throw new Error(`Unknown group by option ${groupBy}.`)
    }
    const property = timeEditGroupByOptions[groupBy]

    /**
     * This hash function returns 1 for events that have any of the allowed
     * values, and 0 otherwise.
     * @param event The event to hash.
     * @returns The hashed event.
     */
    const hash = (event: CalendarEvent): number => {
        const data = parseEventData(event)
        if (data[property] == undefined) {
            // Match undefined represented by _
            return Number(allowedValues.has('_'))
        }
        const values = prepareSetForComparison(data[property])
        return Number(allowedValues.has(values))
    }
    return new HashSlicer(hash, 2)
}

/**
 * Update a TimeEdit event to follow the adapter format.
 * @param event The event from TimeEdit.
 */
export function convertEvent(event: CalendarEvent): void {
    const eventData = parseEventData(event)

    // Summary
    const summary = createEventSummary(eventData, event)
    if (summary) {
        event.setSummary(summary)
    } else {
        event.removeSummary()
    }

    // Description
    const description = createEventDescription(eventData, event)
    if (description) {
        event.setDescription(description)
    } else {
        event.removeDescription()
    }

    // Location
    const location = createEventLocation(eventData, event)
    if (location) {
        event.setLocation(location)
    } else {
        event.removeLocation()
    }
}
