'use server'

import TimeEditAdapter from '@/app/lib/adapters/TimeEditAdapter'

const timeedit = new TimeEditAdapter()

export const POST = timeedit.createUrlRoute()
