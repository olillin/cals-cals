import { CalendarDateTime, CalendarEvent } from 'iamcal'
import {
    isGlobalEvent,
    serializeEventData,
    TimeEditEventData,
} from '../../../app/lib/timeedit'
import { it, expect, beforeEach } from 'vitest'

let event: CalendarEvent
beforeEach(() => {
    const start = new CalendarDateTime('20260319T160000')
    const end = new CalendarDateTime('20260319T180000')
    event = new CalendarEvent('uid', start, start).setEnd(end)
})

it('matches empty events', () => {
    event.setSummary('').setLocation('')

    const result = isGlobalEvent(event)
    expect(result).toBe(true)
})

it('matches events with only a title', () => {
    const data: TimeEditEventData = {
        titel: ['foo'],
    }
    event.setSummary(serializeEventData(data))

    const result = isGlobalEvent(event)
    expect(result).toBe(true)
})

it('does not match events with course codes', () => {
    const data: TimeEditEventData = {
        kurskod: ['TDA384'],
    }
    event.setSummary(serializeEventData(data))

    const result = isGlobalEvent(event)
    expect(result).toBe(false)
})

it('does not match events with course names', () => {
    const data: TimeEditEventData = {
        kursnamn: ['foo'],
    }
    event.setSummary(serializeEventData(data))

    const result = isGlobalEvent(event)
    expect(result).toBe(false)
})

it('does not match events with title and course codes', () => {
    const data: TimeEditEventData = {
        titel: ['foo'],
        kurskod: ['TDA384'],
    }
    event.setSummary(serializeEventData(data))

    const result = isGlobalEvent(event)
    expect(result).toBe(false)
})
