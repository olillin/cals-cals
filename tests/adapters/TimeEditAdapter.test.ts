import { CalendarDateTime, CalendarEvent, parseCalendar } from 'iamcal'
import TimeEditAdapter from '../../src/backend/adapters/TimeEditAdapter'

let adapter: TimeEditAdapter
beforeAll(() => {
    adapter = new TimeEditAdapter()
})

const time = new CalendarDateTime('20250919T120000')

describe('groupEventDataString', () => {
    test('it splits strings', () => {
        const event = new CalendarEvent('', time, time).setSummary('')
    })
})

// test('log converted events', async () => {
//     await parseCalendar(CALENDAR_CONTENT).then(calendar => {
//         const converted = adapter.convertCalendar(calendar)
//         console.log(
//             converted
//                 .getEvents()
//                 .map(e => e.serialize())
//                 .join('\n\n')
//         )
//     })
// })

const CALENDAR_CONTENT = String.raw`BEGIN:VCALENDAR
VERSION:2.0
METHOD:PUBLISH
X-WR-CALNAME:TimeEdit-TKITE-2\, Informationsteknik-20250901
X-WR-CALDESC:Date limit 2025-08-25 - 2030-09-15
X-PUBLISHED-TTL:PT20M
CALSCALE:GREGORIAN
PRODID:-//TimeEdit\\\, //TimeEdit//EN
BEGIN:VEVENT
DTSTART:20250908T080000Z
DTEND:20250908T094500Z
UID:11149-569704435-0@timeedit.com
DTSTAMP:20250910T095653Z
LAST-MODIFIED:20250910T095653Z
SUMMARY:Kurs kod: TDA417_50_HT25_52131. Kurs namn: Datastr
 ukturer och algoritmer\, Activity: Laboration\, Activit
 y: Handledning\, Klass kod: TKITE-2. Klass namn: Inform
 ationsteknik\, Klass kod: TKIEK-3. Klass namn: Industri
 ell ekonomi
LOCATION:Lokalnamn: KD1. Antal datorer: 24. Campus: Johannebe
 rg \nLokalnamn: KD2. Antal datorer: 24. Campus: Johanneber
 g \nLokalnamn: Kemi-L1. Campus: Johanneberg \nLokalnamn: K
 emi-L2. Campus: Johanneberg \nLokalnamn: Kemi-L41. Campus:
  Johanneberg
DESCRIPTION:ID 11149
END:VEVENT
BEGIN:VEVENT
DTSTART:20250908T111500Z
DTEND:20250908T130000Z
UID:11165-569704435-0@timeedit.com
DTSTAMP:20250910T095653Z
LAST-MODIFIED:20250910T095653Z
URL:https://maps.chalmers.se/#b38b807d-e8be-40f6-8916-a423f7d6af78
SUMMARY:Kurs kod: TDA417_50_HT25_52131. Kurs namn: D
 atastrukturer och algoritmer\, Activity: Föreläsn
 ing\, Klass kod: TKITE-2. Klass namn: Information
 steknik\, Klass kod: TKIEK-3. Klass namn: Industr
 iell ekonomi
LOCATION:Lokalnamn: SB-H8. Kartlänk: https://maps.chalmers.s
 e/#b38b807d-e8be-40f6-8916-a423f7d6af78. Campus: Johanneb
 erg
DESCRIPTION:ID 11165
END:VEVENT
BEGIN:VEVENT
DTSTART:20250909T093000Z
DTEND:20250909T113000Z
UID:60308-569704435-0@timeedit.com
DTSTAMP:20250910T095653Z
LAST-MODIFIED:20250910T095653Z
SUMMARY:Titel: Drop-in\, Välkommen på drop in utanför Hubben /Elke &
  Rebecca\, Klass kod: TKITE-3. Klass namn: Informationsteknik\, K
 lass kod: TKITE-2. Klass namn: Informationsteknik\, Klass kod: TK
 ITE-1. Klass namn: Informationsteknik\, Klass kod: MPDSC-1. Klass
  namn: Data Science och AI\, Klass kod: MPDSC-2. Klass namn: Data
  Science och AI
LOCATION:
DESCRIPTION:ID 60308
END:VEVENT
BEGIN:VEVENT
DTSTART:20250910T060000Z
DTEND:20250910T074500Z
UID:2217-569704435-0@timeedit.com
DTSTAMP:20250910T095653Z
LAST-MODIFIED:20250910T095653Z
SUMMARY:Kurs kod: MSG810GU. Kurs namn: Matematisk statistik och d
 iskret matematik\, Kurs kod: MVE051_50_HT25_52114. Kurs namn: 
 Matematisk statistik och diskret matematik\, Kurs kod: MVE055_
 50_HT25_49115. Kurs namn: Matematisk statistik och diskret mat
 ematik\, Activity: Föreläsning\, Klass kod: TKDAT-2. Klass nam
 n: Datateknik\, civilingenjör\, Klass kod: TKITE-2. Klass namn
 : Informationsteknik
LOCATION:Lokalnamn: HA1. Campus: Johanneberg
DESCRIPTION:ID 2217
END:VEVENT
END:VCALENDAR`
