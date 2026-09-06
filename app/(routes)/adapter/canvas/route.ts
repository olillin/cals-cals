'use server'

import CanvasAdapter from '@/app/lib/adapter/CanvasAdapter'

const canvas = new CanvasAdapter()

export const GET = canvas.createCalendarRoute()
