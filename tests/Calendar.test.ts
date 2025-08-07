import { load } from 'iamcal/io'
import {
    deepCopy,
    mergeCalendars,
    mergeCalendarsText,
} from '../src/backend/Calendar'
import { parseCalendar } from 'iamcal/parse'

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

        let originalSummary = original.events()[0].summary()
        copied.events()[0].setSummary('foo')
        expect(original.events()[0].summary()).toBe(originalSummary)
    })

    test('returns same class: Calendar', async () => {
        let original = await EMPTY_CALENDAR
        let copied = await deepCopy(original)
        expect(copied.constructor.name).toBe(original.constructor.name)
    })

    test('returns same class: CalendarEvent', async () => {
        let calendar = await EXAMPLE_CALENDAR_1
        let original = calendar.events()[0]
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
        let baseName = base.getProperty('X-WR-CALNAME')?.value
        let extra = await exampleCalendar2()
        let extraName = extra.getProperty('X-WR-CALNAME')?.value

        let merged = await mergeCalendars([base, extra])
        let name = merged.getProperty('X-WR-CALNAME')?.value
        expect(name).toBe(baseName + '+' + extraName)
    })

    test('combined number of events', async () => {
        let base = await exampleCalendar1()
        let extra = await exampleCalendar2()

        let merged = await mergeCalendars([base, extra])
        expect(merged.events().length).toBe(
            base.events().length + extra.events().length
        )
    })

    test('unnamed calendar still unnamed', async () => {
        let calendar = await emptyCalendar()
        expect(calendar.getProperty('X-WR-CALNAME')).toBeNull()
        let merged = await mergeCalendars([calendar])
        expect(merged.getProperty('X-WR-CALNAME')).toBeNull()
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

        expect(merged.events().length).toBe(
            base.events().length + extra.events().length
        )
    })
})
