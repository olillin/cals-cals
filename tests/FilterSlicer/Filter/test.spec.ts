import { CalendarDateTime, CalendarEvent } from 'iamcal'
import { Filter } from '../../../app/lib/slicers/FilterSlicer'

const time = new CalendarDateTime('20250920T120000')
const event = new CalendarEvent('', time, time).setSummary('abcdef')

it('uses summary includes for mode 0', () => {
    const filter = new Filter(0, 'cd')

    expect(filter.test(event)).toBeTruthy()
})

it('uses summary starts with for mode 1', () => {
    const trueFilter = new Filter(1, 'ab')
    const falseFilter = new Filter(1, 'cd')

    expect(trueFilter.test(event)).toBeTruthy()
    expect(falseFilter.test(event)).toBeFalsy()
})

it('fails for unknown mode', () => {
    const filter = new Filter(0)
    filter['mode'] = -1
    expect(filter.test(event)).toBeFalsy()
})
