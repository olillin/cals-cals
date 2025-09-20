import { CalendarDate, CalendarDateTime, CalendarEvent } from 'iamcal'
import FilteredSlicer, { Filter } from '../../src/backend/FilteredSlicer'

const time = new CalendarDateTime('20250920T120000')
const events = [
    new CalendarEvent('', time, time).setSummary('ABC'),
    new CalendarEvent('', time, time).setSummary('ABCdef'),
    new CalendarEvent('', time, time).setSummary('abc'),
    new CalendarEvent('', time, time).setSummary('abcdef'),
]

it('returns only default for no filters', () => {
    const slicer = new FilteredSlicer()
    const groups = slicer.apply(events)
    expect(groups).toStrictEqual([{ filter: null, events: events }])
})

it('groups events in the correct order', () => {
    const slicer = new FilteredSlicer([
        new Filter(0, 'def'),
        new Filter(1, 'ABC'),
    ])
    const groups = slicer.apply(events)
    expect(groups[0].events).toStrictEqual([events[1], events[3]])
    expect(groups[1].events).toStrictEqual([events[0]])
    expect(groups[2].events).toStrictEqual([events[2]])
})

it('has default group even when there are no events', () => {
    const slicer = new FilteredSlicer()
    const groups = slicer.apply([])
    expect(groups).toStrictEqual([{ filter: null, events: [] }])
})
