import { encodeEventDataValue } from '../../../app/lib/timeedit'
import { it, expect } from 'vitest'

it('encodes special characters', () => {
    const value = 'A:B.'
    const result = encodeEventDataValue(value)
    expect(result).toBe('A%3AB%2E')
})

it('does not encode other usually special characters', () => {
    const value = '?&=#åäö "$%&+,/;<>@[\\]^`{|}€'
    const result = encodeEventDataValue(value)
    expect(result).toBe(value)
})
