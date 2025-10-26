import FilterSlicer, { Filter } from '../../src/backend/slicers/FilterSlicer'

it('serializes to "" when there are no filters', () => {
    const slicer = new FilterSlicer()
    expect(slicer.serialize()).toBe('')
})

it('serializes to "mode(option 1.-option 2)" when there is one filter', () => {
    const slicer = new FilterSlicer([new Filter(0, 'a', 'b')])
    expect(slicer.serialize()).toBe('0(a.-b)')
})

it('joins filters with no divider', () => {
    const slicer = new FilterSlicer([
        new Filter(0, 'a', 'b'),
        new Filter(1, 'c'),
    ])
    expect(slicer.serialize()).toBe('0(a.-b)1(c)')
})
