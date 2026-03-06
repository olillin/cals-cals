import { Calendar, Component, deserializeComponentString } from 'iamcal'

/**
 * Copy a calendar component.
 * @param component The component to copy.
 * @returns The deeply copied calendar.
 */
export function deepCopy<T extends Component>(component: T): T {
    const copied = deserializeComponentString(component.serialize())
    return new (component.constructor as { new (component: Component): T })(
        copied
    )
}

/**
 * Merge multiple calendars together into a single calendar.
 * @param calendars The calendars to merge.
 * @param appendOriginName If the name of the calendar should be appended to the event name before merging.
 * @returns The merged calendar.
 */
export function mergeCalendars(
    calendars: Calendar[],
    appendOriginName: boolean = false
): Calendar {
    const base: Calendar = deepCopy(calendars[0])

    const names: string[] = []
    const descriptions: string[] = []

    const baseName = base.getCalendarName()
    if (baseName) {
        names.push(baseName)
    }
    const baseDescription = base.getCalendarDescription()
    if (baseDescription) {
        const prefix = baseName ? baseName + ': ' : ''
        descriptions.push(prefix + baseDescription)
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
        const calendarDescription = calendar.getCalendarDescription()
        if (calendarDescription) {
            const prefix = calendarName ?? 'Unnamed'
            descriptions.push(prefix + ': ' + calendarDescription)
        }

        base.components.push(
            ...calendar
                .getEvents()
                .map(event => {
                    try {
                        const newEvent = deepCopy(event)
                        if (appendOriginName && calendarName) {
                            newEvent.setSummary(
                                newEvent.getSummary() + ' - ' + calendarName
                            )
                        }
                        return newEvent
                    } catch (error) {
                        console.warn(
                            `Failed to add event ${event.getUid()} to merged calendar: ${String(error)}`
                        )
                        return undefined
                    }
                })
                .filter(e => e !== undefined)
        )
    }
    if (names.length > 0) {
        base.setCalendarName(names.join('+'))
    }
    if (descriptions.length > 1) {
        base.setCalendarDescription(descriptions.join('\n'))
    }
    return base
}
