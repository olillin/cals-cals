import TimeEditAdapter, {
    TimeEditEventData,
} from '../../../src/backend/adapters/TimeEditAdapter'

let adapter: TimeEditAdapter
beforeAll(() => {
    adapter = new TimeEditAdapter()
})

it('follows the format "course name (course code)" when all data is present', () => {
    const data: TimeEditEventData = {
        kursNamn: ['Lorem ipsum'],
        kursKod: ['ABC123'],
    }
    const course = adapter.formatCourse(data)

    expect(course).toBe('Lorem ipsum (ABC123)')
})

it('follows the format "course name" when only course name is present', () => {
    const data: TimeEditEventData = {
        kursNamn: ['Lorem ipsum'],
    }
    const course = adapter.formatCourse(data)

    expect(course).toBe('Lorem ipsum')
})

it('follows the format "course code" when only course code is present', () => {
    const data: TimeEditEventData = {
        kursKod: ['ABC123'],
    }
    const course = adapter.formatCourse(data)

    expect(course).toBe('ABC123')
})

it('joins multiple course codes', () => {
    const data: TimeEditEventData = {
        kursKod: ['A', 'B'],
    }
    const course = adapter.formatCourse(data)

    expect(course).toBe('A, B')
})

it('omits extra course names', () => {
    const data: TimeEditEventData = {
        kursNamn: ['A', 'B'],
    }
    const course = adapter.formatCourse(data)

    expect(course).toBe('A')
})

it('shortens course codes', () => {
    const data: TimeEditEventData = {
        kursKod: ['ABC123_EXTRA_LONG_CODE456'],
    }
    const course = adapter.formatCourse(data)

    expect(course).toBe('ABC123')
})

it('returns null for no data', () => {
    const data: TimeEditEventData = {}
    const course = adapter.formatCourse(data)
    expect(course).toBeNull()
})
