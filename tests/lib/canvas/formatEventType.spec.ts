import { formatEventType } from '@/app/lib/canvas'
import { expect, it } from 'vitest'

it('capitalizes words', () => {
    const result = formatEventType('assignment')
    expect(result).toBe('Assignment')
})

it('converts hyphens to spaces', () => {
    const result = formatEventType('calendar-event')
    expect(result).toBe('Calendar Event')
})
