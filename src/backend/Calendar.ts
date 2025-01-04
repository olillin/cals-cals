import { Calendar, CalendarEvent, Component } from 'iamcal'
import { deserializeString, parseCalendar } from 'iamcal/parse'

export type ProductIdentifier = String
export type Version = String
export type CalendarScale = String
export type Method = String

export type WrCalendarName = String
export type WrTimeZone = String
export type WrCalendarDescription = String

async function deepCopy<T extends Component>(component: T): Promise<T> {
    const copied = await deserializeString(component.serialize())
    return new (component.constructor as { new (component: Component): T })(copied)
}

export async function mergeCalendars(calendars: Calendar[], appendOriginName: boolean = false): Promise<Calendar> {
    const base: Calendar = await deepCopy(calendars[0])

    const baseName = base.getProperty('X-WR-CALNAME')!.value
    const names = [baseName]

    if (appendOriginName) {
        // Append calendar name to first calendar
        base.events().forEach(e => {
            e.setSummary(e.summary() + ' - ' + baseName)
        })
    }

    for (const calendar of calendars.slice(1)) {
        const calendarName = calendar.getProperty('X-WR-CALNAME')!.value
        names.push(calendarName)

        base.components.push(
            ...(await Promise.all(
                calendar.events().map(async e => {
                    const newEvent = (await deepCopy(e)) as unknown as CalendarEvent
                    if (appendOriginName) {
                        newEvent.setSummary(newEvent.summary() + ' - ' + calendarName)
                    }
                    return newEvent
                })
            ))
        )
    }
    base.setProperty('X-WR-CALNAME', names.join('+'))
    return base
}

export async function mergeCalendarsText(calendars: string[], appendOriginName: boolean = false): Promise<string> {
    const parsedCalendars: Calendar[] = await Promise.all(calendars.map(async c => await parseCalendar(c)))
    const calendar: Calendar = await mergeCalendars(parsedCalendars, appendOriginName)
    return calendar.serialize()
}
