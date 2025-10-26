import { CalendarDateTime, CalendarEvent } from 'iamcal'
import TimeEditAdapter, {
    convertEvent,
} from '../../../src/backend/adapters/TimeEditAdapter'

let adapter: TimeEditAdapter
let validEvent: CalendarEvent
let invalidEvent: CalendarEvent
let emptyEvent: CalendarEvent

const time = new CalendarDateTime('20250919T120000')
const summary = 'Activity: A'
const description = 'Lorem ipsum'
const location = 'Lokalnamn: B'

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
    convertEvent(validEvent)
    expect(validEvent.getSummary()).not.toBe(summary)
})

it('mutates description', () => {
    convertEvent(validEvent)
    expect(validEvent.getDescription()).not.toBe(description)
})

it('adds description if missing', () => {
    validEvent.removeDescription()
    convertEvent(validEvent)
    expect(validEvent.getDescription()).not.toBeUndefined()
})

it('mutates location', () => {
    convertEvent(validEvent)
    expect(validEvent.getLocation()).not.toBe(location)
})

it('keeps summary if unable to parse', () => {
    convertEvent(invalidEvent)
    expect(invalidEvent.getSummary()).toBe('A')
})

it('keeps description if unable to parse summary', () => {
    convertEvent(invalidEvent)
    expect(invalidEvent.getDescription()).toBe('B')
})

it('keeps location if unable to parse', () => {
    convertEvent(invalidEvent)
    expect(invalidEvent.getLocation()).toBe('C')
})

it('does not add summary on empty event', () => {
    convertEvent(emptyEvent)
    expect(emptyEvent.getSummary()).toBeUndefined()
})

it('does not add description on empty event', () => {
    convertEvent(emptyEvent)
    expect(emptyEvent.getDescription()).toBeUndefined()
})

it('does not add location on empty event', () => {
    convertEvent(emptyEvent)
    expect(emptyEvent.getLocation()).toBeUndefined()
})
