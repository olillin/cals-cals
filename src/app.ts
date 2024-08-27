import express from 'express'
import fs from 'fs'
import https from 'https'
import http from 'http'
import VklassAdapter from './adapters/VklassAdapter'

// Import ENV variables
interface EnvironmentVariables {
    PORT?: Number
}
const { PORT } = process.env as EnvironmentVariables

const app = express()

app.get('/', (req, res) => {
    res.end('<p>WebCal Adapter is running</p>')
})

app.use('/vklass', new VklassAdapter().createRouter())
if (fs.existsSync('public')) {
    app.use('/', express.static('public', {
        setHeaders: function(res, path) {
            if (path.endsWith('.ics')) {
                res.set('Cache-Control', 'no-store, max-age=0')
            }
        }
    }))
} else {
    console.warn('WARNING: Could not find public directory, static files will not be served')
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
const port = PORT || 8080

server.listen(port, () => {
    console.log(`App listening on port ${port}`)
})
