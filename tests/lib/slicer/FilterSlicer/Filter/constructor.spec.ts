import { Filter } from '../../../../../app/lib/slicer/FilterSlicer'
import { it, expect } from 'vitest'

it('throws if creating with negative mode', () => {
    expect(() => {
        new Filter(-1)
    }).toThrow()
})

it('throws if creating with unknown mode', () => {
    expect(() => {
        new Filter(Infinity)
    }).toThrow()
})

it('throws if creating with NaN mode', () => {
    expect(() => {
        new Filter(NaN)
    }).toThrow()
})

it('throws if creating with ".-" in options', () => {
    expect(() => {
        new Filter(0, '', '.-')
    }).toThrow()
})

it('throws if creating with "&" in options', () => {
    expect(() => {
        new Filter(0, 'This is fine', 'A & B')
    }).toThrow()
})

it('throws if creating with "?" in options', () => {
    expect(() => {
        new Filter(0, 'Foo', 'What?!')
    }).toThrow()
})

it('throws if creating with "/" in options', () => {
    expect(() => {
        new Filter(0, 'Foo', 'This/that')
    }).toThrow()
})

it('floors mode', () => {
    const filter = new Filter(1.9)
    expect(filter.getMode()).toBe(1)
})
