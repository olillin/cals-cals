import { Filter } from '../../../../../app/lib/slicer/FilterSlicer'
import { it, expect } from 'vitest'

it('parses the correct mode', () => {
    const filter = Filter.fromSerialized('1()')
    expect(filter.getMode()).toBe(1)
})

it('parses no options', () => {
    const filter = Filter.fromSerialized('1()')
    expect(filter.getOptions()).toStrictEqual([])
})

it('parses one option', () => {
    const filter = Filter.fromSerialized('1(a b c)')
    expect(filter.getOptions()).toStrictEqual(['a b c'])
})

it('parses two options', () => {
    const filter = Filter.fromSerialized('1(a b c.-lorem ipsum)')
    expect(filter.getOptions()).toStrictEqual(['a b c', 'lorem ipsum'])
})
