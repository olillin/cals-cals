import express from 'express'
import fs from 'fs'
import https from 'https'
import http from 'http'
import VklassAdapter from './adapters/VklassAdapter'

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

app.use('/vklass', new VklassAdapter().createRouter())

const PUBLIC_DIRECTORY = 'public'
if (fs.existsSync(PUBLIC_DIRECTORY)) {
    app.use(
        '/',
        // Don't cache
        express.static(PUBLIC_DIRECTORY, {
            setHeaders: function (res, path) {
                if (path.endsWith('.ics')) {
                    res.set('Cache-Control', 'no-store, max-age=0')
                }
            },
        })
    )
} else {
    console.warn('WARNING: No public directory')
}

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
