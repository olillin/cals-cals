import { getRichDescription } from '@/app/lib/canvas'
import { CalendarDateTime, CalendarEvent, Property } from 'iamcal'
import { it, expect, vi } from 'vitest'

const date = new CalendarDateTime('20260906T120000')

it('returns X-ALT-DESC with type text/html', () => {
    const event = new CalendarEvent('event-assignment-123456', date, date)
        .setDescription('Plain description')
        .addProperty(
            new Property('X-ALT-DESC', 'Rich description', {
                FMTTYPE: 'text/html',
            })
        )

    const description = getRichDescription(event)

    expect(description).toBe('Rich description')
})

it('returns null when X-ALT-DESC does not exist', () => {
    const event = new CalendarEvent(
        'event-assignment-123456',
        date,
        date
    ).setDescription('Plain description')

    const description = getRichDescription(event)

    expect(description).toBeNull()
})

it('returns null when X-ALT-DESC has no type', () => {
    const spy = vi.spyOn(console, 'warn').mockImplementation(() => undefined)

    const event = new CalendarEvent('event-assignment-123456', date, date)
        .setDescription('Plain description')
        .setProperty('X-ALT-DESC', 'Rich description')

    const description = getRichDescription(event)

    expect(description).toBeNull()
    expect(spy).toHaveBeenCalledOnce()
})
