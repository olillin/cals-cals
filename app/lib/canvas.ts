import { CalendarEvent } from 'iamcal'
import { capitalizeWords } from './util'

// DO NOT CHANGE ORDER, WILL BREAK EXISTING CALENDAR URLS
export const canvasGroupByOptions = ['type', 'coursecode'] as const
/** An option to group calendar events by. */
export type CanvasGroupByOption = (typeof canvasGroupByOptions)[number]

/**
 * Create the URL to the assignment page this event refers to.
 * @param event The event from Canvas.
 * @returns The URL if course ID and assignment ID could be identified, otherwise null.
 */
export function createAssignmentUrl(event: CalendarEvent): URL | null {
    // Find course ID
    const urlProp = event.getProperty('URL')?.value
    const courseId = urlProp?.match(/(?<=\bcourse_)\d{5}\b/)?.[0]
    if (!courseId) return null

    // Find assignment ID
    let assignmentId = urlProp.match(/(?<=\bassignment_)\d{6}\b/)?.[0]
    if (!assignmentId) {
        const uidProp = event.getUid()
        assignmentId = uidProp.match(/(?<=assignment-)\d{6}$/)?.[0]

        if (!assignmentId) return null
    }

    return new URL(
        `https://canvas.chalmers.se/courses/${courseId}/assignments/${assignmentId}`
    )
}

/**
 * Get the type of the Canvas event.
 * @param event The event from Canvas.
 * @returns The event type from the UID or null if an unexpected format. For example "assignment" or "calendar-event".
 */
export function getEventType(event: CalendarEvent): string | null {
    const typePattern = /(?<=^event-).+(?=-\d)/
    const match = event.getUid().match(typePattern)
    if (!match) {
        return null
    }
    return match[0]
}

/**
 * Get the course codes of the Canvas event.
 * @param event The event from Canvas.
 * @returns The course codes from the event summary.
 */
export function getCourseCodes(event: CalendarEvent): string[] {
    const pattern = /(?<=\[).*?(?=\]$)/
    const match = event.getSummary()?.match(pattern)
    if (!match) return []
    return match[0]
        .split('/')
        .map(code => code.trim())
        .filter(code => code !== '')
}

/**
 * Get the rich description of the calendar event.
 * @param event The event from Canvas.
 * @returns The `X-ALT-DESC` property value.
 */
export function getRichDescription(event: CalendarEvent): string | null {
    const altDesc = event.getProperty('X-ALT-DESC')
    if (altDesc === null) return null
    const formatType = altDesc.getFormatType()
    if (formatType !== 'text/html') {
        console.warn(
            `X-ALT-DESC format type is invalid, expected "text/html" but got ${formatType}`
        )
        return null
    }
    return altDesc.value
}

/**
 * Format the event type of a Canvas event.
 * @param type The event type to format.
 * @returns The type as capitalized words joined by spaces.
 */
export function formatEventType(type: string): string {
    return capitalizeWords(type.replace('-', ' '))
}
