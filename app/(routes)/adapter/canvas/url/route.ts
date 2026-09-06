'use server'

import CanvasAdapter from '@/app/lib/adapter/CanvasAdapter'

const canvas = new CanvasAdapter()

export const POST = canvas.createUrlRoute()
