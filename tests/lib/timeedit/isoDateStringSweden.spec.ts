import { isoDateStringSweden } from '../../../app/lib/timeedit'
import { it, expect, beforeAll, afterAll, vi } from 'vitest'

beforeAll(() => {
    vi.stubEnv('TZ', 'UTC')
})

afterAll(() => {
    vi.unstubAllEnvs()
})

it('outputs in YYYY-MM-DD format', () => {
    const date = new Date('2026-03-05T16:00:00Z')
    const result = isoDateStringSweden(date)
    expect(result).toMatch(/^[0-9]{4}(-[0-9]{2}){2}$/)
})

it('returns the day in Sweden for standard time during midnight', () => {
    const date = new Date('2026-01-31T23:00:00Z')
    const result = isoDateStringSweden(date)
    expect(result).toBe('2026-02-01')
})

it('returns the day in Sweden for standard time before midnight', () => {
    const date = new Date('2026-01-31T22:59:59Z')
    const result = isoDateStringSweden(date)
    expect(result).toBe('2026-01-31')
})

it('returns the day in Sweden for summer time during midnight', () => {
    const date = new Date('2026-07-31T22:00:00Z')
    const result = isoDateStringSweden(date)
    expect(result).toBe('2026-08-01')
})

it('returns the day in Sweden for summer time before midnight', () => {
    const date = new Date('2026-07-31T21:59:59Z')
    const result = isoDateStringSweden(date)
    expect(result).toBe('2026-07-31')
})
