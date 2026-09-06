import { getEventType } from '@/app/lib/canvas'
import { CalendarDateTime, CalendarEvent } from 'iamcal'
import { it, expect } from 'vitest'

const date = new CalendarDateTime('20260906T120000')

it('correctly identifies "assignment" type', () => {
    const event = new CalendarEvent('event-assignment-123456', date, date)

    const type = getEventType(event)

    expect(type).toBe('assignment')
})

it('correctly identifies "calendar-event" type', () => {
    const event = new CalendarEvent('event-calendar-event-123456', date, date)

    const type = getEventType(event)

    expect(type).toBe('calendar-event')
})

it('generalizes to other types', () => {
    const event = new CalendarEvent(
        'event-event-my-new-type-event-123456',
        date,
        date
    )

    const type = getEventType(event)

    expect(type).toBe('event-my-new-type-event')
})
