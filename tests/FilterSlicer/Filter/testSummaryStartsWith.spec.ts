import { CalendarDateTime, CalendarEvent } from 'iamcal'
import { Filter } from '../../../app/lib/slicers/FilterSlicer'

const time = new CalendarDateTime('20250920T120000')
const event = new CalendarEvent('', time, time).setSummary('abcdef')
const emptyEvent = new CalendarEvent('', time, time)

it('passes when at start of summary', () => {
    const filter = new Filter(0, 'ab')
    expect(filter.testSummaryStartsWith(event)).toBeTruthy()
})

it('passes when in middle of summary', () => {
    const filter = new Filter(0, 'cd')
    expect(filter.testSummaryStartsWith(event)).toBeFalsy()
})

it('fails when at end of summary', () => {
    const filter = new Filter(0, 'ef')
    expect(filter.testSummaryStartsWith(event)).toBeFalsy()
})

it('fails when off end of summary', () => {
    const filter = new Filter(0, 'fg')
    expect(filter.testSummaryStartsWith(event)).toBeFalsy()
})

it('fails when off start of summary', () => {
    const filter = new Filter(0, 'aa')
    expect(filter.testSummaryStartsWith(event)).toBeFalsy()
})

it('fails when there is no summary', () => {
    const filter = new Filter(0, 'ab')
    expect(filter.testSummaryStartsWith(emptyEvent)).toBeFalsy()
})
