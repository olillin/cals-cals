import { CalendarDateTime, CalendarEvent } from 'iamcal'
import { parseEventData } from '../../../app/lib/timeedit'
import { it, expect } from 'vitest'

const time = new CalendarDateTime('20250919T120000')

it('returns empty for empty event', () => {
    const emptyEvent = new CalendarEvent('', time, time)

    const data = parseEventData(emptyEvent)

    expect(data).toStrictEqual({})
})

it('uses summary and location as sources', () => {
    const validEvent = new CalendarEvent('', time, time)
        .setSummary('Aktivitet: A')
        .setLocation('Lokalnamn: B')

    const data = parseEventData(validEvent)

    expect(data).toHaveProperty('aktivitet')
    expect(data).toHaveProperty('lokalnamn')
})

it('does not use description as source', () => {
    const validEvent = new CalendarEvent('', time, time).setDescription(
        'Aktivitet: A'
    )

    const data = parseEventData(validEvent)

    expect(data).not.toHaveProperty('aktivitet')
})

it('returns no data if unable to parse', () => {
    const invalidEvent = new CalendarEvent('', time, time)
        .setSummary('A')
        .setDescription('B')
        .setLocation('C')

    const data = parseEventData(invalidEvent)

    expect(data).toStrictEqual({})
})
