import { CalendarDateTime, CalendarEvent } from 'iamcal'
import { parseEventData } from '../../../app/lib/timeedit'
import { it, expect } from 'vitest'

const time = new CalendarDateTime('20250919T120000')

it('uses summary and location as sources', () => {
    const validEvent = new CalendarEvent('', time, time)
        .setSummary('Activity: A')
        .setLocation('Lokalnamn: B')

    const data = parseEventData(validEvent)

    expect(data).toHaveProperty('activity')
    expect(data).toHaveProperty('lokalnamn')
})

it('returns no data if unable to parse', () => {
    const invalidEvent = new CalendarEvent('', time, time)
        .setSummary('A')
        .setDescription('B')
        .setLocation('C')

    const data = parseEventData(invalidEvent)

    expect(data).toStrictEqual({})
})
