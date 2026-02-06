import { CalendarDateTime, CalendarEvent } from 'iamcal'
import {
    createEventSummary,
    TimeEditEventData,
} from '../../../app/lib/timeedit'
import { it, expect } from 'vitest'

it('follows the format "activity: course name (course code)" when all data is present', () => {
    const data: TimeEditEventData = {
        activity: ['Föreläsning'],
        kursnamn: ['Lorem ipsum'],
        kurskod: ['ABC123'],
    }
    const summary = createEventSummary(data)

    expect(summary).toBe('Föreläsning: Lorem ipsum (ABC123)')
})

it('follows the format "course name (course code)" when activity is absent', () => {
    const data: TimeEditEventData = {
        kursnamn: ['Lorem ipsum'],
        kurskod: ['ABC123'],
    }
    const summary = createEventSummary(data)

    expect(summary).toBe('Lorem ipsum (ABC123)')
})

it('follows the format "activity: course name" when course code is present', () => {
    const data: TimeEditEventData = {
        activity: ['Föreläsning'],
        kursnamn: ['Lorem ipsum'],
    }
    const summary = createEventSummary(data)

    expect(summary).toBe('Föreläsning: Lorem ipsum')
})

it('follows the format "activity: course code" when course name is present', () => {
    const data: TimeEditEventData = {
        activity: ['Föreläsning'],
        kurskod: ['ABC123'],
    }
    const summary = createEventSummary(data)

    expect(summary).toBe('Föreläsning: ABC123')
})

it('follows the format "activity" when only activity is present', () => {
    const data: TimeEditEventData = {
        activity: ['Föreläsning'],
    }
    const summary = createEventSummary(data)

    expect(summary).toBe('Föreläsning')
})

it('follows the format "course name" when only course name is present', () => {
    const data: TimeEditEventData = {
        kursnamn: ['Lorem ipsum'],
    }
    const summary = createEventSummary(data)

    expect(summary).toBe('Lorem ipsum')
})

it('follows the format "course code" when only course code is present', () => {
    const data: TimeEditEventData = {
        kurskod: ['ABC123'],
    }
    const summary = createEventSummary(data)

    expect(summary).toBe('ABC123')
})

it('joins multiple activities', () => {
    const data: TimeEditEventData = {
        activity: ['A', 'B'],
    }
    const summary = createEventSummary(data)

    expect(summary).toBe('A, B')
})

it('joins multiple course codes', () => {
    const data: TimeEditEventData = {
        kurskod: ['A', 'B'],
    }
    const summary = createEventSummary(data)

    expect(summary).toBe('A, B')
})

it('omits extra course names', () => {
    const data: TimeEditEventData = {
        kursnamn: ['A', 'B'],
    }
    const summary = createEventSummary(data)

    expect(summary).toBe('A')
})

it('shortens course codes', () => {
    const data: TimeEditEventData = {
        kurskod: ['ABC123_EXTRA_LONG_CODE456'],
    }
    const summary = createEventSummary(data)

    expect(summary).toBe('ABC123')
})

it('uses "titel" if present', () => {
    const data: TimeEditEventData = {
        kursnamn: ['Lorem ipsum'],
        kurskod: ['ABC123'],
        titel: ['Spam'],
    }
    const summary = createEventSummary(data)

    expect(summary).toBe('Spam')
})

it('returns null for no data', () => {
    const data: TimeEditEventData = {}
    const summary = createEventSummary(data)
    expect(summary).toBeNull()
})

it('falls back to original event summary for no data', () => {
    const data: TimeEditEventData = {}
    const event = new CalendarEvent(
        '',
        new CalendarDateTime('20250101T120000'),
        new CalendarDateTime('20250101T120000')
    ).setSummary('Foo')

    const summary = createEventSummary(data, event)

    expect(summary).toBe('Foo')
})
