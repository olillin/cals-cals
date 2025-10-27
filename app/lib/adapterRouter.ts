import { Router } from 'express'
import TimeEditAdapter from './adapters/TimeEditAdapter'

const timeEditAdapter = new TimeEditAdapter()

const router = Router()

router.use('/timeedit', timeEditAdapter.createRouter())

export default router
