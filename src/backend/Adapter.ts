import { RequestHandler } from 'express'
import { Calendar, load, parseCalendar } from 'iamcal'

abstract class Adapter {
    /**
     * Create a route which takes a query parameter 'id' and returns the
     * converted calendar from the service of this adapter.
     */
    createHandler(timeout: number = 5000): RequestHandler {
        return async (req, res) => {
            const id = req.query.id
            if (!id) {
                res.status(400).json({
                    error: { message: "Missing required query parameter 'id'" },
                })
                return
            }
            const url = this.createUrl(String(id))

            // Fetch with timeout
            const timeoutPromise = new Promise<undefined>(resolve =>
                setTimeout(() => {
                    resolve(undefined)
                }, timeout)
            )
            const fetchPromise = fetch(url)
            const response = await Promise.race([timeoutPromise, fetchPromise])
            if (response === undefined) {
                // Fetch timed out
                res.status(504).json({
                    error: { message: `Fetch to ${url} timed out` },
                })
                return
            }

            if (!response.ok) {
                res.status(502).json({
                    error: {
                        message: `Received not ok response from ${url}, status code is ${response.status}`,
                    },
                })
                return
            }

            const contentType = response.headers.get('Content-Type')
            // If missing header, assume it is fine and fail while parsing in worst case
            const isCalendar = contentType?.includes('text/calendar') ?? true
            if (!isCalendar)
                throw `Response has invalid content type. Expected 'text/calendar' but got ${contentType}`

            const calendarText = await response.text()
            let originalCalendar: Calendar | undefined = undefined
            try {
                originalCalendar = await parseCalendar(calendarText)
            } catch (error) {
                res.status(500).json({
                    error: { message: `Failed to parse calendar: ${error}` },
                })
                return
            }

            let convertedCalendar: Calendar
            try {
                convertedCalendar = this.convertCalendar(originalCalendar)
            } catch (error) {
                res.status(500).json({
                    error: { message: `Failed to convert calendar: ${error}` },
                })
                return
            }

            const serializedConvertedCalendar = convertedCalendar.serialize()

            res.setHeader('Content-Type', 'text/calendar').end(
                serializedConvertedCalendar
            )
        }
    }

    /**
     * Create a URL from a calendar identifier for this service.
     * @param id The identifier.
     * @returns The URL to the calendar which id references.
     */
    abstract createUrl(id: string): URL

    /**
     * Extract the id from a calendar for this service.
     * @param url The URL to the calendar.
     * @returns The extracted id which references the calendar.
     */
    abstract getId(url: URL): string

    /**
     * Convert a calendar according to the rules of this adapter.
     * @param calendar The original calendar from the URL.
     * @returns The converted calendar
     */
    abstract convertCalendar(calendar: Calendar): Calendar
}

export default Adapter
