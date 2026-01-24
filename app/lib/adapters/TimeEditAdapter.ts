import { Calendar, CalendarEvent, parseCalendar } from 'iamcal'
import { NextRequest } from 'next/server'
import Adapter from '../Adapter'
import HashSlicer from '../slicers/HashSlicer'
import Slicer, { EventGroup, useSlicer } from '../slicers/Slicer'
import {
    AvailableGroup,
    groupByOptions,
    parseEventDataString,
    shortenCourseCode,
    TimeEditEventData,
    TimeEditUrlExtras,
} from '../timeedit'
import { fromCamelCase } from '../Util'


export default class TimeEditAdapter extends Adapter {
    createUrl(id: string): URL {
        const [category, filename] = id.split('.')
        return new URL(
            `https://cloud.timeedit.net/chalmers/web/${category}/${filename}.ics`
        )
    }

    getId(url: URL): string {
        const urlPattern =
            /^(https|webcal):\/\/cloud\.timeedit\.net\/\w+\/web\/\w+\/[^\/]+\.ics$/
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

        const filenamePattern = /[^\/]+?(?=\.ics)/
        const filename = filenamePattern.exec(url.href)![0]

        const id = `${category}.${filename}`
        return id
    }

    convertCalendar(calendar: Calendar, req?: NextRequest): Calendar {
        if (req?.nextUrl.searchParams.get('group')) {
            const groupBy = parseGroupBy(req)
            const allowedValues = parseAllowedValues(req)
            const slicer = getGroupSlicer(groupBy, allowedValues)

            // Include only the group which has events with the included values
            const mask = 0b10
            useSlicer(calendar, slicer, mask)
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
                    console.error(`Failed to parse TimeEdit calendar for extras, see calendar at '${url}'`)
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

export function getGroupSlicer(
    groupBy: number,
    allowedValues: Set<string>
): Slicer<EventGroup> {
    if (groupBy >= groupByOptions.length) {
        throw new Error(`Unknown group by option ${groupBy}.`)
    }
    const property = groupByOptions[groupBy]

    /**
     * This hash function returns 1 for events that have any of the included
     * values, and 0 otherwise.
     */
    const hash = (event: CalendarEvent): number => {
        const data = parseEventData(event)
        if (!data[property]) return 0
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

export function convertEvent(event: CalendarEvent) {
    const eventData = parseEventData(event)

    const summary = formatSummary(eventData, event)
    if (summary) {
        event.setSummary(summary)
    } else {
        event.removeSummary()
    }

    const description = formatDescription(eventData, event)
    if (description) {
        event.setDescription(description)
    } else {
        event.removeDescription()
    }

    const location = formatLocation(eventData, event)
    if (location) {
        event.setLocation(location)
    } else {
        event.removeLocation()
    }
}

export function formatSummary(
    data: TimeEditEventData,
    context?: CalendarEvent
): string | null {
    if (data.titel) {
        return data.titel.join(', ')
    }

    const coursePart = formatCourse(data)
    const activityPart = data.activity
        ? `${data.activity.join(', ')}${coursePart !== null ? ':' : ''}`
        : null

    const summary = [activityPart, coursePart]
        .filter(part => part !== null)
        .join(' ')

    return summary === '' ? (context?.getSummary() ?? null) : summary
}

export function formatDescription(
    data: TimeEditEventData,
    context?: CalendarEvent
): string | null {
    const activityRow = data.activity ? `Aktivitet: ${data.activity[0]}` : null
    const course = formatCourse(data)
    const courseRow = course ? `Kurs: ${course}` : null
    const classRow = data.klasskod ? 'Klass: ' + data.klasskod.join(', ') : null

    const url =
        data.kartlänk ??
        (context?.hasProperty('URL')
            ? [context.getProperty('URL')!.value]
            : null)

    const mapRow = url ? 'Karta: ' + url.join(', ') : null

    const knownKeys = [
        'activity',
        'klassnamn',
        'klasskod',
        'kursnamn',
        'kurskod',
        'titel',
        'lokalnamn',
        'kartlänk',
        'campus',
        'antaldatorer',
    ]
    const extraRows: string[] = []
    Object.entries(data).forEach(([key, value]) => {
        if (knownKeys.includes(key)) return
        extraRows.push(`${fromCamelCase(key)}: ${value?.join(', ')}`)
    })
    extraRows.sort()

    const description = [activityRow, courseRow, classRow, mapRow, ...extraRows]
        .filter(row => row !== null)
        .join('\n')

    return description === ''
        ? (context?.getDescription() ?? null)
        : description
}

export function formatLocation(
    data: TimeEditEventData,
    context?: CalendarEvent
): string | null {
    if (data.titel && data.titel[0].includes('utanför Hubben')) {
        return 'Utanför Hubben'
    }

    const rooms = data.lokalnamn
    const campuses = data.campus

    // Edge cases for incomplete data
    if (!rooms || !campuses) {
        if (rooms) return rooms.join(', ')
        if (campuses) return campuses.join(', ')
        return context?.getLocation() ?? null
    }

    if (rooms.length !== campuses.length) {
        // Array lengths are mismatched. Campus of each room cannot be inferred with confidence.
        const uniqueCampuses: string[] = []
        campuses.forEach(campus => {
            if (!uniqueCampuses.includes(campus)) uniqueCampuses.push(campus)
        })
        return `${rooms.join(', ')} (${uniqueCampuses.join(', ')})`
    }

    // Group rooms by campus
    const groupedRooms: { [k: string]: string[] } = {}
    const orderedCampuses: string[] = []
    rooms.forEach((room, i) => {
        const campus = campuses[i] ?? campuses[0]
        if (!groupedRooms[campus]) groupedRooms[campus] = []
        groupedRooms[campus].push(room)

        if (!orderedCampuses.includes(campus)) orderedCampuses.push(campus)
    })

    return orderedCampuses
        .map(campus => groupedRooms[campus].join(', ') + ` (${campus})`)
        .join('. ')
}

export function formatCourse(data: TimeEditEventData): string | null {
    const courseNamePart = data.kursnamn ? data.kursnamn[0] : null
    const joinedCourseCodes = data.kurskod
        ?.map(code => shortenCourseCode(code))
        .join(', ')
    const courseCodesPart = joinedCourseCodes
        ? courseNamePart
            ? `(${joinedCourseCodes})`
            : joinedCourseCodes
        : null
    const course = [courseNamePart, courseCodesPart]
        .filter(part => part !== null)
        .join(' ')

    return course === '' ? null : course
}

export function parseEventData(event: CalendarEvent): TimeEditEventData {
    const summary = event.getSummary()
    const location = event.getLocation()
    const sources = [summary, location].filter(s => s !== undefined)
    return parseEventDataString(...sources)
}

