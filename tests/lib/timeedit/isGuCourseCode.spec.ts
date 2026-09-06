import { isGuCourseCode } from '@/app/lib/timeedit'
import { it, expect } from 'vitest'

it('returns true for course codes ending with GU', () => {
    const result = isGuCourseCode('DIT993GU')
    expect(result).toBe(true)
})

it('returns false for Chalmers format course codes', () => {
    const result = isGuCourseCode('DAT026_50_HT26_52118')
    expect(result).toBe(false)
})

it('returns false for Chalmers format course codes containing GU', () => {
    const result = isGuCourseCode('TGU026_50_HT26_52118')
    expect(result).toBe(false)
})
