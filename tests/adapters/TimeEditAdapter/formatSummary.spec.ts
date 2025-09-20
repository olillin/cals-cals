import { CalendarDateTime, CalendarEvent } from 'iamcal'
import TimeEditAdapter, {
    TimeEditEventData,
} from '../../../src/backend/adapters/TimeEditAdapter'

let adapter: TimeEditAdapter
beforeAll(() => {
    adapter = new TimeEditAdapter()
})

it('follows the format "activity: course name (course code)" when all data is present', () => {
    const data: TimeEditEventData = {
        activity: ['Föreläsning'],
        kursNamn: ['Lorem ipsum'],
        kursKod: ['ABC123'],
    }
    const summary = adapter.formatSummary(data)

    expect(summary).toBe('Föreläsning: Lorem ipsum (ABC123)')
})

it('follows the format "course name (course code)" when activity is absent', () => {
    const data: TimeEditEventData = {
        kursNamn: ['Lorem ipsum'],
        kursKod: ['ABC123'],
    }
    const summary = adapter.formatSummary(data)

    expect(summary).toBe('Lorem ipsum (ABC123)')
})

it('follows the format "activity: course name" when course code is present', () => {
    const data: TimeEditEventData = {
        activity: ['Föreläsning'],
        kursNamn: ['Lorem ipsum'],
    }
    const summary = adapter.formatSummary(data)

    expect(summary).toBe('Föreläsning: Lorem ipsum')
})

it('follows the format "activity: course code" when course name is present', () => {
    const data: TimeEditEventData = {
        activity: ['Föreläsning'],
        kursKod: ['ABC123'],
    }
    const summary = adapter.formatSummary(data)

    expect(summary).toBe('Föreläsning: ABC123')
})

it('follows the format "activity" when only activity is present', () => {
    const data: TimeEditEventData = {
        activity: ['Föreläsning'],
    }
    const summary = adapter.formatSummary(data)

    expect(summary).toBe('Föreläsning')
})

it('follows the format "course name" when only course name is present', () => {
    const data: TimeEditEventData = {
        kursNamn: ['Lorem ipsum'],
    }
    const summary = adapter.formatSummary(data)

    expect(summary).toBe('Lorem ipsum')
})

it('follows the format "course code" when only course code is present', () => {
    const data: TimeEditEventData = {
        kursKod: ['ABC123'],
    }
    const summary = adapter.formatSummary(data)

    expect(summary).toBe('ABC123')
})

it('joins multiple activities', () => {
    const data: TimeEditEventData = {
        activity: ['A', 'B'],
    }
    const summary = adapter.formatSummary(data)

    expect(summary).toBe('A, B')
})

it('joins multiple course codes', () => {
    const data: TimeEditEventData = {
        kursKod: ['A', 'B'],
    }
    const summary = adapter.formatSummary(data)

    expect(summary).toBe('A, B')
})

it('omits extra course names', () => {
    const data: TimeEditEventData = {
        kursNamn: ['A', 'B'],
    }
    const summary = adapter.formatSummary(data)

    expect(summary).toBe('A')
})

it('shortens course codes', () => {
    const data: TimeEditEventData = {
        kursKod: ['ABC123_EXTRA_LONG_CODE456'],
    }
    const summary = adapter.formatSummary(data)

    expect(summary).toBe('ABC123')
})

it('uses "titel" if present', () => {
    const data: TimeEditEventData = {
        kursNamn: ['Lorem ipsum'],
        kursKod: ['ABC123'],
        titel: ['Spam'],
    }
    const summary = adapter.formatSummary(data)

    expect(summary).toBe('Spam')
})

it('returns null for no data', () => {
    const data: TimeEditEventData = {}
    const summary = adapter.formatSummary(data)
    expect(summary).toBeNull()
})

it('falls back to original event summary for no data', () => {
    const data: TimeEditEventData = {}
    const event = new CalendarEvent(
        '',
        new CalendarDateTime('20250101T120000'),
        new CalendarDateTime('20250101T120000')
    ).setSummary('Foo')

    const summary = adapter.formatSummary(data, event)

    expect(summary).toBe('Foo')
})
