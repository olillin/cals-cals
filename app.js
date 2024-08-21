const express = require('express')
const fs = require('fs')
const https = require('https')
const http = require('http')
const ical2json = require('ical2json')
const { CAL_URL_BASE, PORT } = process.env
if (!CAL_URL_BASE) {
    console.log('No base calendar URL has been provided.')
    process.exit()
}

const app = express()
const port = PORT || 443

app.get('/', (req, res) => {
    res.end('<p>WebCal Adapter is running</p>')
})

app.get('/calendar/:loc', (req, res) => {
    console.log(`Received request, loc: ${req.params.loc}, query: ${JSON.stringify(req.query)}`)
    getCalendar(req.params.loc)
        .then(async calendar => {
            if (req.query.diff) {
                console.log('Subtracting calendars')
                const diffLoc = req.query.diff.toString()
                const diffCalendar = await getCalendar(diffLoc)
                const compare = (req.query.compare ?? 'summary,description,location,dtstart,dtend').toUpperCase().split(',')
                calendar = subtractCalendar(calendar, diffCalendar, compare)
            }
            let includeLocation = { true: 0, yes: 0, 1: 0 }.hasOwnProperty(req.query.location?.toLowerCase())
            if (includeLocation) {
                console.log('Location will be included in event summaries')
            }
            let newCalendar = modifyCalendar(calendar, includeLocation)
            let text = ical2json.revert(newCalendar)
            res.set({
                'content-type': 'text/calendar charset=utf-8',
                'content-disposition': `attachment filename="${req.params.loc}.ics"`,
            }).end(text)
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

// Start server
var server
if (fs.existsSync('./key.pem') && fs.existsSync('./cert.pem')) {
    server = https.createServer(
        {
            key: fs.readFileSync('./key.pem'),
            cert: fs.readFileSync('./cert.pem'),
        },
        app
    )
} else {
    server = http.createServer({}, app)
}

server.listen(port, () => {
    console.log(`App listening on port ${port}`)
})

// Calendar functions
/**
 * @param {string} loc
 * @returns {Promise<object>}
 */
function getCalendar(loc) {
    return new Promise((resolve, reject) => {
        const URL = CAL_URL_BASE + loc + '.ics'
        try {
            fetch(URL).then(response => {
                if (response.status != 200) {
                    reject(response.status)
                }
                response.text().then(text => {
                    resolve(ical2json.convert(text))
                })
            })
        } catch (ConnectTimeoutError) {
            console.warn('Timed out when getting calendar')
            reject(504)
        }
    })
}

/**
 * @param {object} calendar
 * @param {boolean} includeLocation
 * @returns {object}
 */
function modifyCalendar(calendar, includeLocation = false) {
    // Loop through calendar events
    const events = calendar.VCALENDAR[0]?.VEVENT
    for (const [i, event] of Array.from(events ?? []).entries()) {
        // Generate new summary
        let summary = shortenSummary(event.SUMMARY ?? '')
        // Include optional location
        if (includeLocation && event.LOCATION) {
            let location = formatLocation(event.LOCATION)
            summary += ' in ' + location
        }
        // Replace old event
        event.SUMMARY = summary
        calendar.VCALENDAR[0].VEVENT[i] = event
    }
    return calendar
}

/**
 * Subtract the events of one calendar from the other. Any events that match will be removed
 * @param {object} calendar
 * @param {object} subtractCalendar
 * @param {Array} compare List of properties to compare
 * @returns {object} The original calendar
 */
function subtractCalendar(calendar, subtractCalendar, compare) {
    const calendarEvents = calendar.VCALENDAR[0].VEVENT
    const subtractCalendarEvents = subtractCalendar.VCALENDAR[0].VEVENT

    function filterEvent(event) {
        const filteredEvent = {}
        for (let k of compare) {
            if (event.hasOwnProperty(k)) {
                filteredEvent[k] = event[k]
            }
        }
        return filteredEvent
    }

    const resultEvents = Array.from(calendarEvents)
    for (let event of calendarEvents) {
        const cEvent = JSON.stringify(filterEvent(event))
        for (let subtractEvent of subtractCalendarEvents) {
            const cSubtractEvent = JSON.stringify(filterEvent(subtractEvent))
            if (cEvent == cSubtractEvent) {
                resultEvents.splice(resultEvents.indexOf(event), 1)
                break
            } else {
                if (event.SUMMARY == 'Samhällskunskap 1b (TE21B/231SAMSAM01b)\nSAM_11 \nMAHO') {
                    console.log('nomatch ' + cEvent + cSubtractEvent)
                    console.log(event)
                    console.log(subtractEvent)
                }
            }
        }
    }
    calendar.VCALENDAR[0].VEVENT = resultEvents
    return calendar
}

/**
 * @param {string} summary
 * @returns {string}
 */
function shortenSummary(summary) {
    return capitalize(summary.match(/^[\wåäöÅÄÖ -]+[\wåäöÅÄÖ]/ms)[0])
}

/**
 * @param {string} s
 * @returns {string}
 */
function capitalize(s) {
    return s.substring(0, 1).toUpperCase() + s.substring(1).toLowerCase()
}

function formatLocation(location) {
    let locations = location.split('\\,')
    if (locations.length == 1) {
        return 'room ' + locations[0]
    } else {
        return 'rooms ' + locations.slice(0, -1).join('\\, ') + ' and ' + locations.slice(-1)
    }
}
