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

export function toIcalObject(calendar: Calendar): IcalObject {
    return {
        // @ts-ignore
        VCALENDAR: [calendar],
    }
}

function deepCopy<T extends object>(object: T): T {
    return JSON.parse(JSON.stringify(object))
}

export function mergeCalendars(calendars: Calendar[], appendOriginName: boolean = false): Calendar {
    const base: Calendar = deepCopy(calendars[0])
    const names = [base['X-WR-CALNAME']]
    if (appendOriginName) {
        base.VEVENT.forEach(e => {
            e.SUMMARY += ' - ' + base['X-WR-CALNAME']
        })
    }
    for (const calendar of calendars.slice(1)) {
        names.push(calendar['X-WR-CALNAME'])
        base.VEVENT = base.VEVENT.concat(
            calendar.VEVENT.map(e => {
                const newEvent = deepCopy(e)
                if (appendOriginName) {
                    newEvent.SUMMARY += ' - ' + calendar['X-WR-CALNAME']
                }
                return newEvent
            })
        )
    }
    base['X-WR-CALNAME'] = names.join("+")
    return base
}

export function mergeCalendarsIcal(calendars: IcalObject[], appendOriginName: boolean = false): IcalObject {
    const calendar: Calendar = mergeCalendars(
        calendars.map(c => getMainCalendar(c)).filter(c => c !== undefined),
        appendOriginName
    )
    return toIcalObject(calendar)
}
