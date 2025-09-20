import TimeEditAdapter from '../../../src/backend/adapters/TimeEditAdapter'

let adapter: TimeEditAdapter
beforeAll(() => {
    adapter = new TimeEditAdapter()
})

it('groups strings correctly', () => {
    const summary =
        'Kurs kod: ABC123. Kurs namn: Lorem ipsum, Kurs kod: DEF456. Kurs namn: Foo spam, Activity: Föreläsning, Klass kod: KLASS-1. Klass namn: Rats'
    const data = adapter['groupEventDataString'](summary)

    expect(data.kursKod).toStrictEqual(['ABC123', 'DEF456'])
    expect(data.kursNamn).toStrictEqual(['Lorem ipsum', 'Foo spam'])
    expect(data.activity).toStrictEqual(['Föreläsning'])
    expect(data.klassKod).toStrictEqual(['KLASS-1'])
    expect(data.klassNamn).toStrictEqual(['Rats'])
    expect(data).not.toHaveProperty('Kurs kod')
    expect(data).not.toHaveProperty('titel')
})

it('deduplicates repeat values', () => {
    const s = 'Campus: A. Campus: A, Campus: A'
    const data = adapter['groupEventDataString'](s)

    expect(data.campus).toStrictEqual(['A'])
})

it('does not deduplicate campus if there are multiple values', () => {
    const s = 'Campus: A. Campus: A, Campus: B, Campus: A'
    const data = adapter['groupEventDataString'](s)

    expect(data.campus).toStrictEqual(['A', 'A', 'B', 'A'])
})

it('deduplicates multiple campuses together with room', () => {
    const s =
        'Lokalnamn: 1, Campus: A. Lokalnamn: 2, Campus: A, Lokalnamn: 3, Campus: B, Lokalnamn: 2, Campus: A'
    const data = adapter['groupEventDataString'](s)

    expect(data.lokalnamn).toStrictEqual(['1', '2', '3'])
    expect(data.campus).toStrictEqual(['A', 'A', 'B'])
})

it('does not deduplicates rooms on different campuses', () => {
    const s = 'Lokalnamn: 1, Campus: A. Lokalnamn: 1, Campus: B'
    const data = adapter['groupEventDataString'](s)

    expect(data.lokalnamn).toStrictEqual(['1', '1'])
    expect(data.campus).toStrictEqual(['A', 'B'])
})

it('combines multiple sources', () => {
    const s1 = 'Foo: Spam. Lorem: Ipsum, Same: Value'
    const s2 = 'Spam: Foo, Lorem: Solor. Same: Value'
    const data = adapter['groupEventDataString'](s1, s2)

    expect(data['foo']).toStrictEqual(['Spam'])
    expect(data['spam']).toStrictEqual(['Foo'])
    expect(data['lorem']).toStrictEqual(['Ipsum', 'Solor'])
    expect(data['same']).toStrictEqual(['Value'])
})

it('returns an empty object for an empty string', () => {
    const data = adapter['groupEventDataString']('')
    expect(data).toStrictEqual({})
})

it('returns an empty object for no input', () => {
    const data = adapter['groupEventDataString']()
    expect(data).toStrictEqual({})
})
