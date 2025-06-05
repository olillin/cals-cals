import express, { Response } from 'express'
import fs from 'fs'
import http from 'http'
import https from 'https'
import { Calendar } from 'iamcal'
import { parseCalendar } from 'iamcal/parse'
import path from 'path'
import { mergeCalendars } from './Calendar'

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

const ENVIRONMENT: Concrete<EnvironmentVariables> = Object.assign(
    Object.assign({}, DEFAULT_ENVIRONMENT),
    process.env as EnvironmentVariables
)
const { PORT } = ENVIRONMENT

// Paths
const REDIRECTS_PATH = '../data/redirects.json'
const PICKER_PATH = '../data/picker.json'
const PUBLIC_DIRECTORY = 'public'
const CALENDAR_DIRECTORY = '../data/calendars'
// const INDEX_PATH = '../data/calendars/index'

// Setup express app
const app = express()

// Redirects
interface Redirects {
    [x: string]: string
}
const redirects: Redirects = JSON.parse(
    fs.readFileSync(REDIRECTS_PATH).toString()
).redirects
app.use((req, res, next) => {
    if (req.url in redirects) {
        const newUrl = redirects[req.url]
        res.redirect(301, newUrl)
    }
    next()
})

// Picker
app.get('/picker.json', (req, res) => {
    res.sendFile(path.resolve(PICKER_PATH))
})

function noStoreCals(res: Response, path: string) {
    if (path.endsWith('.ics')) {
        res.set('Cache-Control', 'no-store, max-age=0')
    }
}

if (fs.existsSync(PUBLIC_DIRECTORY)) {
    app.use('/', express.static(PUBLIC_DIRECTORY))
} else {
    console.warn('WARNING: No public directory')
}

if (fs.existsSync(CALENDAR_DIRECTORY)) {
    app.use(
        '/c',
        express.static(CALENDAR_DIRECTORY, {
            // Don't cache
            setHeaders: noStoreCals,
        })
    )
    app.get('/c/name/:calendar', async (req, res) => {
        const calendarName = req.params.calendar
        if (!/^[\w_-]+\.[\w_-]+$/.test(calendarName)) {
            res.status(400).json({
                error: {
                    message: 'Illegal calendar specified',
                },
            })
            return
        }
        const text = fs
            .readFileSync(CALENDAR_DIRECTORY + '/' + calendarName)
            .toString()
        const calendar: Calendar = await parseCalendar(text)
        res.status(200).json({
            name: calendar.getProperty('X-WR-CALNAME')!.value,
        })
    })
}

// Merge calendars
interface PickerCalendar {
    filename: string
    id: number
    order?: number
    category?: string
    hidden?: boolean
}

interface Picker {
    calendars: PickerCalendar[]
}

const pickerText = fs.readFileSync(path.resolve(PICKER_PATH)).toString()
const pickerConfig: Picker = JSON.parse(pickerText)

console.log(
    'Available calendars:',
    pickerConfig.calendars.map(c => c.filename)
)

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

    const calendarNames: string[] = pickerConfig.calendars
        .filter(c => {
            return (
                selectedBits.length > c.id && //
                selectedBits.charAt(selectedBits.length - 1 - c.id) === '1'
            )
        })
        .map(c => c.filename)
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
                new Promise<Calendar>((resolve, reject) =>
                    fs.readFile(
                        CALENDAR_DIRECTORY + '/' + name,
                        (err, data) => {
                            if (err) {
                                reject(err)
                            } else {
                                parseCalendar(data.toString()).then(resolve)
                            }
                        }
                    )
                )
        )
    )

    const mergedCalendar = (
        await mergeCalendars(calendars, appendOriginName)
    ).serialize()
    res.status(200).end(mergedCalendar)
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
