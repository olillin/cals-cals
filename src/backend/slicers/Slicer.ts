import { Calendar, CalendarEvent } from 'iamcal'

interface Slicer<T extends EventGroup> {
    /**
     * Split events into groups.
     * @param events The events to group.
     * @returns An array of grouped events.
     */
    groupEvents(events: CalendarEvent[]): T[]

    /**
     * Get the group of events at the specified index.
     * @param events The events to group.
     * @param index The index of the group to get.
     */
    getGroup(events: CalendarEvent[], index: number): T

    /**
     * Check which group a slicer would put this event in.
     * @param event The event to check.
     * @returns The index of the group the event belongs to.
     */
    checkGroup(event: CalendarEvent): number
}
export default Slicer

/**
 * Represents a group of events after having been run through a {@link Slicer}.
 *
 * May contain additional metadata depending on the type of slicer.
 */
export interface EventGroup {
    /** The events in this group. */
    events: CalendarEvent[]
}

/**
 * Convert a calendar to a calendar containing only events from the specified
 * group(s).
 *
 * Replaces the events in {@link calendar} with the ones in the group(s).
 *
 * @param calendar The calendar to modify.
 * @param slicer The slicer to use.
 * @param groupMask A bitmask of the groups to include events from where the smallest bit is the first group.
 */
export function useSlicer(
    calendar: Calendar,
    slicer: Slicer<any>,
    groupMask: number
): void {
    // The events to include in the new calendar.
    const events: CalendarEvent[] = []
    calendar.getEvents().forEach(event => {
        const group = slicer.checkGroup(event)
        const includeEvent = (groupMask | (1 << group)) !== 0
        if (includeEvent) events.push(event)
    })

    calendar.components = events

    // Append group mask to calendar name
    calendar.setCalendarName(
        (calendar.getCalendarName()?.concat(' ') ?? '') +
            `#${groupMask.toString(16)}`
    )
}
