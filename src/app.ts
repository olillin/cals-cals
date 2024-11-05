import express, { Response } from 'express'
import fs, { readFile } from 'fs'
import https from 'https'
import http from 'http'
import VklassAdapter from './adapters/VklassAdapter'
import * as ical2json from 'ical2json'
import { IcalObject } from 'ical2json'
import { mergeCalendarsIcal } from './Calendar'

// Environment variables
interface EnvironmentVariables {
    PORT?: Number
}

// Remove 'optional' attributes from a type's properties
type Concrete<Type> = {
    [Property in keyof Type]-?: Type[Property]
}

const DEFAULT_ENVIRONMENT: Concrete<EnvironmentVariables> = {
    PORT: 8080,
}

const ENVIRONMENT: Concrete<EnvironmentVariables> = Object.assign(Object.assign({}, DEFAULT_ENVIRONMENT), process.env as EnvironmentVariables)
const { PORT } = ENVIRONMENT

// Setup express app
const app = express()

// Redirects
const REDIRECTS_PATH = '../data/redirects.json'
interface Redirects {
    [x: string]: string
}
const redirects: Redirects = JSON.parse(fs.readFileSync(REDIRECTS_PATH).toString()).redirects
app.use((req, res, next) => {
    if (req.url in redirects) {
        const newUrl = redirects[req.url]
        res.redirect(301, newUrl)
    }
    next()
})

app.use('/vklass', new VklassAdapter().createRouter())

function noStoreCals(res: Response, path: string) {
    if (path.endsWith('.ics')) {
        res.set('Cache-Control', 'no-store, max-age=0')
    }
}

const PUBLIC_DIRECTORY = 'public'
if (fs.existsSync(PUBLIC_DIRECTORY)) {
    app.use('/', express.static(PUBLIC_DIRECTORY))
} else {
    console.warn('WARNING: No public directory')
}

const CALENDAR_DIRECTORY = '../data/calendars'
if (fs.existsSync(CALENDAR_DIRECTORY)) {
    app.use(
        '/c',
        express.static(CALENDAR_DIRECTORY, {
            // Don't cache
            setHeaders: noStoreCals,
        })
    )
}

// Merge calendars
const INDEX_PATH = '../data/calendars/index'
const calendarIndex = fs
    .readFileSync(INDEX_PATH)
    .toString()
    .split('\n')
    .map(line => line.trim())
    .filter(line => line.length > 0)
console.log("Available calendars:", calendarIndex)

function dec2bin(dec: number) {
    return (dec >>> 0).toString(2)
}

app.get('/m/:calendars', async (req, res) => {
    const appendOriginName = !!(req.query['origin'] ?? false)

    const selectedCalendars = parseInt(req.params.calendars)
    if (isNaN(selectedCalendars)) {
        res.status(400).json({
            error: {
                message: 'Invalid calendars',
            },
        })
        return
    }
    const selectedBits = dec2bin(selectedCalendars)

    const calendarNames: string[] = calendarIndex.filter((_, i) => {
        return (selectedBits.length > i) && (selectedBits.charAt(selectedBits.length - 1 - i) === '1')
    })
    if (calendarNames.length == 0) {
        res.status(400).json({
            error: {
                message: 'No calendars selected',
            },
        })
        return
    }

    const calendars = await Promise.all(
        calendarNames.map(
            name =>
                new Promise<IcalObject>((resolve, reject) =>
                    fs.readFile(CALENDAR_DIRECTORY + "/" + name, (err, data) => {
                        if (err) {
                            reject(err)
                        } else {
                            const ical = ical2json.convert(data.toString())
                            resolve(ical)
                        }
                    })
                )
        )
    )

    const ical = ical2json.revert(mergeCalendarsIcal(calendars, appendOriginName))
    res.status(200).end(ical)
})

// Start server
var server
var useHttps = fs.existsSync('./key.pem') && fs.existsSync('./cert.pem')
if (useHttps) {
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

server.listen(PORT, () => {
    console.log(`App listening on port ${PORT}`)
})
