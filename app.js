const express = require('express')
const fs = require('fs')
const https = require('https')
const http = require('http')
require('dotenv/config')
const { CAL_URL_BASE, PORT } = process.env
if (!CAL_URL_BASE) {
    console.log('No base calendar URL has been provided.')
    process.exit()
}

const app = express()
const port = PORT || 443

app.get('/', (req, res) => {
    res.end("<p>WebCal Adapter is running</p>")
})

app.get('/calendar/:loc', (req, res) => {
    try {
	const URL = CAL_URL_BASE + req.params.loc + '.ics'
        fetch(URL).then(response => {
            if (response.status != 200) {
                res.status(500)
                    .end(`Failed to fetch calendar, code ${response.status}.`)
                return
            }
            response.text().then(text => {
                let include_location = !!(req.query['location'] ?? false)
                let ics = modify_ics(text, include_location)
                res.set({
                    'content-type': 'text/calendar charset=utf-8',
                    'content-disposition': `attachment filename="${req.params.loc}.ics"`,
                }).end(ics)
            })
        })
    } catch (ConnectTimeoutError) {
        res.status(500)
            .end('Failed to fetch calendar, timed out.')
    }
})

var server
if (fs.existsSync('./key.pem') && fs.existsSync('./cert.pem')) {
    server = https.createServer({
        key: fs.readFileSync('./key.pem'),
        cert: fs.readFileSync('./cert.pem'),
    }, app )
} else {
    server = http.createServer({}, app)
}

server.listen(port, () => {
    console.log(`App listening on port ${port}`)
})

/**
 * @param {string} text
 * @param {boolean} include_location
 * @returns {string}
 */
function modify_ics(text, include_location) {
    // Get calendar events
    let pointer = text.indexOf("BEGIN:VEVENT\r\n")
    while (pointer != -1) {
        pointer += "BEGIN:VEVENT\r\n".length
        let end = text.indexOf("\r\nEND:VEVENT", pointer)
        
        let event = text.substring(pointer, end)
        let length = event.length
        // Get summary
        let summaryMatch = event.match( /(?<=SUMMARY:).*?(?=\r?\n[A-Z]+:)/s)
        if (summaryMatch) {
            // Create new summary
            let summary = shortenSummary(summaryMatch[0])
            // Optional location suffix
            if (include_location) {
                let locationMatch = event.match( /(?<=LOCATION:).*?(?=\r\n[A-Z]+:)/s)
                if (locationMatch && locationMatch[0].match(/\d+(,\d+)*/)) {
                    summary += ' in ' + format_location(locationMatch[0])
                }
            }

            // Insert new summary
            event = event.substring(0, summaryMatch.index) + summary + event.substring(summaryMatch.index + summaryMatch[0].length)
            text = text.substring(0, pointer) + event + text.substring(pointer+length)
        }
        
        // Find next event
        pointer = text.indexOf("BEGIN:VEVENT\r\n", end+event.length-length)
    }
    return text
}

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

function format_location(location) {
    let locations = location.split('\\,')
    if (locations.length == 1) {
        return 'room ' + locations[0]
    } else {
        return 'rooms ' + locations.slice(0, -1).join('\\, ') + ' and ' + locations.slice(-1)
    }
}
