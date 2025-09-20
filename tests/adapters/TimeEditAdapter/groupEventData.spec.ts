import { CalendarDateTime, CalendarEvent } from 'iamcal'
import TimeEditAdapter from '../../../src/backend/adapters/TimeEditAdapter'

let adapter: TimeEditAdapter
beforeAll(() => {
    adapter = new TimeEditAdapter()
})

const time = new CalendarDateTime('20250919T120000')
const validEvent = new CalendarEvent('', time, time)
    .setSummary('Activity: A')
    .setLocation('Lokalnamn: B')
const invalidEvent = new CalendarEvent('', time, time)
    .setSummary('A')
    .setDescription('B')
    .setLocation('C')

it('uses summary and location as sources', () => {
    const data = adapter['groupEventData'](validEvent)

    expect(data).toHaveProperty('activity')
    expect(data).toHaveProperty('lokalnamn')
})

it('returns no data if unable to parse', () => {
    const data = adapter['groupEventData'](invalidEvent)

    expect(data).toStrictEqual({})
})
