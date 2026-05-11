import { CalendarEvent } from 'iamcal'
import {
    serializeEvent,
    serializeEventData,
    TimeEditEvent,
} from '../../../app/lib/timeedit'
import { it, expect, beforeAll } from 'vitest'

const stamp = new Date('2026-05-11T12:00Z')
const start = new Date('2026-05-11T13:00Z')
const end = new Date('2026-05-11T14:30Z')

const event: TimeEditEvent = {
    stamp,
    start,
    end,
    uid: 'lorem',
    content: {
        aktivitet: ['lab'],
        kurskod: ['foo'],
        kursnamn: ['spam'],
        campus: ['Johanneberg'],
    },
}
let serializedEvent: CalendarEvent

beforeAll(() => {
    serializedEvent = serializeEvent(event)
})

it('sets the summary from the event content', () => {
    const expectedSummary = serializeEventData(event.content)
    expect(serializedEvent.getSummary()).toBe(expectedSummary)
})

it('sets the description to be empty', () => {
    expect(serializedEvent.getDescription()).toBe('')
})

it('sets the uid from the data', () => {
    expect(serializedEvent.getUid()).toBe('lorem')
})

it('sets the stamp time from the data', () => {
    expect(serializedEvent.getStamp().getDate()).toStrictEqual(stamp)
})

it('sets the start time from the data', () => {
    expect(serializedEvent.getStart().getDate()).toStrictEqual(start)
})

it('sets the end time from the data', () => {
    expect(serializedEvent.getEnd().getDate()).toStrictEqual(end)
})

it('does not set a location', () => {
    expect(serializedEvent.getLocation()).toBeUndefined()
})
