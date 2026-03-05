import { createExamEvents } from '../../../app/lib/timeedit'
import { searchExam, type Exam } from 'chalmers-search-exam'
import { it, expect, vi } from 'vitest'

vi.mock(import('chalmers-search-exam'), async () => {
    const mockExam = (courseCode: string): Exam => ({
        name: 'Objektorienterad programmering och design',
        updated: new Date('2026-01-27T11:00:00.000Z'),
        location: 'Johanneberg',
        registrationStart: new Date('2025-12-28T23:00:00.000Z'),
        registrationEnd: new Date('2026-02-28T23:00:00.000Z'),
        start: new Date('2026-03-19T13:00:00.000Z'),
        end: new Date('2026-03-19T17:00:00.000Z'),
        duration: 4,
        courseCode,
        isCancelled: false,
        courseId: 40337,
        dateChanges: [],
        id: 'norm_63294',
        inst: 0,
        cmCode: '0122',
        part: '',
        ordinal: 1,
        isDigital: false,
    })

    const originalModule = await vi.importActual('chalmers-search-exam')
    return {
        __esModule: true,
        ...originalModule,
        searchExam: vi.fn((query: string) =>
            Promise.resolve([mockExam(query)])
        ),
    }
})

it('returns no events for no course codes', async () => {
    const events = await createExamEvents([])
    expect(events).toStrictEqual([])
    expect(searchExam).not.toBeCalled()
})

it('ignores empty course code groups', async () => {
    const events = await createExamEvents([[], [], []])
    expect(events).toStrictEqual([])
    expect(searchExam).not.toBeCalled()
})

it('returns one event for one exam', async () => {
    const events = await createExamEvents([['TDA553']])
    expect(events).toHaveLength(1)
    expect(searchExam).toBeCalled()
})

it('deduplicates events in the same group', async () => {
    const events = await createExamEvents([['TDA553', 'DIT954']])
    expect(events).toHaveLength(1)
    expect(searchExam).toBeCalled()
})

it('does not deduplicate events in separate groups', async () => {
    const events = await createExamEvents([['TDA553'], ['TDA384']])
    expect(events).toHaveLength(2)
    expect(searchExam).toBeCalled()
})
