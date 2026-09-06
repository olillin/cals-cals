import Adapter, { AdapterContext } from './Adapter'
import { Calendar, CalendarEvent } from 'iamcal'
import {
    AvailableGroup,
    GroupedUrlExtras,
    parseAllowedValues,
    parseGroupBy,
    prepareSetForComparison,
} from '../group'
import Slicer, { applySlicer, EventGroup } from '../slicer/Slicer'
import {
    CanvasGroupByOption,
    canvasGroupByOptions,
    createAssignmentUrl,
    formatEventType,
    getCourseCodes,
    getEventType,
    getRichDescription,
} from '../canvas'
import HashSlicer from '../slicer/HashSlicer'

export default class CanvasAdapter extends Adapter {
    override createUrl(id: string): URL {
        return new URL(`https://canvas.chalmers.se/feeds/calendars/${id}.ics`)
    }

    override getId(url: URL): string {
        const urlPattern =
            /(?<=^https:\/\/canvas\.chalmers\.se\/feeds\/calendars\/)user_[A-Za-z0-9]{40}(?=\.ics$)/
        const match = urlPattern.exec(url.href)
        if (!match) {
            throw new Error('Invalid URL')
        }

        return match[0]
    }

    override convertCalendar(
        calendar: Calendar,
        context?: AdapterContext
    ): Calendar {
        if (context?.req?.nextUrl.searchParams.get('group')) {
            const groupBy = parseGroupBy(context.req)
            const allowedValues = parseAllowedValues(context.req)
            const slicer = createGroupSlicer(groupBy, allowedValues)

            // Include only the group which has events with the included values
            const mask = 0b10
            applySlicer(calendar, slicer, mask)
        }

        const plainDescription =
            context?.req != undefined &&
            ['1', 'true', 't'].includes(
                context.req.nextUrl.searchParams.get('plain') ?? '0'
            )

        calendar.getEvents().forEach(event => {
            convertEvent(event, {
                plainDescription,
            })
        })

        return calendar
    }

    override getExtras(
        calendar: Calendar
    ): GroupedUrlExtras<CanvasGroupByOption> {
        const groups: AvailableGroup<CanvasGroupByOption>[] =
            canvasGroupByOptions.map(option => ({
                property: option,
                propertyIndex: canvasGroupByOptions.indexOf(option),
                values: {},
            }))

        calendar.getEvents().forEach(event => {
            // For each groupable property name
            for (let i = 0; i < canvasGroupByOptions.length; i++) {
                const property = canvasGroupByOptions[i]
                const eventValue = createEventValueGetter(property)(event)

                if (eventValue) {
                    // Event has property
                    const key = prepareSetForComparison(eventValue)
                    const prettyValues =
                        property === 'type'
                            ? eventValue.map(formatEventType)
                            : eventValue
                    groups[i].values[key] = prettyValues.join(', ')
                } else {
                    // Event does not have property
                    groups[i].values['_'] = ''
                }
            }
        })

        const extras: GroupedUrlExtras<CanvasGroupByOption> = {
            name: calendar.getCalendarName(),
            groups: groups,
        }

        return extras
    }
}

/**
 * Update a Canvas event to follow the adapter format.
 * @param event The event from Canvas.
 * @param options The options for how to convert the effect.
 */
export function convertEvent(
    event: CalendarEvent,
    options?: { plainDescription: boolean }
): void {
    const richDescription = options?.plainDescription
        ? null
        : getRichDescription(event)
    let description = options?.plainDescription
        ? event.getDescription()
        : (richDescription ?? event.getDescription())

    const assignmentUrl = createAssignmentUrl(event)
    if (assignmentUrl) {
        const prefix = 'Assignment on Canvas: ' + assignmentUrl.href
        if (description) {
            description = prefix + '\n\n' + description
        } else {
            description = prefix
        }
    }

    if (description) {
        event.setDescription(description)
    }

    if (richDescription) {
        event.removePropertiesWithName('X-ALT-DESC')
    }
}

function createEventValueGetter(
    property: CanvasGroupByOption
): (event: CalendarEvent) => string[] | undefined {
    return property === 'type'
        ? (event: CalendarEvent) => {
              const type = getEventType(event)
              if (type === null) {
                  return undefined
              } else {
                  return [type]
              }
          }
        : (event: CalendarEvent) => {
              return getCourseCodes(event)
          }
}

/**
 * Create a slicer for a group.
 * @param groupBy The index of the property to group by in {@link groupByOptions}.
 * @param allowedValues The property values to include in the slicer.
 * @returns The new slicer.
 * @throws {Error} If {@link groupBy} does not refer to a valid property.
 */
export function createGroupSlicer(
    groupBy: number,
    allowedValues: Set<string>
): Slicer<EventGroup> {
    if (groupBy >= canvasGroupByOptions.length) {
        throw new Error(`Unknown group by option ${groupBy}.`)
    }
    const property = canvasGroupByOptions[groupBy]
    const getEventValue = createEventValueGetter(property)

    /**
     * This hash function returns 1 for events that have any of the allowed
     * values, and 0 otherwise.
     * @param event The event to hash.
     * @returns The hashed event.
     */
    const hash = (event: CalendarEvent): number => {
        const eventValue = getEventValue(event)
        if (eventValue == undefined) {
            // Match undefined represented by _
            return Number(allowedValues.has('_'))
        }
        const values = prepareSetForComparison(eventValue)
        return Number(allowedValues.has(values))
    }
    return new HashSlicer(hash, 2)
}
