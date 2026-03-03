import { it, expect } from 'vitest'
import {
    createExamEvent,
    johannebergExamScheduleUrl,
    MultiExam,
} from '../../../app/lib/timeedit'
import { CalendarEvent } from 'iamcal'

const multiExam1: MultiExam = {
    name: 'Objektorienterad programmering och design',
    updated: new Date('2026-01-27T11:00:00.000Z'),
    location: 'Johanneberg',
    registrationStart: new Date('2025-12-28T23:00:00.000Z'),
    registrationEnd: new Date('2026-02-28T23:00:00.000Z'),
    start: new Date('2026-03-19T13:00:00.000Z'),
    end: new Date('2026-03-19T17:00:00.000Z'),
    duration: 4,
    courseCode: 'TDA553',
    courseCodes: ['TDA553'],
    isCancelled: false,
    courseId: 40337,
    dateChanges: [],
    id: 'norm_63294',
    inst: 0,
    cmCode: '0122',
    part: '',
    ordinal: 1,
    isDigital: false,
}

const multiExam2: MultiExam = {
    name: 'Objektorienterad programmering och design',
    updated: new Date('2026-01-27T11:00:00.000Z'),
    location: 'Johanneberg',
    registrationStart: new Date('2025-12-28T23:00:00.000Z'),
    registrationEnd: new Date('2026-02-28T23:00:00.000Z'),
    start: new Date('2026-03-19T13:00:00.000Z'),
    end: new Date('2026-03-19T17:00:00.000Z'),
    duration: 4,
    courseCode: 'TDA553',
    courseCodes: ['TDA553', 'DIT954'],
    isCancelled: false,
    courseId: 40337,
    dateChanges: [],
    id: 'norm_63294',
    inst: 0,
    cmCode: '0122',
    part: '',
    ordinal: 1,
    isDigital: false,
}

it('follows the expected format for one event', () => {
    const event = createExamEvent(multiExam1)
    event.removePropertiesWithName('DTSTAMP')

    const expected = new CalendarEvent(
        'norm_63294',
        new Date('2026-02-26T12:00:00.000Z'),
        new Date('2026-03-19T13:00:00.000Z')
    )
        .setEnd(new Date('2026-03-19T17:00:00.000Z'))
        .setLocation('Campus: Johanneberg')
        .setSummary(
            'Aktivitet: Tentamen. Kurskod: TDA553. Kursnamn: Objektorienterad programmering och design. Registrering: 2025-11-29 - 2026-02-01'
        )
        .setProperty('URL', johannebergExamScheduleUrl)
    expected.removePropertiesWithName('DTSTAMP')

    expect(event).toStrictEqual(expected)
})

it('follows the expected format for two events', () => {
    const event = createExamEvent(multiExam2)
    event.removePropertiesWithName('DTSTAMP')

    const expected = new CalendarEvent(
        'norm_63294',
        new Date('2026-02-26T12:00:00.000Z'),
        new Date('2026-03-19T13:00:00.000Z')
    )
        .setEnd(new Date('2026-03-19T17:00:00.000Z'))
        .setLocation('Campus: Johanneberg')
        .setSummary(
            'Aktivitet: Tentamen. Kurskod: TDA553. Kurskod: DIT954. Kursnamn: Objektorienterad programmering och design. Registrering: 2025-11-29 - 2026-02-01'
        )
        .setProperty('URL', johannebergExamScheduleUrl)
    expected.removePropertiesWithName('DTSTAMP')

    expect(event).toStrictEqual(expected)
})
