import { parseEventDataString } from '../../../app/lib/timeedit'
import { it, expect } from 'vitest'

it('groups strings correctly', () => {
    const summary =
        'Kurs kod: ABC123. Kurs namn: Lorem ipsum, Kurs kod: DEF456. Kurs namn: Foo spam, Activity: Föreläsning, Klass kod: KLASS-1. Klass namn: Rats'
    const data = parseEventDataString(summary)

    expect(data.kurskod).toStrictEqual(['ABC123', 'DEF456'])
    expect(data.kursnamn).toStrictEqual(['Lorem ipsum', 'Foo spam'])
    expect(data.aktivitet).toStrictEqual(['Föreläsning'])
    expect(data.klasskod).toStrictEqual(['KLASS-1'])
    expect(data.klassnamn).toStrictEqual(['Rats'])
    expect(data).not.toHaveProperty('Kurs kod')
    expect(data).not.toHaveProperty('titel')
})

it('deduplicates repeat values', () => {
    const s = 'Campus: A. Campus: A, Campus: A'
    const data = parseEventDataString(s)

    expect(data.campus).toStrictEqual(['A'])
})

it('does not deduplicate campus if there are multiple values', () => {
    const s = 'Campus: A. Campus: A, Campus: B, Campus: A'
    const data = parseEventDataString(s)

    expect(data.campus).toStrictEqual(['A', 'A', 'B', 'A'])
})

it('deduplicates multiple campuses together with room', () => {
    const s =
        'Lokalnamn: 1, Campus: A. Lokalnamn: 2, Campus: A, Lokalnamn: 3, Campus: B, Lokalnamn: 2, Campus: A'
    const data = parseEventDataString(s)

    expect(data.lokalnamn).toStrictEqual(['1', '2', '3'])
    expect(data.campus).toStrictEqual(['A', 'A', 'B'])
})

it('does not deduplicates rooms on different campuses', () => {
    const s = 'Lokalnamn: 1, Campus: A. Lokalnamn: 1, Campus: B'
    const data = parseEventDataString(s)

    expect(data.lokalnamn).toStrictEqual(['1', '1'])
    expect(data.campus).toStrictEqual(['A', 'B'])
})

it('combines multiple sources', () => {
    const s1 = 'Foo: Spam. Lorem: Ipsum, Same: Value'
    const s2 = 'Spam: Foo, Lorem: Solor. Same: Value'
    const data = parseEventDataString(s1, s2)

    expect(data['foo']).toStrictEqual(['Spam'])
    expect(data['spam']).toStrictEqual(['Foo'])
    expect(data['lorem']).toStrictEqual(['Ipsum', 'Solor'])
    expect(data['same']).toStrictEqual(['Value'])
})

it('returns an empty object for an empty string', () => {
    const data = parseEventDataString('')
    expect(data).toStrictEqual({})
})

it('returns an empty object for no input', () => {
    const data = parseEventDataString()
    expect(data).toStrictEqual({})
})

it('translates "activity" to "aktivitet"', () => {
    const s = 'Activity: Föreläsning'
    const data = parseEventDataString(s)

    expect(data.aktivitet).toStrictEqual(['Föreläsning'])
    expect(data).not.toHaveProperty('activity')
})

it('translates "classcode" to "klasskod"', () => {
    const s = 'Class code: Foo'
    const data = parseEventDataString(s)

    expect(data.klasskod).toStrictEqual(['Foo'])
    expect(data).not.toHaveProperty('classcode')
})

it('translates "name" to "klassnamn"', () => {
    const s = 'Name: Foo'
    const data = parseEventDataString(s)

    expect(data.klassnamn).toStrictEqual(['Foo'])
    expect(data).not.toHaveProperty('name')
})

it('translates "coursecode" to "kurskod"', () => {
    const s = 'Course code: Foo'
    const data = parseEventDataString(s)

    expect(data.kurskod).toStrictEqual(['Foo'])
    expect(data).not.toHaveProperty('coursecode')
})

it('translates "coursename" to "kursnamn"', () => {
    const s = 'Course name: Foo'
    const data = parseEventDataString(s)

    expect(data.kursnamn).toStrictEqual(['Foo'])
    expect(data).not.toHaveProperty('coursename')
})

it('translates "room" to "lokalnamn"', () => {
    const s = 'Room: Foo'
    const data = parseEventDataString(s)

    expect(data.lokalnamn).toStrictEqual(['Foo'])
    expect(data).not.toHaveProperty('room')
})

it('translates "maplink" to "kartlänk"', () => {
    const s = 'Map link: Foo'
    const data = parseEventDataString(s)

    expect(data.kartlänk).toStrictEqual(['Foo'])
    expect(data).not.toHaveProperty('maplink')
})

it('can parse one word keys', () => {
    const s = 'KursKod: Foo'
    const data = parseEventDataString(s)

    expect(data.kurskod).toStrictEqual(['Foo'])
})
