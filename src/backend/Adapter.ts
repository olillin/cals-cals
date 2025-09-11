import { RequestHandler, Router } from 'express'
import { Calendar, load, parseCalendar } from 'iamcal'

class ErrorResponse extends Error {
    status: number
    constructor(status: number, message: string) {
        super(message)
        this.status = status
    }
}

abstract class Adapter {
    /**
     * Create an express router with routes for this adapter:
     *
     * - `GET /`: The route created by {@link createCalendarRoute}.
     * - `POST /`: The route created by {@link createUrlRoute}.
     *
     * @returns An express router with the routes for this adapter.
     */
    createRouter(): Router {
        const router = Router()

        router.get('/', this.createCalendarRoute())
        router.post('/', this.createUrlRoute())

        return router
    }

    /**
     * Create a route which takes a query parameter 'id' and returns the
     * converted calendar from the service of this adapter.
     */
    createCalendarRoute(timeout?: number): RequestHandler {
        return async (req, res) => {
            const id = req.query.id
            if (!id) {
                res.status(400).json({
                    error: { message: "Missing required query parameter 'id'" },
                })
                return
            }

            let originalCalendar: Calendar | undefined =
                await this.fetchCalendarFromId(String(id), timeout).catch(
                    error => {
                        const errorResponse = error as ErrorResponse
                        res.status(errorResponse.status).json({
                            error: { message: errorResponse.message },
                        })
                        return undefined
                    }
                )
            if (!originalCalendar) return

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

    async fetchCalendarFromId(
        id: string,
        timeoutMilliseconds: number = 5000
    ): Promise<Calendar> {
        const url = this.createUrl(String(id))

        // Fetch with timeout
        const timeoutPromise = new Promise<null>(resolve =>
            setTimeout(() => {
                resolve(null)
            }, timeoutMilliseconds)
        )
        const fetchPromise = fetch(url)
        const response = await Promise.race([timeoutPromise, fetchPromise])
        if (response === null) {
            // Fetch timed out
            throw new ErrorResponse(504, `Calendar provider did not respond`)
        }

        if (!response.ok) {
            throw new ErrorResponse(
                502,
                `Calendar provider gave not ok response`
            )
        }

        const contentType = response.headers.get('Content-Type')
        // If missing header, assume it is fine and fail while parsing in worst case
        const isCalendar = contentType?.includes('text/calendar') ?? true
        if (!isCalendar)
            throw new ErrorResponse(
                502,
                `Response has invalid content type. Expected 'text/calendar' but got ${contentType}`
            )

        const calendarText = await response.text()
        let calendar: Calendar | undefined = undefined
        try {
            calendar = await parseCalendar(calendarText)
        } catch (error) {
            throw new ErrorResponse(500, `Failed to parse calendar: ${error}`)
        }

        return calendar
    }

    /**
     * Create a route which takes a query parameter 'url' and returns the
     * URL which will route the calendar through this adapter.
     */
    createUrlRoute(): RequestHandler {
        return (req, res) => {
            const originalUrl = req.query.url
            if (!originalUrl) {
                res.status(400).json({
                    error: {
                        message: "Missing required query parameter 'url'",
                    },
                })
                return
            }
            let id: string | undefined = undefined
            try {
                id = this.getId(new URL(String(originalUrl)))
            } catch (error) {
                res.status(400).json({
                    error: {
                        message: `Failed to extract id from URL: ${error instanceof Error ? error.message : error}`,
                    },
                })
                return
            }

            const adapterUrl = new URL(
                req.protocol + '://' + req.get('host') + req.originalUrl
            )
            // Replace query parameter with id
            adapterUrl.search = '?id=' + encodeURIComponent(id)

            res.status(200).json({
                id: id,
                url: adapterUrl,
            })
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
