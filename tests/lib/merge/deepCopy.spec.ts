import { Calendar, loadCalendarSync } from 'iamcal'
import { deepCopy } from '../../../app/lib/merge'
import { it, expect, beforeEach } from 'vitest'

let EMPTY_CALENDAR: Calendar
let EXAMPLE_CALENDAR_1: Calendar

beforeEach(() => {
    EMPTY_CALENDAR = loadCalendarSync('tests/resources/empty.ics')
    EXAMPLE_CALENDAR_1 = loadCalendarSync('tests/resources/spam.ics')
})

it('has no shallow references to original', () => {
    const original = EMPTY_CALENDAR
    const copied = deepCopy(original)

    const originalName = original.name
    copied.name = 'VEVENT'
    expect(original.name).toBe(originalName)
})

it('has no deep references to original', () => {
    const original = EXAMPLE_CALENDAR_1
    const copied = deepCopy(original)

    const originalSummary = original.getEvents()[0].getSummary()
    copied.getEvents()[0].setSummary('foo')
    expect(original.getEvents()[0].getSummary()).toBe(originalSummary)
})

it('returns the same class for calendars', () => {
    const original = EMPTY_CALENDAR
    const copied = deepCopy(original)
    expect(copied.constructor.name).toBe(original.constructor.name)
})

it('returns the same class for calendar events', () => {
    const calendar = EXAMPLE_CALENDAR_1
    const original = calendar.getEvents()[0]
    const copied = deepCopy(original)
    expect(copied.constructor.name).toBe(original.constructor.name)
})
