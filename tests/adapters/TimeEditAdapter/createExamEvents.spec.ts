import { createExamEvents } from '../../../src/backend/adapters/TimeEditAdapter'
import {type Exam} from 'chalmers-search-exam'

const mockExam: Exam = {
	name: 'Objektorienterad programmering och design',
	updated: new Date('2026-01-27T11:00:00.000Z'),
	location: 'Johanneberg',
	registrationStart: new Date('2025-12-28T23:00:00.000Z'),
	registrationEnd: new Date('2026-02-28T23:00:00.000Z'),
	start: new Date('2026-03-19T13:00:00.000Z'),
	end: new Date('2026-03-19T17:00:00.000Z'),
	duration: 4,
	courseCode: 'TDA553',
	isCancelled: false,
	courseId: 40337,
	dateChanges: [],
	id: 'norm_63294',
	inst: 0,
	cmCode: '0122',
	part: '',
	ordinal: 1,
	isDigital: false,
}

jest.mock('chalmers-search-exam', () => {
	const originalModule = jest.requireActual('chalmers-search-exam')
	return {
		__esModule: true,
		...originalModule,
        searchExam: jest.fn((query: string) => Promise.resolve([mockExam])),
	}
})


it('returns no events for no course codes', async () => {
	const events = await createExamEvents([])
	expect(events).toStrictEqual([])
})

it('ignores empty course code groups', async () => {
	const events = await createExamEvents([[], [], []])
	console.log("EVENTS NO QUERY")
	console.log(events)
	expect(events).toStrictEqual([])
})

it('returns one event for one exam', async () => {
	const events = await createExamEvents([['TDA553']])
	console.log("EVENTS WITH QUERY")
	console.log(events)
	expect(events).toHaveLength(1)
})

