import { Calendar, CalendarEvent, parseCalendar } from 'iamcal'
import { NextRequest } from 'next/server'
import Adapter from './Adapter'
import HashSlicer from '../slicer/HashSlicer'
import Slicer, { EventGroup, applySlicer } from '../slicer/Slicer'
import {
    AvailableGroup,
    createEventDescription,
    createEventLocation,
    createEventSummary,
    groupByOptions,
    parseEventData,
    shortenCourseCode,
    TimeEditUrlExtras,
} from '../timeedit'

export default class TimeEditAdapter extends Adapter {
    createUrl(id: string): URL {
        const [category, filename] = id.split('.')
        return new URL(
            `https://cloud.timeedit.net/chalmers/web/${category}/${filename}.ics`
        )
    }

    getId(url: URL): string {
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

    convertCalendar(calendar: Calendar, req?: NextRequest): Calendar {
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

    getExtras(url: URL): Promise<TimeEditUrlExtras | undefined> {
        return fetch(url)
            .then(response => {
                if (!response.ok)
                    throw new Error('Failed to fetch TimeEdit calendar')
                if (
                    !response.headers
                        .get('Content-Type')
                        ?.includes('text/calendar')
                )
                    throw new Error(
                        'Received non-calendar response from TimeEdit'
                    )

                return response.text()
            })
            .then(text => {
                if (!text) return undefined
                let calendar: Calendar
                try {
                    calendar = parseCalendar(text)
                } catch (e) {
                    console.error(
                        `Failed to parse TimeEdit calendar for extras, see calendar at '${url}'`
                    )
                    throw e
                }

                const groups: AvailableGroup[] = groupByOptions.map(option => ({
                    property: option,
                    values: {},
                }))

                calendar.getEvents().forEach(event => {
                    const data = parseEventData(event)
                    for (let i = 0; i < groupByOptions.length; i++) {
                        const property = groupByOptions[i]
                        if (data[property]) {
                            const key = prepareSetForComparison(data[property])
                            const prettyValues =
                                property === 'kurskod'
                                    ? data[property].map(shortenCourseCode)
                                    : data[property]
                            groups[i].values[key] = prettyValues.join(', ')
                        }
                    }
                })

                const extras: TimeEditUrlExtras = {
                    groups: groups,
                }

                return extras
            })
    }
}

/**
 * Get the index of the property to group by.
 * @param req The request to parse.
 * @returns The index of the property in {@link groupByOptions}.
 * @throws {Error} If the 'group' query parameter is missing or invalid.
 */
export function parseGroupBy(req: NextRequest): number {
    const groupByString = req.nextUrl.searchParams.get('group')
    if (groupByString === undefined)
        throw new Error(
            "Unable to find property to group by. Missing query parameter 'group'"
        )

    let groupBy: number
    try {
        groupBy = parseInt(String(groupByString))
    } catch {
        throw new Error(
            "Invalid query parameter 'group', must be a positive integer"
        )
    }
    if (groupBy < 0) {
        throw new Error(
            "Invalid query parameter 'group', must be a positive integer"
        )
    }

    return groupBy
}

/**
 * Get the allowed values for grouping from the request.
 *
 * One element represents one allowed combination of TimeEdit property values.
 * @param req The request to parse.
 * @returns A set of allowed values.
 * @throws {Error} If the request has no group values.
 */
export function parseAllowedValues(req: NextRequest): Set<string> {
    const serializedValues = req.nextUrl.searchParams.get('gi')
    if (serializedValues === undefined)
        throw new Error(
            "Unable to get group index. Missing query parameter 'gi'"
        )

    const values = String(serializedValues)
        .replace(/[^a-z0-9_ -]/g, '')
        .split(' ')
        .map(value =>
            value
                .split('_')
                .filter(v => v !== '')
                .sort()
                .join('_')
        )
        .filter(v => v !== '')

    return new Set(values)
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
    if (groupBy >= groupByOptions.length) {
        throw new Error(`Unknown group by option ${groupBy}.`)
    }
    const property = groupByOptions[groupBy]

    /**
     * This hash function returns 1 for events that have any of the allowed
     * values, and 0 otherwise.
     * @param event The event to hash.
     * @returns The hashed event.
     */
    const hash = (event: CalendarEvent): number => {
        const data = parseEventData(event)
        if (data[property] === undefined) return 0
        const values = prepareSetForComparison(data[property])
        return Number(allowedValues.has(values))
    }
    return new HashSlicer(hash, 2)
}

/**
 * Prepare a value to be used in grouping comparisons.
 * @param value The value to simplify.
 * @returns A URL friendly simplified version of the value.
 */
export function prepareForComparison(value: string): string {
    return value.toLowerCase().replace(/[^a-z0-9]/g, '-')
}

/**
 * Prepare a value to be used in grouping comparisons.
 * @param value The set to simplify, represents one combination of property values.
 * @returns A URL friendly simplified version of the value.
 */
export function prepareSetForComparison(value: string[]): string {
    return value
        .map(prepareForComparison)
        .filter(v => v !== '')
        .sort()
        .join('_')
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
