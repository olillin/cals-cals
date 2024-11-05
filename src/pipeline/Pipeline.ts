import { Calendar, Event, EventFieldOfType } from '../Calendar'
import { toPercentCode } from '../PipelineRegistry';
import { KeyOfType } from '../Util'

export abstract class CalendarSource<P> {
    params: P
    constructor(params: P) {
        this.params = params
    }
    abstract getCalendar(): Calendar
}

export abstract class AsyncCalendarSource<P> {
    params: P
    constructor(params: P) {
        this.params = params
    }
    abstract getCalendar(): Promise<Calendar>
}

/** Defines a step in a `Pipeline`. */
export abstract class PipelineStep<P> {
    params: P
    constructor(params: P) {
        this.params = params
    }
}

export abstract class CalendarModification<P> {
    params: P
    constructor(params: P) {
        this.params = params
    }
    abstract modify(calendar: Calendar): Calendar
}

export abstract class EventModification<P> {
    params: P
    constructor(params: P) {
        this.params = params
    }
    abstract modify(event: Event): Event
}

export interface FieldModificationParams<F> {
    field: EventFieldOfType<F | undefined>
}
export abstract class FieldModification<P extends FieldModificationParams<F>, F> extends EventModification<P> {
    modify(event: Event): Event {
        const fieldText = event[this.params.field] as F
        const newEvent = Object.assign({}, event)
        //@ts-ignore
        newEvent[this.params.field] = this.modifyField(fieldText, this.params)
        return newEvent
    }
    abstract modifyField(text: F): F
}

export abstract class EventFilter<P> {
    abstract params: P
    abstract filter(event: Event): boolean
}

export type Pipeline = Array<PipelineStep<any>>

export function applyPipeline(calendar: Calendar, pipeline: Pipeline): Promise<Calendar> {
    let cal: Calendar = Object.assign({}, calendar)
    return new Promise(async (resolve, reject) => {
        pipeline.forEach(step => {
            // Process step
            if (step instanceof CalendarModification) {
                cal = step.modify(cal)
            } else if (step instanceof EventModification) {
                let events = cal.VEVENT
                let modifiedEvents = events.map(event => step.modify(event))
                cal.VEVENT = modifiedEvents
            } else {
                reject(`Unknown pipeline step: ${step}`)
            }
        })
        resolve(cal)
    })
}
