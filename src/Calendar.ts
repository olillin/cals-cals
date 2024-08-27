import { IcalObject } from 'ical2json'

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

export type ProductIdentifier = String
export type Version = String
export type CalendarScale = String
export type Method = String

export type WrCalendarName = String
export type WrTimeZone = String
export type WrCalendarDescription = String

export interface Event {
    UID: String
    DTSTAMP: DateTimeString
    DTSTART?: DateTimeString
    DTEND?: DateTimeString
    DESCRIPTION?: String
    CREATED?: DateTimeString
    'LAST-MODIFIED'?: DateTimeString
    LOCATION?: String
    SEQUENCE?: String
    STATUS?: String
    SUMMARY?: String
}

export type DateTimeString = String

export function getMainCalendar(calendar: IcalObject): Calendar | undefined {
    if (!('VCALENDAR' in calendar) || (calendar['VCALENDAR'] as Array<any>).length == 0) {
        return undefined
    }
    return calendar.VCALENDAR[0] as unknown as Calendar
}
