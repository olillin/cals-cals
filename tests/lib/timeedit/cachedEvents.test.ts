import {
    getCachedEvents,
    getCachedMeta,
    TimeEditEvent,
    TimeEditMeta,
    updateCachedEvents,
    updateCachedMeta,
} from '@/app/lib/timeedit'
import { expect, test } from 'vitest'

const calendarId =
    'public.ri6514Qt6Z0ZyQQ8b15QQZ7558590Xd03565Zu0QeY7nl8jZ6n96n6367AQ262274105637A6o6C1E7ZABAA2tECB80o58178E2724'

test('cache events', async () => {
    const initialEvents = await getCachedEvents(calendarId)
    expect(initialEvents).toStrictEqual([])

    const yearWeek = 202619
    const events: TimeEditEvent[] = [
        {
            uid: 'abc123',
            start: new Date('2026-05-05T12:00Z'),
            end: new Date('2026-05-05T13:00Z'),
            stamp: new Date('2026-05-05T12:00Z'),
            content: {
                aktivitet: ['Föreläsning'],
            },
        },
    ]
    await updateCachedEvents(calendarId, yearWeek, events)

    const cachedEvents = await getCachedEvents(calendarId)

    expect(cachedEvents).toStrictEqual(events)
})

test('cache meta', async () => {
    const initialMeta = await getCachedMeta(calendarId)
    expect(initialMeta).toBeNull()

    const meta: TimeEditMeta = {
        name: 'Calendar name',
        prodid: 'prod id',
    }
    await updateCachedMeta(calendarId, meta)

    const cachedMeta = await getCachedMeta(calendarId)
    expect(cachedMeta).toStrictEqual(meta)
})
