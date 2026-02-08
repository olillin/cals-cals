import { CalendarEvent } from 'iamcal'
import type { UrlResponse } from './responses'
import { capitalize } from './util'
import { searchExam, type Exam } from 'chalmers-search-exam'

// DO NOT CHANGE ORDER, WILL BREAK EXISTING CALENDAR URLS
export const groupByOptions = (<T extends keyof TimeEditEventData>(
    options: T[]
): T[] => options)([
    'activity',
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
    activity?: string[]
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

/**
 * Format a key in TimeEdit event data.
 * @param text The key to format.
 * @returns The formatted key.
 */
export function formatKey(text: string): string {
    const key = text.replaceAll(/\s/g, '').toLowerCase()
    if (key === 'aktivitet') return 'activity'
    return key
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
    const activityPart = data.activity
        ? `${data.activity.join(', ')}${coursePart !== null ? ':' : ''}`
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

/**
 * Create exams events from a list of course codes.
 *
 * Exams with multiple course codes will be de-duplicated. If the course has
 * multiple exams they will all be included.
 *
 * @param courseCodes The course codes for all events to create.
 * @returns The converted events.
 */
export async function createExamEvents(
    groupedCourseCodes: string[][]
): Promise<CalendarEvent[]> {
    const exams = await findExams(groupedCourseCodes.flat())
    const multiExams = deDuplicateExams(exams, groupedCourseCodes)
    const events = multiExams.map(createExamEvent)
    return events
}

/**
 * An exam that may have several courses attached.
 */
export interface MultiExam extends Exam {
    courseCodes: string[]
}

/**
 * Finds all exams for a set of course codes.
 *
 * If an error occurs while searching all other exams will be returned.
 * @param courseCodes The courses to find exams for.
 * @returns A list of exams.
 */
export async function findExams(courseCodes: string[]): Promise<Exam[]> {
    return (
        await Promise.all(
            courseCodes.map(async courseCode => {
                return searchExam(courseCode).catch(reason => {
                    console.error(
                        `Failed to get exam for ${courseCode}: ${reason}`
                    )
                    return null
                })
            })
        )
    )
        .flat()
        .filter(maybeExam => maybeExam !== null)
}

/**
 * Join duplicate exams for the same course into one multi-exam.
 * @param exams The exams to deduplicate.
 * @param groupedCourseCodes Lists of course codes that belong to the same course, must not contain duplicates.
 * @returns The de-duplicated multi-exams.
 */
export function deDuplicateExams(
    exams: Exam[],
    groupedCourseCodes: string[][]
): MultiExam[] {
    // Create a map to easily look up which other course codes are in a group.
    const courseCodeMap = new Map<string, string[]>()
    groupedCourseCodes.forEach(courseCodeGroup => {
        courseCodeGroup.forEach(courseCode => {
            courseCodeMap.set(courseCode, courseCodeGroup)
        })
    })

    const multiExamMap = new Map<string, MultiExam[]>()
    const multiExams: MultiExam[] = []
    exams.forEach(exam => {
        const courseCodes = courseCodeMap.get(exam.courseCode)
        let multiExam: MultiExam
        if (courseCodes === undefined) {
            multiExam = Object.assign({ courseCodes: [exam.courseCode] }, exam)
        } else {
            multiExam = Object.assign({ courseCodes: courseCodes }, exam)
        }

        const key = courseCodes !== undefined ? courseCodes[0] : exam.courseCode
        const list = multiExamMap.get(key)
        if (list === undefined) {
            multiExamMap.set(key, [multiExam])
            multiExams.push(multiExam)
            return
        }

        const alreadyAdded =
            list.filter(
                m =>
                    m.id === multiExam.id ||
                    m.start.toISOString() === multiExam.start.toISOString()
            ).length > 0
        if (!alreadyAdded) {
            list.push(multiExam)
            multiExams.push(multiExam)
        }
    })

    return multiExams
}

const baseExamScheduleUrl: string =
    'https://cloud.timeedit.net/chalmers/web/public'
const johannebergExamScheduleUrl: string = baseExamScheduleUrl + '/ri1Q4.html'
const lindholmenExamScheduleUrl: string = baseExamScheduleUrl + '/ri1Q3.html'

export function getExamLocationUrl(location: string): string {
    const atJohanneberg = location.toLowerCase().includes('johanneberg')
    const atLindholmen = location.toLowerCase().includes('lindholmen')
    if (atJohanneberg && !atLindholmen) {
        return johannebergExamScheduleUrl
    } else if (atLindholmen && !atJohanneberg) {
        return lindholmenExamScheduleUrl
    } else {
        return baseExamScheduleUrl
    }
}

export function isoDateString(date: Date): string {
    return (
        date.getFullYear() +
        '-' +
        date.getMonth().toString().padStart(2, '0') +
        '-' +
        date.getDate().toString().padStart(2, '0')
    )
}

export function createExamEvent(exam: MultiExam): CalendarEvent {
    const locationUrl = getExamLocationUrl(exam.location)
    return new CalendarEvent(exam.id, exam.updated, exam.start)
        .setEnd(exam.end)
        .setLocation(`Campus: ${exam.location}`)
        .setSummary(
            `Aktivitet: Tentamen. Kurskod: ${exam.courseCodes.join(', ')}. Kursnamn: ${exam.name}. Registrering: ${isoDateString(exam.registrationStart)} - ${isoDateString(exam.registrationEnd)}`
        )
        .setProperty('URL', locationUrl)
}

/**
 * Create a pair of events for the start and end of the registration period.
 * @param The exam to create events from.
 * @returns The two events at the start and end of the registration period.
 */
export function createExamRegisterEvents(exam: Exam): CalendarEvent[] {
    return []
}
