import { createAssignmentUrl } from '@/app/lib/canvas'
import { CalendarDateTime, CalendarEvent, Property } from 'iamcal'
import { it, expect } from 'vitest'

const date = new CalendarDateTime('20260906T120000')

it('returns the correct URL format', () => {
    const event = new CalendarEvent(
        'event-assignment-123456',
        date,
        date
    ).addProperty(
        new Property(
            'URL',
            'https://canvas.chalmers.se/calendar?include_contexts=course_78900&month=09&year=2026#assignment_123456',
            { VALUE: 'URI' }
        )
    )

    const url = createAssignmentUrl(event)

    expect(url?.href).toBe(
        'https://canvas.chalmers.se/courses/78900/assignments/123456'
    )
})

it('can find assignment ID in only UID', () => {
    const event = new CalendarEvent(
        'event-assignment-123456',
        date,
        date
    ).addProperty(
        new Property(
            'URL',
            'https://canvas.chalmers.se/calendar?include_contexts=course_78900',
            { VALUE: 'URI' }
        )
    )

    const url = createAssignmentUrl(event)

    expect(url?.href).toBe(
        'https://canvas.chalmers.se/courses/78900/assignments/123456'
    )
})

it('can find assignment ID in only URL', () => {
    const event = new CalendarEvent('event-assignment', date, date).addProperty(
        new Property(
            'URL',
            'https://canvas.chalmers.se/calendar?include_contexts=course_78900&month=09&year=2026#assignment_123456',
            { VALUE: 'URI' }
        )
    )

    const url = createAssignmentUrl(event)

    expect(url?.href).toBe(
        'https://canvas.chalmers.se/courses/78900/assignments/123456'
    )
})

it('returns null if missing assignment ID', () => {
    const event = new CalendarEvent('event-assignment', date, date).addProperty(
        new Property(
            'URL',
            'https://canvas.chalmers.se/calendar?include_contexts=course_78900&month=09&year=2026',
            { VALUE: 'URI' }
        )
    )

    const url = createAssignmentUrl(event)

    expect(url).toBeNull()
})

it('returns null if missing course ID', () => {
    const event = new CalendarEvent(
        'event-assignment-123456',
        date,
        date
    ).addProperty(
        new Property(
            'URL',
            'https://canvas.chalmers.se/calendar?month=09&year=2026#assignment_123456',
            { VALUE: 'URI' }
        )
    )

    const url = createAssignmentUrl(event)

    expect(url).toBeNull()
})
