import { CalendarEvent } from 'iamcal'

export default class FilteredSlicer {
    filters: Filter[]

    constructor(filters: Filter[] = []) {
        this.filters = filters
    }

    /**
     * Split events into groups based on the first filter they hit.
     * @param events The events to group
     * @returns An array of grouped events. There will be one for every filter on this slicer, and an extra at the end for the events that matches no filter.
     */
    apply(events: CalendarEvent[]): FilteredEventGroup[] {
        const pool = [...events]
        const groups: FilteredEventGroup[] = []
        this.filters.forEach(filter => {
            const matches: CalendarEvent[] = []
            for (let i = 0; i < pool.length; i++) {
                const event = pool[i]
                if (filter.test(event)) {
                    matches.push(event)
                    // Remove event from pool
                    pool.splice(i, 1)
                    i--
                }
            }
            groups.push({
                filter: filter,
                events: matches,
            })
        })
        groups.push({
            filter: null,
            events: pool,
        })
        return groups
    }

    serialize(): string {
        return this.filters.map(filter => filter.serialize()).join('')
    }

    static fromSerialized(serialized: string): FilteredSlicer {
        const serializedFilters: string[] = []

        let parenthesisDepth = 0
        let chars: string[] = []
        for (const char of serialized) {
            chars.push(char)
            if (char === '(') {
                parenthesisDepth++
            } else if (char === ')') {
                parenthesisDepth--
                if (parenthesisDepth === 0) {
                    // Reached the end of this
                    serializedFilters.push(chars.join(''))
                    chars = []
                }
            }
        }

        const filters = serializedFilters.map(Filter.fromSerialized)
        return new FilteredSlicer(filters)
    }
}

/** Represents events that have been grouped by a filter. */
export type FilteredEventGroup = {
    /**
     * The filter that these events hit.
     * A `null` filter means that these events hit no filter.
     */
    filter: Filter | null
    events: CalendarEvent[]
}

export const FilterModes = {
    SUMMARY_INCLUDES: 0,
    SUMMARY_STARTS_WITH: 1,
} as const
export const OPTIONS_DIVIDER = '.-'

export class Filter {
    private mode: number
    private options: readonly string[]

    constructor(mode: number, ...options: string[]) {
        mode = Math.floor(mode)
        if (mode < 0 || isNaN(mode))
            throw new Error('Invalid filter mode, must be a positive number')
        if (mode >= Object.keys(FilterModes).length)
            throw new Error(`Unknown filter mode ${mode}`)
        this.mode = mode

        options.forEach(option => {
            if (option.includes(OPTIONS_DIVIDER)) {
                throw new Error(
                    `Filter options may not contain the options divider '${OPTIONS_DIVIDER}'`
                )
            }
            if (/[?&/]/.test(option)) {
                throw new Error(
                    `Filter options may not contain protected characters '?', '&' or '/'`
                )
            }
        })
        this.options = options
    }

    getMode() {
        return this.mode
    }

    getOptions() {
        return [...this.options]
    }

    serialize(): string {
        return `${this.mode}(${this.options.join(OPTIONS_DIVIDER)})`
    }

    static fromSerialized(serialized: string): Filter {
        const optionsStart = serialized.indexOf('(') + 1
        const optionsEnd = serialized.length - 1

        const mode = parseInt(serialized.substring(0, optionsStart - 1))
        const serializedOptions = serialized.substring(optionsStart, optionsEnd)

        const options =
            serializedOptions === ''
                ? []
                : serializedOptions.split(OPTIONS_DIVIDER)

        return new Filter(mode, ...options)
    }

    /**
     * Check if an event matches this filter.
     * @param event The event to check.
     * @returns Whether or not the event matches this filter.
     */
    test(event: CalendarEvent): boolean {
        switch (this.mode) {
            case FilterModes.SUMMARY_INCLUDES:
                return this.testSummaryIncludes(event)
            case FilterModes.SUMMARY_STARTS_WITH:
                return this.testSummaryStartsWith(event)
        }
        return false
    }

    testSummaryIncludes(event: CalendarEvent): boolean {
        return !!event.getSummary()?.includes(this.options[0]!)
    }

    testSummaryStartsWith(event: CalendarEvent): boolean {
        return !!event.getSummary()?.startsWith(this.options[0]!)
    }
}
