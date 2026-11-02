import {
    serializeEventData,
    TimeEditEventData,
} from '../../../app/lib/timeedit'
import { it, expect } from 'vitest'

it('capitalizes key names', () => {
    const eventData: TimeEditEventData = {
        activity: ['foo'],
    }
    const result = serializeEventData(eventData)
    expect(result).toBe('Activity: foo')
})

it('separates entries with period', () => {
    const eventData: TimeEditEventData = {
        kurskod: ['foo'],
        kursnamn: ['spam'],
    }
    const result = serializeEventData(eventData)
    expect(result).toBe('Kurskod: foo. Kursnamn: spam')
})

it('repeats key-value pairs for multiple values', () => {
    const eventData: TimeEditEventData = {
        kurskod: ['foo', 'spam'],
    }
    const result = serializeEventData(eventData)
    expect(result).toBe('Kurskod: foo. Kurskod: spam')
})

it('creates an empty string for no data', () => {
    const eventData: TimeEditEventData = {}
    const result = serializeEventData(eventData)
    expect(result).toBe('')
})

it('encodes special characters', () => {
    const eventData: TimeEditEventData = {
        's:k.': ['A:B.'],
    }
    const result = serializeEventData(eventData)
    expect(result).toBe('S%3Ak%2E: A%3AB%2E')
})
