import { CalendarDateTime, CalendarEvent } from 'iamcal'
import {
    formatDescription,
    TimeEditEventData,
} from '../../../app/lib/adapters/TimeEditAdapter'

it('follows the format when all data is present', () => {
    const data: TimeEditEventData = {
        activity: ['Föreläsning'],
        kursnamn: ['Lorem ipsum', 'dolor sit amet'],
        kurskod: ['ABC123', 'DEF456'],
        klassnamn: ['Foo', 'Spam'],
        klasskod: ['KLASS-1', 'KLASS-2'],
        lokalnamn: ['HA1'],
        campus: ['Johanneberg'],
        antaldatorer: ['0'],
        titel: ['Event title'],
        kartlänk: ['https://example.com'],
    }
    const description = formatDescription(data)

    expect(description).toBe(
        `Aktivitet: Föreläsning
Kurs: Lorem ipsum (ABC123, DEF456)
Klass: KLASS-1, KLASS-2
Karta: https://example.com`
    )
})

it('omits activity when missing', () => {
    const data: TimeEditEventData = {
        kursnamn: ['Lorem ipsum', 'dolor sit amet'],
        kurskod: ['ABC123', 'DEF456'],
        klassnamn: ['Foo', 'Spam'],
        klasskod: ['KLASS-1', 'KLASS-2'],
        kartlänk: ['https://example.com'],
    }
    const description = formatDescription(data)

    expect(description).toBe(
        `Kurs: Lorem ipsum (ABC123, DEF456)
Klass: KLASS-1, KLASS-2
Karta: https://example.com`
    )
})

it('omits course when missing', () => {
    const data: TimeEditEventData = {
        activity: ['Föreläsning'],
        klassnamn: ['Foo', 'Spam'],
        klasskod: ['KLASS-1', 'KLASS-2'],
        kartlänk: ['https://example.com'],
    }
    const description = formatDescription(data)

    expect(description).toBe(
        `Aktivitet: Föreläsning
Klass: KLASS-1, KLASS-2
Karta: https://example.com`
    )
})

it('omits class when missing', () => {
    const data: TimeEditEventData = {
        activity: ['Föreläsning'],
        kursnamn: ['Lorem ipsum', 'dolor sit amet'],
        kurskod: ['ABC123', 'DEF456'],
        kartlänk: ['https://example.com'],
    }
    const description = formatDescription(data)

    expect(description).toBe(
        `Aktivitet: Föreläsning
Kurs: Lorem ipsum (ABC123, DEF456)
Karta: https://example.com`
    )
})

it('omits map when missing', () => {
    const data: TimeEditEventData = {
        activity: ['Föreläsning'],
        kursnamn: ['Lorem ipsum', 'dolor sit amet'],
        kurskod: ['ABC123', 'DEF456'],
        klassnamn: ['Foo', 'Spam'],
        klasskod: ['KLASS-1', 'KLASS-2'],
    }
    const description = formatDescription(data)

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

    const description = formatDescription(data, event)
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

    const description = formatDescription(data, event)
    expect(description).toBe('Karta: https://foo.net')
})

it('shows extra data at bottom', () => {
    const data: TimeEditEventData = {
        unknowndata: ['Lorem ipsum dolor sit amet'],
        extra: ['ABC'],
    }

    const description = formatDescription(data)
    expect(description).toBe(`Extra: ABC
Unknowndata: Lorem ipsum dolor sit amet`)
})

it('shortens course codes', () => {
    const data: TimeEditEventData = {
        kurskod: ['ABC123_EXTRA_LONG_CODE456'],
    }
    const description = formatDescription(data)

    expect(description).toBe('Kurs: ABC123')
})

it('returns null for no data', () => {
    const data: TimeEditEventData = {}
    const description = formatDescription(data)
    expect(description).toBeNull()
})

it('falls back to original event description for no data', () => {
    const data: TimeEditEventData = {}
    const event = new CalendarEvent(
        '',
        new CalendarDateTime('20250101T120000'),
        new CalendarDateTime('20250101T120000')
    ).setDescription('Foo')

    const description = formatDescription(data, event)

    expect(description).toBe('Foo')
})
