import { CalendarDateTime, CalendarEvent } from 'iamcal'
import TimeEditAdapter from '../../../src/backend/adapters/TimeEditAdapter'

let adapter: TimeEditAdapter
let validEvent: CalendarEvent
let invalidEvent: CalendarEvent
let emptyEvent: CalendarEvent

const time = new CalendarDateTime('20250919T120000')
const summary = 'Activity: A'
const description = 'Lorem ipsum'
const location = 'Lokalnamn: B'

beforeAll(() => {
    adapter = new TimeEditAdapter()
})

beforeEach(() => {
    validEvent = new CalendarEvent('', time, time)
        .setSummary(summary)
        .setDescription(description)
        .setLocation(location)
    invalidEvent = new CalendarEvent('', time, time)
        .setSummary('A')
        .setDescription('B')
        .setLocation('C')
    emptyEvent = new CalendarEvent('', time, time)
})

it('mutates summary', () => {
    adapter.convertEvent(validEvent)
    expect(validEvent.getSummary()).not.toBe(summary)
})

it('mutates description', () => {
    adapter.convertEvent(validEvent)
    expect(validEvent.getDescription()).not.toBe(description)
})

it('adds description if missing', () => {
    validEvent.removeDescription()
    adapter.convertEvent(validEvent)
    expect(validEvent.getDescription()).not.toBeUndefined()
})

it('mutates location', () => {
    adapter.convertEvent(validEvent)
    expect(validEvent.getLocation()).not.toBe(location)
})

it('keeps summary if unable to parse', () => {
    adapter.convertEvent(invalidEvent)
    expect(invalidEvent.getSummary()).toBe('A')
})

it('keeps description if unable to parse summary', () => {
    adapter.convertEvent(invalidEvent)
    expect(invalidEvent.getDescription()).toBe('B')
})

it('keeps location if unable to parse', () => {
    adapter.convertEvent(invalidEvent)
    expect(invalidEvent.getLocation()).toBe('C')
})

it('does not add summary on empty event', () => {
    adapter.convertEvent(emptyEvent)
    expect(emptyEvent.getSummary()).toBeUndefined()
})

it('does not add description on empty event', () => {
    adapter.convertEvent(emptyEvent)
    expect(emptyEvent.getDescription()).toBeUndefined()
})

it('does not add location on empty event', () => {
    adapter.convertEvent(emptyEvent)
    expect(emptyEvent.getLocation()).toBeUndefined()
})
