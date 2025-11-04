// Remove 'optional' attributes from a type's properties
export type Concrete<Type> = {
    [Property in keyof Type]-?: Type[Property]
}

export interface PickerCalendar {
    filename: string
    id: number
    order?: number
    category?: string
    hidden?: boolean
}

export interface Picker {
    calendars: PickerCalendar[]
}

export interface Redirects {
    [x: string]: string
}

export interface CalendarNameResponse {
    name: string
}

export class ErrorResponse extends Error {
    status: number
    constructor(status: number, message: string) {
        super(message)
        this.status = status
    }
}

export interface UrlResponse {
    id: string
    url: string
    extra?: object
}
