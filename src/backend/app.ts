import express, { Response } from 'express'
import fs from 'fs'
import http from 'http'
import https from 'https'
import { Calendar, load } from 'iamcal'
import path from 'path'
import adapterRouter from './adapterRouter'
import { mergeCalendars } from './Calendar'
import type { Concrete, EnvironmentVariables, Picker, Redirects } from './types'

// Environment
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

// Read picker config
const pickerText = fs.readFileSync(path.resolve(PICKER_PATH)).toString()
const pickerConfig: Picker = JSON.parse(pickerText)

console.log(
    'Loaded calendars:\n',
    pickerConfig.calendars.map(c => `\t${c.filename}`).join('\n')
)

// Setup express app
const app = express()

// Redirects
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
    const filteredPicker: Picker = {
        calendars: pickerConfig.calendars.filter(c => c.id !== -1),
    }
    res.status(200).json(filteredPicker)
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
        const filePath = CALENDAR_DIRECTORY + '/' + calendarName
        const calendar: Calendar = await load(filePath)
        res.status(200).json({
            name: calendar.getProperty('X-WR-CALNAME')!.value,
        })
    })
}

// Merge calendars
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
                new Promise<Calendar>((resolve, reject) => {
                    try {
                        const filePath = CALENDAR_DIRECTORY + '/' + name
                        load(filePath).then(resolve).catch(reject)
                    } catch (reason) {
                        reject(reason)
                    }
                })
        )
    )

    const mergedCalendar = (
        await mergeCalendars(calendars, appendOriginName)
    ).serialize()
    res.status(200).end(mergedCalendar)
})

// Adapters
app.use('/adapter', adapterRouter)

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
