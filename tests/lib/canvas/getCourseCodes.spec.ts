import { getCourseCodes } from '@/app/lib/canvas'
import { CalendarDateTime, CalendarEvent } from 'iamcal'
import { it, expect } from 'vitest'

const date = new CalendarDateTime('20260906T120000')

it('correctly finds one course code in summary', () => {
    const event = new CalendarEvent(
        'event-assignment-123456',
        date,
        date
    ).setSummary('My assignment [ABC123]')

    const courseCodes = getCourseCodes(event)

    expect(courseCodes).toStrictEqual(['ABC123'])
})

it('correctly finds two course codes in summary', () => {
    const event = new CalendarEvent(
        'event-assignment-123456',
        date,
        date
    ).setSummary('My assignment [ABC123 / DEF456]')

    const courseCodes = getCourseCodes(event)

    expect(courseCodes).toStrictEqual(['ABC123', 'DEF456'])
})

it('correctly finds three course codes in summary', () => {
    const event = new CalendarEvent(
        'event-assignment-123456',
        date,
        date
    ).setSummary('My assignment [ABC123 / DEF456 / GHI789]')

    const courseCodes = getCourseCodes(event)

    expect(courseCodes).toStrictEqual(['ABC123', 'DEF456', 'GHI789'])
})

it('correctly finds course codes when event is a calendar-event', () => {
    const event = new CalendarEvent(
        'event-calendar-event-123456',
        date,
        date
    ).setSummary('My event [ABC123]')

    const courseCodes = getCourseCodes(event)

    expect(courseCodes).toStrictEqual(['ABC123'])
})

it('returns empty list when there is no course code', () => {
    const event = new CalendarEvent(
        'event-assignment-123456',
        date,
        date
    ).setSummary('My assignment')

    const courseCodes = getCourseCodes(event)

    expect(courseCodes).toStrictEqual([])
})

it('returns empty list when the course code is empty', () => {
    const event = new CalendarEvent(
        'event-assignment-123456',
        date,
        date
    ).setSummary('My assignment [ ]')

    const courseCodes = getCourseCodes(event)

    expect(courseCodes).toStrictEqual([])
})

it('is not sensitive to spacing', () => {
    const event = new CalendarEvent(
        'event-assignment-123456',
        date,
        date
    ).setSummary('My assignment [ABC123/DEF456]')

    const courseCodes = getCourseCodes(event)

    expect(courseCodes).toStrictEqual(['ABC123', 'DEF456'])
})

it('can find GU course codes', () => {
    const event = new CalendarEvent(
        'event-assignment-123456',
        date,
        date
    ).setSummary('My assignment [ABC123 / DEF456_GU]')

    const courseCodes = getCourseCodes(event)

    expect(courseCodes).toStrictEqual(['ABC123', 'DEF456_GU'])
})
