import TimeEditAdapter from '../../../../app/lib/adapter/TimeEditAdapter'
import { beforeAll, it, expect } from 'vitest'

let adapter: TimeEditAdapter
beforeAll(() => {
    adapter = new TimeEditAdapter()
})

it('should create the correct URL for public calendars', () => {
    const url = adapter.createUrl('public.abc123')
    expect(url.href).toBe(
        'https://cloud.timeedit.net/chalmers/web/public/abc123.ics'
    )
})

it('should create the correct URL for other categories', () => {
    const url = adapter.createUrl('student.def456')
    expect(url.href).toBe(
        'https://cloud.timeedit.net/chalmers/web/student/def456.ics'
    )
})
