import { it, expect } from 'vitest'
import { createExamRegistrationEvent, ExamRegistrationGroup } from '../../../app/lib/timeedit'
import { CalendarDate, CalendarEvent } from 'iamcal'

const startRegistrationGroup: ExamRegistrationGroup = {
	date: new CalendarDate('20251229'),
	isRegistrationStart: true,
	exams: [
		{
			name: 'Principer för parallel programmering',
			courseCodes: ['TDA384'],
			inst: 0,
		},
		{
			name: 'Maskinorienterad programmering',
			courseCodes: ['EDA433', 'DAT017'],
			inst: 1,
		},
	],
}

const endRegistrationGroup: ExamRegistrationGroup = {
	date: new CalendarDate('20260130'),
	isRegistrationStart: false,
	exams: [
		{
			name: 'Principer för parallel programmering',
			courseCodes: ['TDA384'],
			inst: 2,
		},
	],
}

it('follows the expected format for registration start', () => {
	const event = createExamRegistrationEvent(startRegistrationGroup)
	event.removePropertiesWithName('DTSTAMP')
    
	const expected = new CalendarEvent('20251229S1', new Date('2026-02-26T12:00:00.000Z'), new CalendarDate('20251229'))
	  .setSummary('Tentamen anmälan öppnar: TDA384, EDA433, DAT017')
	  .setDescription(`Anmäl dig på Ladok: https://student.ladok.se/student
 
Anmälan till tentor öppnar:
 
• Ordinarie tentamen: Principer för parallel programmering (TDA384)
• Omtenta: Maskinorienterad programmering (EDA433, DAT017)`)
	  .setLocation('Ladok')
	expected.removePropertiesWithName('DTSTAMP')

	expect(event).toStrictEqual(expected)
})

it('follows the expected format for registration end', () => {
	const event = createExamRegistrationEvent(endRegistrationGroup)
	event.removePropertiesWithName('DTSTAMP')
    
	const expected = new CalendarEvent('20260130S0', new Date('2026-02-26T12:00:00.000Z'), new CalendarDate('20260130'))
	  .setSummary('Tentamen anmälan stänger: TDA384')
	  .setDescription(`Anmäl dig på Ladok: https://student.ladok.se/student
 
Anmälan till tentor stänger:
 
• Omtenta: Principer för parallel programmering (TDA384)`)
	  .setLocation('Ladok')
	expected.removePropertiesWithName('DTSTAMP')

	expect(event).toStrictEqual(expected)
})

it('throws if exams is empty', () => {
	expect(() => {
		createExamRegistrationEvent({
			date: new CalendarDate('20251229'),
			isRegistrationStart: true,
			exams: []
		})
	}).toThrow('Exams cannot be empty')
})
