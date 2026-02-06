import { Calendar, loadCalendarSync } from 'iamcal'
import { mergeCalendars } from '../../../app/lib/merge'
import { it, expect, beforeEach } from 'vitest'

let EMPTY_CALENDAR: Calendar
let EXAMPLE_CALENDAR_1: Calendar
let EXAMPLE_CALENDAR_2: Calendar

beforeEach(() => {
    EMPTY_CALENDAR = loadCalendarSync('tests/resources/empty.ics')
    EXAMPLE_CALENDAR_1 = loadCalendarSync('tests/resources/spam.ics')
    EXAMPLE_CALENDAR_2 = loadCalendarSync('tests/resources/foo.ics')
})

it('does nothing when merging a single calendar', () => {
    const calendar = EXAMPLE_CALENDAR_1
    const merged = mergeCalendars([calendar])
    expect(merged).toStrictEqual(calendar)
})

it('combines calendar names', () => {
    const base = EXAMPLE_CALENDAR_1
    const baseName = base.getCalendarName()
    const extra = EXAMPLE_CALENDAR_2
    const extraName = extra.getCalendarName()

    const merged = mergeCalendars([base, extra])
    const name = merged.getCalendarName()
    expect(name).toBe(baseName + '+' + extraName)
})

it('returns the correct number of events', () => {
    const base = EXAMPLE_CALENDAR_1
    const extra = EXAMPLE_CALENDAR_2

    const merged = mergeCalendars([base, extra])
    expect(merged.getEvents().length).toBe(
        base.getEvents().length + extra.getEvents().length
    )
})

it('does not add a name to a nameless calendars', () => {
    const calendar = EMPTY_CALENDAR
    expect(calendar.getCalendarName()).toBeUndefined()
    const merged = mergeCalendars([calendar])
    expect(merged.getCalendarName()).toBeUndefined()
})
