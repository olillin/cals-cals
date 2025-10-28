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
