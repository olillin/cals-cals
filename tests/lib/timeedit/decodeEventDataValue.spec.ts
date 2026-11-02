import { decodeEventDataValue } from '../../../app/lib/timeedit'
import { it, expect } from 'vitest'

it('decodes urlencoded characters', () => {
    const value = 'A%3AB%2E'
    const result = decodeEventDataValue(value)
    expect(result).toBe('A:B.')
})
