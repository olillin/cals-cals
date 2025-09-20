import { CalendarDateTime, CalendarEvent } from 'iamcal'
import TimeEditAdapter, {
    TimeEditEventData,
} from '../../../src/backend/adapters/TimeEditAdapter'

let adapter: TimeEditAdapter
beforeAll(() => {
    adapter = new TimeEditAdapter()
})

it('follows the format when all data is present', () => {
    const data: TimeEditEventData = {
        activity: ['Föreläsning'],
        kursNamn: ['Lorem ipsum', 'dolor sit amet'],
        kursKod: ['ABC123', 'DEF456'],
        klassNamn: ['Foo', 'Spam'],
        klassKod: ['KLASS-1', 'KLASS-2'],
        lokalnamn: ['HA1'],
        campus: ['Johanneberg'],
        antalDatorer: ['0'],
        titel: ['Event title'],
        kartlänk: ['https://example.com'],
    }
    const description = adapter.formatDescription(data)

    expect(description).toBe(
        `Aktivitet: Föreläsning
Kurs: Lorem ipsum (ABC123, DEF456)
Klass: KLASS-1, KLASS-2
Karta: https://example.com`
    )
})

it('omits activity when missing', () => {
    const data: TimeEditEventData = {
        kursNamn: ['Lorem ipsum', 'dolor sit amet'],
        kursKod: ['ABC123', 'DEF456'],
        klassNamn: ['Foo', 'Spam'],
        klassKod: ['KLASS-1', 'KLASS-2'],
        kartlänk: ['https://example.com'],
    }
    const description = adapter.formatDescription(data)

    expect(description).toBe(
        `Kurs: Lorem ipsum (ABC123, DEF456)
Klass: KLASS-1, KLASS-2
Karta: https://example.com`
    )
})

it('omits course when missing', () => {
    const data: TimeEditEventData = {
        activity: ['Föreläsning'],
        klassNamn: ['Foo', 'Spam'],
        klassKod: ['KLASS-1', 'KLASS-2'],
        kartlänk: ['https://example.com'],
    }
    const description = adapter.formatDescription(data)

    expect(description).toBe(
        `Aktivitet: Föreläsning
Klass: KLASS-1, KLASS-2
Karta: https://example.com`
    )
})

it('omits class when missing', () => {
    const data: TimeEditEventData = {
        activity: ['Föreläsning'],
        kursNamn: ['Lorem ipsum', 'dolor sit amet'],
        kursKod: ['ABC123', 'DEF456'],
        kartlänk: ['https://example.com'],
    }
    const description = adapter.formatDescription(data)

    expect(description).toBe(
        `Aktivitet: Föreläsning
Kurs: Lorem ipsum (ABC123, DEF456)
Karta: https://example.com`
    )
})

it('omits map when missing', () => {
    const data: TimeEditEventData = {
        activity: ['Föreläsning'],
        kursNamn: ['Lorem ipsum', 'dolor sit amet'],
        kursKod: ['ABC123', 'DEF456'],
        klassNamn: ['Foo', 'Spam'],
        klassKod: ['KLASS-1', 'KLASS-2'],
    }
    const description = adapter.formatDescription(data)

    expect(description).toBe(
        `Aktivitet: Föreläsning
Kurs: Lorem ipsum (ABC123, DEF456)
Klass: KLASS-1, KLASS-2`
    )
})

it('uses event URL property if map as fallback', () => {
    const data: TimeEditEventData = {}
    const event = new CalendarEvent(
        '',
        new CalendarDateTime('20250101T120000'),
        new CalendarDateTime('20250101T120000')
    ).setProperty('URL', 'https://example.com')

    const description = adapter.formatDescription(data, event)
    expect(description).toBe('Karta: https://example.com')
})

it('does not use event URL property if "kartlänk" is present', () => {
    const data: TimeEditEventData = {
        kartlänk: ['https://foo.net'],
    }
    const event = new CalendarEvent(
        '',
        new CalendarDateTime('20250101T120000'),
        new CalendarDateTime('20250101T120000')
    ).setProperty('URL', 'https://example.com')

    const description = adapter.formatDescription(data, event)
    expect(description).toBe('Karta: https://foo.net')
})

it('shows extra data at bottom', () => {
    const data: TimeEditEventData = {
        unknownData: ['Lorem ipsum dolor sit amet'],
        extra: ['ABC'],
    }

    const description = adapter.formatDescription(data)
    expect(description).toBe(`Extra: ABC
Unknown data: Lorem ipsum dolor sit amet`)
})

it('shortens course codes', () => {
    const data: TimeEditEventData = {
        kursKod: ['ABC123_EXTRA_LONG_CODE456'],
    }
    const description = adapter.formatDescription(data)

    expect(description).toBe('Kurs: ABC123')
})

it('returns null for no data', () => {
    const data: TimeEditEventData = {}
    const description = adapter.formatDescription(data)
    expect(description).toBeNull()
})

it('falls back to original event description for no data', () => {
    const data: TimeEditEventData = {}
    const event = new CalendarEvent(
        '',
        new CalendarDateTime('20250101T120000'),
        new CalendarDateTime('20250101T120000')
    ).setDescription('Foo')

    const description = adapter.formatDescription(data, event)

    expect(description).toBe('Foo')
})
