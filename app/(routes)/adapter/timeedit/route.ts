'use server'

import TimeEditAdapter from '@/app/lib/adapter/TimeEditAdapter'

const timeedit = new TimeEditAdapter()

export const GET = timeedit.createCalendarRoute()
