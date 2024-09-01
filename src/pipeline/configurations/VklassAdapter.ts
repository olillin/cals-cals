import { Calendar, Event } from '../../Calendar'
import { Router } from 'express'
import * as ical2json from 'ical2json'
import { IcalObject } from 'ical2json'
import { capitalize } from '../../Util'

class VklassAdapter {
    baseUrl: string

    constructor(baseUrl: string = 'http://cal.vklass.se/') {
        this.baseUrl = baseUrl
    }

    createRouter = (): Router => {
        let router = Router()
        router.get('/:loc', (req, res) => {
            console.log(`Received request, loc: ${req.params.loc}, query: ${JSON.stringify(req.query)}`)
            this.getCalendar(req.params.loc)
                .then(async calendar => {
                    if (req.query.diff) {
                        console.log('Subtracting calendars')
                        const diffLoc = req.query.diff.toString()
                        const diffCalendar = await this.getCalendar(diffLoc)
                        const compare = (req.query.compare?.toString() ?? 'summary,description,location,dtstart,dtend').toUpperCase().split(',')
                        calendar = this.subtractCalendar(calendar, diffCalendar, compare)
                    }
                    let includeLocation = req.query.location?.toString() == '1'
                    if (includeLocation) {
                        console.log('Location will be included in event summaries')
                    }
                    let newCalendar = this.modifyCalendar(calendar, includeLocation)
                    let newIcal = { VCALENDAR: [newCalendar] } as unknown as IcalObject
                    let text = ical2json.revert(newIcal)
                    res.set({
                        'content-type': 'text/calendar charset=utf-8',
                        'content-disposition': `attachment filename="${req.params.loc}.ics"`,
                    }).end(text)
                    console.log('Calendar sent successfully')
                })
                .catch(status => {
                    console.error('Failed to deliver calendar')
                    if (typeof status === 'number') {
                        res.status(status)
                    } else {
                        console.error(status)
                        res.status(500)
                    }
                    res.end(`Failed to fetch calendar.`)
                    return
                })
        })

        return router
    }

    // Calendar functions
    /**
     * @param {string} loc
     * @returns {Promise<Calendar>}
     */
    getCalendar = (loc: String): Promise<Calendar> => {
        return new Promise((resolve, reject) => {
            const URL = this.baseUrl + loc + '.ics'
            try {
                fetch(URL).then(response => {
                    if (response.status != 200) {
                        reject(response.status)
                    }
                    response.text().then(text => {
                        resolve(ical2json.convert(text).VCALENDAR[0] as unknown as Calendar)
                    })
                })
            } catch (ConnectTimeoutError) {
                console.warn('Timed out when getting calendar')
                reject(504)
            }
        })
    }

    /**
     * @param {Calendar} calendar
     * @param {boolean} includeLocation
     * @returns {Calendar}
     */
    modifyCalendar = (calendar: Calendar, includeLocation: boolean = false) => {
        // Loop through calendar events
        const events: Array<Event> = calendar.VEVENT
        const options = {
            includeLocation: includeLocation,
        }
        for (const [i, event] of events.entries()) {
            let newEvent = this.modifyEvent(event, options)
            calendar.VEVENT[i] = newEvent
        }
        return calendar
    }

    /**
     * Subtract the events of one calendar from the other. Any events that match will be removed
     * @param {Calendar} calendar
     * @param {Calendar} subtractCalendar
     * @param {Array<PropertyKey>} compare List of properties to compare
     * @returns {Calendar} The original calendar with the events removed
     */
    subtractCalendar = (calendar: Calendar, subtractCalendar: Calendar, compare: Array<PropertyKey>): Calendar => {
        const calendarEvents = calendar.VEVENT
        const subtractCalendarEvents = subtractCalendar.VEVENT

        function filterEvent(event: Event) {
            var filteredEvent = {}
            for (let k of compare) {
                if (event.hasOwnProperty(k)) {
                    //@ts-ignore
                    filteredEvent[k] = event[k]
                }
            }
            return filteredEvent as Event
        }

        const resultEvents = Array.from(calendarEvents)
        for (let event of calendarEvents) {
            const cEvent = JSON.stringify(filterEvent(event))
            for (let subtractEvent of subtractCalendarEvents) {
                const cSubtractEvent = JSON.stringify(filterEvent(subtractEvent))
                if (cEvent == cSubtractEvent) {
                    resultEvents.splice(resultEvents.indexOf(event), 1)
                    break
                }
            }
        }
        calendar.VEVENT = resultEvents
        return calendar
    }

    modifyEvent = (event: Event, options: EventModificationOptions): Event => {
        let newEvent = Object.assign({}, event)
        // Generate new summary
        let summary = VklassAdapter.shortenSummary(newEvent.SUMMARY ?? '')
        // Include optional location
        if (options.includeLocation && newEvent.LOCATION) {
            let location = VklassAdapter.formatLocation(newEvent.LOCATION ?? '')
            summary += ' in ' + location
        }
        // Replace old event
        newEvent.SUMMARY = summary
        return newEvent
    }

    /**
     * @param {string} summary
     * @returns {string}
     */
    static shortenSummary = function (summary: String) {
        const match = summary.match(/^[\wåäöÅÄÖ -]+[\wåäöÅÄÖ]/ms) as RegExpMatchArray
        return capitalize(match[0])
    }

    static formatLocation = function (location: String) {
        let locations = location.split('\\,')
        if (locations.length == 1) {
            return 'room ' + locations[0]
        } else {
            return 'rooms ' + locations.slice(0, -1).join('\\, ') + ' and ' + locations.slice(-1)
        }
    }
}
export default VklassAdapter

interface EventModificationOptions {
    includeLocation: boolean | undefined
}
