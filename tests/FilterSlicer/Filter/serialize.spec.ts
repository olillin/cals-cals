import e from 'express'
import { Filter } from '../../../app/lib/slicers/FilterSlicer'

it('follows the format "mode(option1.-option2)"', () => {
    const filter = new Filter(0, 'option 1', 'option 2')
    expect(filter.serialize()).toBe('0(option 1.-option 2)')
})

it('follows the format "mode(option)" for only one option', () => {
    const filter = new Filter(1, 'option')
    expect(filter.serialize()).toBe('1(option)')
})

it('follows the format "mode()" for no options', () => {
    const filter = new Filter(0)
    expect(filter.serialize()).toBe('0()')
})
