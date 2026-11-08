
import { CalendarDate, CalendarDateTime, CalendarEvent } from 'iamcal'
import { NextRequest } from 'next/server'
import { it, expect } from 'vitest'

it('splits values correctly', () => {
	const serialized = 'a b c'
	const req = new NextRequest({
		searchParams: new URLSearchParams([
			['group', '0'],
			['gi', serialized],
		])
	})

})
