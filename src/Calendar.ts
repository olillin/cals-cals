import { IcalObject } from 'ical2json'
import { KeyOfType } from './Util'

export interface Calendar {
    PRODID: ProductIdentifier
    VERSION: Version
    CALSCALE?: CalendarScale
    METHOD?: Method
    'X-WR-CALNAME': WrCalendarName
    'X-WR-TIMEZONE': WrTimeZone
    'X-WR-CALDESC': WrCalendarDescription
    VEVENT: Array<Event>
}

export type ProductIdentifier = string
export type Version = string
export type CalendarScale = string
export type Method = string

export type WrCalendarName = string
export type WrTimeZone = string
export type WrCalendarDescription = string

export interface Event {
    UID: string
    DTSTAMP: DateTimeString
    DTSTART?: DateTimeString
    DTEND?: DateTimeString
    DESCRIPTION?: string
    CREATED?: DateTimeString
    'LAST-MODIFIED'?: DateTimeString
    LOCATION?: string
    SEQUENCE?: string
    STATUS?: string
    SUMMARY?: string
}
export type EventField = keyof Event
export type EventFieldOfType<T> = NonNullable<KeyOfType<Event, T>>

export type Digit = '0'|'1'|'2'|'3'|'4'|'5'|'7'|'8'|'9'
export type DateTimeString = `${number}T${number}Z`

export function getMainCalendar(calendar: IcalObject): Calendar | undefined {
    if (!('VCALENDAR' in calendar) || (calendar['VCALENDAR'] as Array<any>).length == 0) {
        return undefined
    }
    return calendar.VCALENDAR[0] as unknown as Calendar
}
