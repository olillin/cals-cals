import { CalendarDateTime, CalendarEvent } from 'iamcal'
import {
    formatLocation,
    TimeEditEventData,
} from '../../../src/backend/adapters/TimeEditAdapter'

it('follows the format "room (campus)" when all data is present', () => {
    const data: TimeEditEventData = {
        lokalnamn: ['HA1'],
        campus: ['Johanneberg'],
    }
    const location = formatLocation(data)

    expect(location).toBe('HA1 (Johanneberg)')
})

it('follows the format "room" when only room is present', () => {
    const data: TimeEditEventData = {
        lokalnamn: ['HA1'],
    }
    const location = formatLocation(data)

    expect(location).toBe('HA1')
})

it('follows the format "campus" when only campus is present', () => {
    const data: TimeEditEventData = {
        campus: ['Johanneberg'],
    }
    const location = formatLocation(data)

    expect(location).toBe('Johanneberg')
})

it('joins multiple rooms', () => {
    const data: TimeEditEventData = {
        lokalnamn: ['HA1', 'HB2'],
        campus: ['Johanneberg'],
    }
    const location = formatLocation(data)

    expect(location).toBe('HA1, HB2 (Johanneberg)')
})

it('groups rooms by campus when there are multiple campuses', () => {
    const data: TimeEditEventData = {
        lokalnamn: ['HA1', 'Jupiter', 'HB2', 'HC4'],
        campus: ['Johanneberg', 'Lindholmen', 'Johanneberg', 'Johanneberg'],
    }
    const location = formatLocation(data)

    expect(location).toBe('HA1, HB2, HC4 (Johanneberg). Jupiter (Lindholmen)')
})

it('respects order of campuses', () => {
    const data: TimeEditEventData = {
        lokalnamn: ['Jupiter', 'HA1'],
        campus: ['Lindholmen', 'Johanneberg'],
    }
    const location = formatLocation(data)

    expect(location).toBe('Jupiter (Lindholmen). HA1 (Johanneberg)')
})

it('does not group rooms by campus when there are different amount of rooms and campuses', () => {
    const data: TimeEditEventData = {
        lokalnamn: ['HA1', 'Jupiter', 'HB2', 'Saga'],
        campus: ['Johanneberg', 'Lindholmen', 'Johanneberg'],
    }
    const location = formatLocation(data)

    expect(location).toBe('HA1, Jupiter, HB2, Saga (Johanneberg, Lindholmen)')
})

it('returns null for no data', () => {
    const data: TimeEditEventData = {}
    const location = formatLocation(data)
    expect(location).toBeNull()
})

it('falls back to original event location for no data', () => {
    const data: TimeEditEventData = {}
    const event = new CalendarEvent(
        '',
        new CalendarDateTime('20250101T120000'),
        new CalendarDateTime('20250101T120000')
    ).setLocation('Foo')

    const location = formatLocation(data, event)

    expect(location).toBe('Foo')
})
