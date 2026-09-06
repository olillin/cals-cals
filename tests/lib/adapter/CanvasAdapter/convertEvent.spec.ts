import { CalendarDateTime, CalendarEvent, Property } from 'iamcal'
import { convertEvent } from '@/app/lib/adapter/CanvasAdapter'
import { beforeEach, it, expect, vi } from 'vitest'

const time = new CalendarDateTime('20260906T120000')

const assignmentUid = 'event-assignment-123456'
const assignmentSummary = 'My assignment [ABC123]'
const assignmentUrl =
    'https://canvas.chalmers.se/calendar?include_contexts=course_78900&month=09&year=2026#assignment_123456'
const plainDescription = 'Plain description'
const richDescription = 'Rich description'

let richDescriptionAssignment: CalendarEvent
let invalidRichDescriptionAssignment: CalendarEvent
let plainDescriptionAssignment: CalendarEvent
let plainDescriptionUrlAssignment: CalendarEvent
let richDescriptionUrlAssignment: CalendarEvent
let noDescriptionUrlAssignment: CalendarEvent

beforeEach(() => {
    richDescriptionAssignment = new CalendarEvent(assignmentUid, time, time)
        .setSummary(assignmentSummary)
        .setDescription(plainDescription)
        .addProperty(
            new Property('X-ALT-DESC', richDescription, {
                FMTTYPE: 'text/html',
            })
        )
    invalidRichDescriptionAssignment = new CalendarEvent(
        assignmentUid,
        time,
        time
    )
        .setSummary(assignmentSummary)
        .setDescription(plainDescription)
        .setProperty('X-ALT-DESC', richDescription)
    plainDescriptionAssignment = new CalendarEvent(assignmentUid, time, time)
        .setSummary(assignmentSummary)
        .setDescription(plainDescription)

    plainDescriptionUrlAssignment = new CalendarEvent(assignmentUid, time, time)
        .setSummary(assignmentSummary)
        .setDescription(plainDescription)
        .setProperty('URL', assignmentUrl)
    richDescriptionUrlAssignment = new CalendarEvent(assignmentUid, time, time)
        .setSummary(assignmentSummary)
        .setDescription(plainDescription)
        .addProperty(
            new Property('X-ALT-DESC', richDescription, {
                FMTTYPE: 'text/html',
            })
        )
        .setProperty('URL', assignmentUrl)
    noDescriptionUrlAssignment = new CalendarEvent(assignmentUid, time, time)
        .setSummary(assignmentSummary)
        .setProperty('URL', assignmentUrl)
})

it('replaces the description with rich description by default', () => {
    convertEvent(richDescriptionAssignment)
    expect(richDescriptionAssignment.getDescription()).toBe(richDescription)
})

it('replaces the description with rich description when plainDescription is false', () => {
    convertEvent(richDescriptionAssignment, { plainDescription: false })
    expect(richDescriptionAssignment.getDescription()).toBe(richDescription)
})

it('does not replace the description with rich description when plainDescription is true', () => {
    convertEvent(richDescriptionAssignment, { plainDescription: true })
    expect(richDescriptionAssignment.getDescription()).toBe(plainDescription)
})

it('removes X-ALT-DESC after replacing description', () => {
    convertEvent(richDescriptionAssignment)
    expect(richDescriptionAssignment.getProperty('X-ALT-DESC')).toBeNull()
})

it('does not remove X-ALT-DESC if the description was not replaced', () => {
    convertEvent(richDescriptionAssignment, { plainDescription: true })
    expect(richDescriptionAssignment.getProperty('X-ALT-DESC')?.value).toBe(
        richDescription
    )
})

it('does not remove X-ALT-DESC if FMTTYPE is incorrect', () => {
    // Ignore warning message
    vi.spyOn(console, 'warn').mockImplementation(() => undefined)

    convertEvent(invalidRichDescriptionAssignment)
    expect(
        invalidRichDescriptionAssignment.getProperty('X-ALT-DESC')?.value
    ).toBe(richDescription)
})

it('does not mutate description if X-ALT-DESC is missing', () => {
    convertEvent(plainDescriptionAssignment)
    expect(plainDescriptionAssignment.getDescription()).toBe(plainDescription)
})

it('prepends the assignment URL', () => {
    convertEvent(plainDescriptionUrlAssignment)
    expect(plainDescriptionUrlAssignment.getDescription()).toMatch(
        /^Assignment on Canvas: https:\/\//
    )
})

it('can prepend the assignment URL and replace with rich description', () => {
    convertEvent(richDescriptionUrlAssignment)
    expect(richDescriptionUrlAssignment.getDescription()).toMatch(
        /^Assignment on Canvas: https:\/\//
    )
    expect(richDescriptionUrlAssignment.getDescription()).toMatch(
        richDescription
    )
})

it('creates description with assignment URL if missing', () => {
    convertEvent(noDescriptionUrlAssignment)
    expect(noDescriptionUrlAssignment.getDescription()).toMatch(
        /^Assignment on Canvas: https:\/\/[^\n]+$/s
    )
})
