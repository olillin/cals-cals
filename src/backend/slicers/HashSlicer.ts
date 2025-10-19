import { CalendarEvent } from 'iamcal'
import Slicer, { EventGroup } from './Slicer'

/**
 * Slices events into groups based on a given hash function. Events that give
 * the same output when run through the function modulo the size of the slicer
 * will be in the same group.
 */
export default class HashSlicer implements Slicer<HashEventGroup> {
    hash: (event: CalendarEvent) => number
    size: number

    constructor(hash: (event: CalendarEvent) => number, size: number) {
        this.hash = hash
        this.size = size
    }

    groupEvents(events: CalendarEvent[]): HashEventGroup[] {
        // Create empty groups
        const groups: HashEventGroup[] = new Array(this.size)
        for (let i = 0; i < this.size; i++) {
            groups[i] = {
                hash: i,
                events: [],
            }
        }

        // Slice events into groups
        events.forEach(event => {
            const index = Math.abs(this.hash(event) % this.size)
            groups[index].events.push(event)
        })

        return groups
    }

    getGroup(events: CalendarEvent[], index: number): HashEventGroup {
        return this.groupEvents(events)[index]
    }
}

export interface HashEventGroup extends EventGroup {
    /** The value of the hash. */
    hash: number
}
