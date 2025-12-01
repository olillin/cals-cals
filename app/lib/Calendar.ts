import {
    Calendar,
    CalendarEvent,
    Component,
    deserializeComponentString,
    parseCalendar,
} from 'iamcal'

export async function deepCopy<T extends Component>(component: T): Promise<T> {
    const copied = await deserializeComponentString(component.serialize())
    return new (component.constructor as { new (component: Component): T })(
        copied
    )
}

export async function mergeCalendars(
    calendars: Calendar[],
    appendOriginName: boolean = false
): Promise<Calendar> {
    const base: Calendar = await deepCopy(calendars[0])

    const names: string[] = []

    const baseName = base.getCalendarName()
    if (baseName) {
        names.push(baseName)
    }

    if (appendOriginName && baseName) {
        // Append calendar name to first calendar
        base.getEvents().forEach(e => {
            e.setSummary(e.getSummary() + ' - ' + baseName)
        })
    }

    for (const calendar of calendars.slice(1)) {
        const calendarName = calendar.getCalendarName()
        if (calendarName) {
            names.push(calendarName)
        }

        base.components.push(
            ...(
                await Promise.all(
                    calendar.getEvents().map(async event => {
                        try {
                            const newEvent = await deepCopy(event)
                            if (appendOriginName && calendarName) {
                                newEvent.setSummary(
                                    newEvent.getSummary() + ' - ' + calendarName
                                )
                            }
                            return newEvent
                        } catch (error) {
                            console.warn(
                                `Failed to add event ${event.getUid()} to merged calendar: ${error}`
                            )
                            return undefined
                        }
                    })
                )
            ).filter(e => e !== undefined)
        )
    }
    if (names.length > 0) {
        base.setCalendarName(names.join('+'))
    }
    return base
}

export async function mergeCalendarsText(
    calendars: string[],
    appendOriginName: boolean = false
): Promise<string> {
    const parsedCalendars: Calendar[] = await Promise.all(
        calendars.map(async c => await parseCalendar(c))
    )
    const calendar: Calendar = await mergeCalendars(
        parsedCalendars,
        appendOriginName
    )
    return calendar.serialize()
}
