import { CalendarEvent } from 'iamcal'
import { UrlResponse } from './responses'
import { capitalize } from './util'

// DO NOT CHANGE ORDER, WILL BREAK EXISTING CALENDAR URLS
export const groupByOptions = (<T extends keyof TimeEditEventData>(
    options: T[]
): T[] => options)([
    'aktivitet',
    'campus',
    'kurskod',
    'lokalnamn',
    'klasskod',
] as const)

/** An option to group calendar events by. */
export type GroupByOption = (typeof groupByOptions)[number]

export interface AvailableGroup {
    property: GroupByOption
    values: {
        [k: string]: string
    }
}

export interface TimeEditUrlExtras {
    groups: AvailableGroup[]
}

export interface TimeEditUrlResponse extends UrlResponse {
    extra: TimeEditUrlExtras
}

export interface TimeEditEventData {
    [k: string]: string[] | undefined
    aktivitet?: string[]
    klassnamn?: string[]
    klasskod?: string[]
    kursnamn?: string[]
    kurskod?: string[]
    titel?: string[]
    lokalnamn?: string[]
    kartlänk?: string[]
    campus?: string[]
    antaldatorer?: string[]
}

/**
 * Parse the TimeEdit event data from an event.
 * @param event The event from TimeEdit.
 * @returns The event data parsed from the event.
 */
export function parseEventData(event: CalendarEvent): TimeEditEventData {
    const summary = event.getSummary()
    const location = event.getLocation()
    const sources = [summary, location].filter(s => s !== undefined)
    return parseEventDataString(...sources)
}

/**
 * Parse the TimeEdit event data from text.
 * @param strings One or more strings to parse in TimeEdit format.
 * @returns The event data parsed from the string(s).
 * @example
 * parseEventDataString("Activity: Lab. Campus: Johanneberg")
 */
export function parseEventDataString(...strings: string[]): TimeEditEventData {
    const dataPairs = strings
        .flatMap(s =>
            Array.from(
                s.matchAll(
                    /([^:.,\s][^:.,\n]*?): (.+?)(?=(?:[,.] )?(?:[^:.,\s][^:.,\n]*?: |$))/gm
                )
            )
        )
        .map(match => [formatKey(match[1]), match[2].trim()])

    const groupedData: TimeEditEventData = dataPairs.reduce<{
        [k: string]: string[]
    }>((acc, [key, value]) => {
        if (!acc[key]) acc[key] = []
        if (
            !acc[key].includes(value) ||
            key === 'lokalnamn' ||
            key === 'campus'
        ) {
            acc[key].push(value)
        }
        return acc
    }, {})

    // Deduplicate rooms and compuses
    const rooms = groupedData['lokalnamn']
    const campuses = groupedData['campus']
    if (campuses !== undefined && new Set(campuses).size <= 1) {
        campuses.splice(1)
    }
    if (
        rooms === undefined ||
        campuses === undefined ||
        rooms.length !== campuses.length
    ) {
        return groupedData
    }

    // Delete all duplicate room and campus pairs from the end
    const toRemove: number[] = []
    for (let i = rooms.length - 1; i > 0; i--) {
        for (let j = i - 1; j >= 0; j--) {
            if (rooms[j] === rooms[i] && campuses[j] === campuses[i]) {
                toRemove.push(i)
                break
            }
        }
    }
    toRemove.forEach(i => {
        rooms.splice(i, 1)
        campuses.splice(i, 1)
    })

    return groupedData
}

const keyAlias = new Map<
    keyof TimeEditEventData & string,
    keyof TimeEditEventData & string
>()
keyAlias.set('activity', 'aktivitet')
keyAlias.set('coursecode', 'kurskod')
keyAlias.set('coursename', 'kursnamn')
keyAlias.set('computers', 'antaldatorer')
keyAlias.set('maplink', 'kartlänk')
keyAlias.set('classcode', 'klasskod')
keyAlias.set('name', 'klassnamn')
keyAlias.set('room', 'lokalnamn')

/**
 * Format a key in TimeEdit event data.
 * @param text The key to format.
 * @returns The formatted key.
 */
export function formatKey(text: string): string {
    const key = text.replaceAll(/\s/g, '').toLowerCase()
    return keyAlias.get(key) ?? key
}

/**
 * Shorten the course code by removing the course occasion code.
 * @param code The long course code.
 * @returns The sortened course code.
 */
export function shortenCourseCode(code: string): string {
    return code.split('_')[0]
}

/**
 * Create an event summary from TimeEdit event data.
 * @param data The parsed event data.
 * @param context The original event as context.
 * @returns The event summary or null if there is no summary.
 */
export function createEventSummary(
    data: TimeEditEventData,
    context?: CalendarEvent
): string | null {
    if (data.titel) {
        return data.titel.join(', ')
    }

    const coursePart = formatCourse(data)
    const activityPart = data.aktivitet
        ? `${data.aktivitet.join(', ')}${coursePart !== null ? ':' : ''}`
        : null

    const summary = [activityPart, coursePart]
        .filter(part => part !== null)
        .join(' ')

    return summary === '' ? (context?.getSummary() ?? null) : summary
}

/**
 * Create an event description from TimeEdit event data.
 * @param data The parsed event data.
 * @param context The original event as context.
 * @returns The event description or null if there is no description.
 */
export function createEventDescription(
    data: TimeEditEventData,
    context?: CalendarEvent
): string | null {
    const activityRow = data.aktivitet
        ? `Aktivitet: ${data.aktivitet[0]}`
        : null
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
        'aktivitet',
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
        extraRows.push(`${capitalize(key)}: ${value?.join(', ')}`)
    })
    extraRows.sort()

    const description = [activityRow, courseRow, classRow, mapRow, ...extraRows]
        .filter(row => row !== null)
        .join('\n')

    return description === ''
        ? (context?.getDescription() ?? null)
        : description
}

/**
 * Create an event location from TimeEdit event data.
 * @param data The parsed event data.
 * @param context The original event as context.
 * @returns The event location or null if there is no location.
 */
export function createEventLocation(
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

/**
 * Format information about the course from TimeEdit event data.
 * @param data The event data.
 * @returns The course information or null if there is none.
 */
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
