import { CalendarDate, CalendarDateTime, CalendarEvent } from 'iamcal'
import HashSlicer from '../../../../app/lib/slicer/HashSlicer'
import { it, expect } from 'vitest'

const event1 = new CalendarEvent(
    '1',
    new CalendarDateTime('20251019T195400'),
    new CalendarDate('20251019')
).setSummary('Type A')
const event2 = new CalendarEvent(
    '2',
    new CalendarDateTime('20251019T195400'),
    new CalendarDate('20251020')
).setSummary('Type A')

it('returns the same amount of groups as the slicer size', () => {
    const slicer = new HashSlicer(() => 0, 7)

    const groups = slicer.groupEvents([])

    expect(groups).toHaveLength(7)
})

it('has the correct hash at each index', () => {
    const slicer = new HashSlicer(() => 0, 9)

    const groups = slicer.groupEvents([])

    for (let i = 0; i < 9; i++) {
        expect(groups[i].hash).toBe(i)
    }
})

it('puts events at the same index as the hash', () => {
    const slicer = new HashSlicer(() => 2, 3)

    const groups = slicer.groupEvents([event1])

    expect(groups).toHaveLength(3)
    expect(groups[0].events).toStrictEqual([])
    expect(groups[1].events).toStrictEqual([])
    expect(groups[2].events).toStrictEqual([event1])
})

it('converts hashes to absolute values', () => {
    const slicer = new HashSlicer(() => -2, 3)

    const groups = slicer.groupEvents([event1])

    expect(groups).toHaveLength(3)
    expect(groups[0].events).toStrictEqual([])
    expect(groups[1].events).toStrictEqual([])
    expect(groups[2].events).toStrictEqual([event1])
})

it('puts events at the same index as the hash modulo the size of the slicer', () => {
    const slicer = new HashSlicer(() => 5, 3)

    const groups = slicer.groupEvents([event1])

    expect(groups).toHaveLength(3)
    expect(groups[0].events).toStrictEqual([])
    expect(groups[1].events).toStrictEqual([])
    expect(groups[2].events).toStrictEqual([event1])
})

it('puts events with the same hash in the same group', () => {
    const slicer = new HashSlicer(() => 0, 5)

    const groups = slicer.groupEvents([event1, event2])

    expect(groups[0].events).toStrictEqual([event1, event2])
})

it('puts events with different hashes in different groups', () => {
    const slicer = new HashSlicer(event => parseInt(event.getUid()), 5)

    const groups = slicer.groupEvents([event1, event2])

    expect(groups[1].events).toStrictEqual([event1])
    expect(groups[2].events).toStrictEqual([event2])
})
