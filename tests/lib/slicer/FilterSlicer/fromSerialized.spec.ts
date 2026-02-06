import FilterSlicer, { Filter } from '../../../../app/lib/slicer/FilterSlicer'
import { it, expect } from 'vitest'

it('creates empty slicer from empty string', () => {
    const serialized = ''
    const slicer = FilterSlicer.fromSerialized(serialized)
    expect(slicer.filters).toStrictEqual([])
})

it('creates one filter from "0(a.-b)', () => {
    const serialized = '0(a.-b)'
    const slicer = FilterSlicer.fromSerialized(serialized)
    expect(slicer.filters).toStrictEqual([new Filter(0, 'a', 'b')])
})

it('creates two filters from "0(a.-b)1(c)', () => {
    const serialized = '0(a.-b)1(c)'
    const slicer = FilterSlicer.fromSerialized(serialized)
    expect(slicer.filters).toStrictEqual([
        new Filter(0, 'a', 'b'),
        new Filter(1, 'c'),
    ])
})

it('preserves order', () => {
    const serialized = '1(c)0(a.-b)'
    const slicer = FilterSlicer.fromSerialized(serialized)
    expect(slicer.filters).toStrictEqual([
        new Filter(1, 'c'),
        new Filter(0, 'a', 'b'),
    ])
})
