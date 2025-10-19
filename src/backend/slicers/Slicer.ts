import { CalendarEvent } from 'iamcal'

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
