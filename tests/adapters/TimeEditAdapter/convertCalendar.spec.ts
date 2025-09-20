import { Calendar, CalendarDateTime, CalendarEvent } from 'iamcal'
import TimeEditAdapter from '../../../src/backend/adapters/TimeEditAdapter'

let adapter: TimeEditAdapter
let calendar: Calendar
let event1: CalendarEvent
let event2: CalendarEvent

const time = new CalendarDateTime('20250919T120000')
const summary1 = 'Activity: A1'
const location1 = 'Lokalnamn: B1'
const summary2 = 'Activity: A2'
const location2 = 'Lokalnamn: B2'

beforeAll(() => {
    adapter = new TimeEditAdapter()
})

beforeEach(() => {
    event1 = new CalendarEvent('', time, time)
        .setSummary(summary1)
        .setLocation(location1)
    event2 = new CalendarEvent('', time, time)
        .setSummary(summary2)
        .setLocation(location2)
    calendar = new Calendar('').addComponents([event1, event2])
})

it('mutates event 1', () => {
    adapter.convertCalendar(calendar)
    expect(event1.getSummary()).not.toBe(summary1)
})

it('mutates event 2', () => {
    adapter.convertCalendar(calendar)
    expect(event2.getSummary()).not.toBe(summary2)
})
