import { Request } from 'express'
import { Calendar, CalendarEvent } from 'iamcal'
import Adapter from '../Adapter'
import HashSlicer from '../slicers/HashSlicer'
import Slicer, { EventGroup, useSlicer } from '../slicers/Slicer'

enum GroupByOptions {
    ACTIVITY = 0,
    CAMPUS = 1,
}

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

    convertCalendar(calendar: Calendar, req: Request): Calendar {
        const groupByString = req.query.group
        if (groupByString) {
            const index = getGroupIndex(req)
            const slicer = getGroupSlicer(req)

            useSlicer(calendar, slicer, index)
        }

        calendar.getEvents().forEach(event => convertEvent(event))
        return calendar
    }
}

function getGroupSlicer(req: Request): Slicer<EventGroup> {
    // Parse groupBy
    const groupByString = req.query.group
    if (groupByString === undefined)
        throw new Error(
            "Unable to get property to group by. Missing query parameter 'group'"
        )

    let groupBy: number
    try {
        groupBy = parseInt(String(groupByString))
    } catch {
        throw new Error(
            "Invalid query parameter 'group', must be a positive integer"
        )
    }
    if (groupBy < 0)
        throw new Error(
            "Invalid query parameter 'group', must be a positive integer"
        )

    switch (groupBy) {
        case GroupByOptions.ACTIVITY:
            return new HashSlicer(activityHash, 8)
        case GroupByOptions.CAMPUS:
            return new HashSlicer(campusHash, 4)
        default:
            throw new Error(`Unknown group by option ${groupBy}.`)
    }
}

function getGroupIndex(req: Request) {
    const serializedIndex = req.query.gi
    if (serializedIndex === undefined)
        throw new Error(
            "Unable to get group index. Missing query parameter 'gi'"
        )

    let index: number
    try {
        index = parseInt(String(serializedIndex))
    } catch {
        throw new Error(
            "Invalid query parameter 'gi', must be a positive integer"
        )
    }
    if (index < 0)
        throw new Error(
            "Invalid query parameter 'gi', must be a positive integer"
        )

    return index
}

function convertEvent(event: CalendarEvent) {
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

function formatSummary(
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

function formatDescription(
    data: TimeEditEventData,
    context?: CalendarEvent
): string | null {
    const activityRow = data.activity ? `Aktivitet: ${data.activity[0]}` : null
    const course = formatCourse(data)
    const courseRow = course ? `Kurs: ${course}` : null
    const classRow = data.klassKod ? 'Klass: ' + data.klassKod.join(', ') : null

    const url =
        data.kartlänk ??
        (context?.hasProperty('URL')
            ? [context.getProperty('URL')!.value]
            : null)

    const mapRow = url ? 'Karta: ' + url.join(', ') : null

    const knownKeys = [
        'activity',
        'klassNamn',
        'klassKod',
        'kursNamn',
        'kursKod',
        'titel',
        'lokalnamn',
        'kartlänk',
        'campus',
        'antalDatorer',
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

function formatLocation(
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

function formatCourse(data: TimeEditEventData): string | null {
    const courseNamePart = data.kursNamn ? data.kursNamn[0] : null
    const joinedCourseCodes = data.kursKod
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

function parseEventData(event: CalendarEvent): TimeEditEventData {
    const summary = event.getSummary()
    const location = event.getLocation()
    const sources = [summary, location].filter(s => s !== undefined)
    return parseEventDataString(...sources)
}

function parseEventDataString(...strings: string[]): TimeEditEventData {
    const dataPairs = strings
        .flatMap(s =>
            Array.from(
                s.matchAll(
                    /([^:.,\s][^:.,\n]*?): (.+?)(?=(?:[,.] )?(?:[^:.,\s][^:.,\n]*?:|$))/gm
                )
            )
        )
        .map(match => [toCamelCase(match[1].trim()), match[2].trim()])

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
    if (campuses && new Set(campuses).size <= 1) {
        campuses.splice(1)
    } else if (rooms && campuses && rooms.length === campuses.length) {
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
    }

    return groupedData
}

function toCamelCase(text: string): string {
    const words = text.split(' ')
    return (
        words[0].charAt(0).toLowerCase() +
        words[0].slice(1) +
        words
            .slice(1)
            .map(
                word =>
                    word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
            )
            .join('')
    )
}

function fromCamelCase(text: string): string {
    if (text.length <= 1) return text.toUpperCase()
    const words = text.split(/(?=[A-Z])/g).map((word, i) => {
        if (i === 0) {
            return word.charAt(0).toUpperCase() + word.substring(1)
        } else {
            return word.toLowerCase()
        }
    })

    return words.join(' ')
}

export interface TimeEditEventData {
    [k: string]: string[] | undefined
    activity?: string[]
    klassNamn?: string[]
    klassKod?: string[]
    kursNamn?: string[]
    kursKod?: string[]
    titel?: string[]
    lokalnamn?: string[]
    kartlänk?: string[]
    campus?: string[]
    antalDatorer?: string[]
}

function shortenCourseCode(code: string): string {
    return code.split('_')[0]
}
