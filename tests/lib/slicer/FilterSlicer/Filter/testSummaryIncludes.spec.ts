import { CalendarDateTime, CalendarEvent } from 'iamcal'
import { Filter } from '../../../../../app/lib/slicer/FilterSlicer'
import { it, expect } from 'vitest'

const time = new CalendarDateTime('20250920T120000')
const event = new CalendarEvent('', time, time).setSummary('abcdef')
const emptyEvent = new CalendarEvent('', time, time)

it('passes when at start of summary', () => {
    const filter = new Filter(0, 'ab')
    expect(filter.testSummaryIncludes(event)).toBeTruthy()
})

it('passes when in middle of summary', () => {
    const filter = new Filter(0, 'cd')
    expect(filter.testSummaryIncludes(event)).toBeTruthy()
})

it('passes when at end of summary', () => {
    const filter = new Filter(0, 'ef')
    expect(filter.testSummaryIncludes(event)).toBeTruthy()
})

it('fails when not in summary', () => {
    const filter = new Filter(0, 'fg')
    expect(filter.testSummaryIncludes(event)).toBeFalsy()
})

it('fails when there is no summary', () => {
    const filter = new Filter(0, 'ab')
    expect(filter.testSummaryIncludes(emptyEvent)).toBeFalsy()
})
