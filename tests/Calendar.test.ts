import { load, parseCalendar } from 'iamcal'
import {
    deepCopy,
    mergeCalendars,
    mergeCalendarsText,
} from '../app/lib/Calendar'

const EMPTY_CALENDAR = load('tests/resources/empty.ics')
async function emptyCalendar() {
    return deepCopy(await EMPTY_CALENDAR)
}
const EXAMPLE_CALENDAR_1 = load('tests/resources/spam.ics')
async function exampleCalendar1() {
    return deepCopy(await EXAMPLE_CALENDAR_1)
}
const EXAMPLE_CALENDAR_2 = load('tests/resources/foo.ics')
async function exampleCalendar2() {
    return deepCopy(await EXAMPLE_CALENDAR_2)
}

describe('test deepCopy', () => {
    test('shallow operations on copy do not affect original', async () => {
        let original = await EMPTY_CALENDAR
        let copied = await deepCopy(original)

        let originalName = original.name
        copied.name = 'VEVENT'
        expect(original.name).toBe(originalName)
    })

    test('deep operations on copy do not affect original', async () => {
        let original = await EXAMPLE_CALENDAR_1
        let copied = await deepCopy(original)

        let originalSummary = original.getEvents()[0].getSummary()
        copied.getEvents()[0].setSummary('foo')
        expect(original.getEvents()[0].getSummary()).toBe(originalSummary)
    })

    test('returns same class: Calendar', async () => {
        let original = await EMPTY_CALENDAR
        let copied = await deepCopy(original)
        expect(copied.constructor.name).toBe(original.constructor.name)
    })

    test('returns same class: CalendarEvent', async () => {
        let calendar = await EXAMPLE_CALENDAR_1
        let original = calendar.getEvents()[0]
        let copied = await deepCopy(original)
        expect(copied.constructor.name).toBe(original.constructor.name)
    })
})

describe('test mergeCalendars', () => {
    test('single merged unchanged', async () => {
        let calendar = await exampleCalendar1()
        let merged = await mergeCalendars([calendar])
        expect(merged).toStrictEqual(calendar)
    })
    test('merged calendar name', async () => {
        let base = await exampleCalendar1()
        let baseName = base.getCalendarName()
        let extra = await exampleCalendar2()
        let extraName = extra.getCalendarName()

        let merged = await mergeCalendars([base, extra])
        let name = merged.getCalendarName()
        expect(name).toBe(baseName + '+' + extraName)
    })

    test('combined number of events', async () => {
        let base = await exampleCalendar1()
        let extra = await exampleCalendar2()

        let merged = await mergeCalendars([base, extra])
        expect(merged.getEvents().length).toBe(
            base.getEvents().length + extra.getEvents().length
        )
    })

    test('unnamed calendar still unnamed', async () => {
        let calendar = await emptyCalendar()
        expect(calendar.getCalendarName()).toBeUndefined()
        let merged = await mergeCalendars([calendar])
        expect(merged.getCalendarName()).toBeUndefined()
    })
})

describe('test mergeCalendarsText', () => {
    test('combined number of events', async () => {
        let base = await EXAMPLE_CALENDAR_1
        let baseText = base.serialize()
        let extra = await EXAMPLE_CALENDAR_2
        let extraText = extra.serialize()
        let mergedText = await mergeCalendarsText([baseText, extraText])
        let merged = await parseCalendar(mergedText)

        expect(merged.getEvents().length).toBe(
            base.getEvents().length + extra.getEvents().length
        )
    })
})
