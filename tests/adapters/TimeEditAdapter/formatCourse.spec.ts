import {
    formatCourse,
    TimeEditEventData,
} from '../../../src/backend/adapters/TimeEditAdapter'

it('follows the format "course name (course code)" when all data is present', () => {
    const data: TimeEditEventData = {
        kursnamn: ['Lorem ipsum'],
        kurskod: ['ABC123'],
    }
    const course = formatCourse(data)

    expect(course).toBe('Lorem ipsum (ABC123)')
})

it('follows the format "course name" when only course name is present', () => {
    const data: TimeEditEventData = {
        kursnamn: ['Lorem ipsum'],
    }
    const course = formatCourse(data)

    expect(course).toBe('Lorem ipsum')
})

it('follows the format "course code" when only course code is present', () => {
    const data: TimeEditEventData = {
        kurskod: ['ABC123'],
    }
    const course = formatCourse(data)

    expect(course).toBe('ABC123')
})

it('joins multiple course codes', () => {
    const data: TimeEditEventData = {
        kurskod: ['A', 'B'],
    }
    const course = formatCourse(data)

    expect(course).toBe('A, B')
})

it('omits extra course names', () => {
    const data: TimeEditEventData = {
        kursnamn: ['A', 'B'],
    }
    const course = formatCourse(data)

    expect(course).toBe('A')
})

it('shortens course codes', () => {
    const data: TimeEditEventData = {
        kurskod: ['ABC123_EXTRA_LONG_CODE456'],
    }
    const course = formatCourse(data)

    expect(course).toBe('ABC123')
})

it('returns null for no data', () => {
    const data: TimeEditEventData = {}
    const course = formatCourse(data)
    expect(course).toBeNull()
})
