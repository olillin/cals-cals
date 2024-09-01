import { Calendar, Event, EventField, EventFieldOfType } from '../Calendar'
import { EventFilter } from './Pipeline'

interface SubtractFilterParams {
    subtractCalendar: Calendar
    ignoreFields?: Set<EventField>
}
class SubtractFilter extends EventFilter<SubtractFilterParams> {
    params: SubtractFilterParams
    constructor(params: SubtractFilterParams) {
        super()
        this.params = params
    }
    filter(event: Event): boolean {
        const subtractCalendarEvents = this.params.subtractCalendar.VEVENT
        const ignoreFields = this.params.ignoreFields ?? new Set()

        function removeIgnoredFields(event: Event): object {
            return Object.fromEntries(
                (Object.entries(event) as [EventField, any])
                    .filter(entry => ignoreFields.has(entry[0]))
            )
        }

        const compare = JSON.stringify(removeIgnoredFields(event))
        for (let subtractEvent of subtractCalendarEvents) {
            const compareSubtract = JSON.stringify(removeIgnoredFields(subtractEvent))
            if (compare == compareSubtract) {
                return false
            }
        }
        return true
    }
}

interface FieldMatchFilterParams {
    field: EventFieldOfType<string | undefined>
    query: string
    mode: 'CONTAINS' | 'STARTS_WITH' | 'ENDS_WITH' | 'EQUALS'
}
class FieldMatchFilter extends EventFilter<FieldMatchFilterParams> {
    params: FieldMatchFilterParams
    constructor(params: FieldMatchFilterParams) {
        super()
        this.params = params
    }
    filter(event: Event): boolean {
        let text: string | undefined = event[this.params.field]
        if (!text) {
            return false
        }

        switch (this.params.mode) {
            case 'CONTAINS':
                return text.includes(this.params.query)
            case 'STARTS_WITH':
                return text.startsWith(this.params.query)
            case 'ENDS_WITH':
                return text.endsWith(this.params.query)
            case 'EQUALS':
                return text === this.params.query
        }
    }
}
