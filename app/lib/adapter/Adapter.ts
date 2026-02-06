import { Calendar, parseCalendar } from 'iamcal'

import { NextRequest, NextResponse } from 'next/server'
import { ErrorResponse, UrlResponse } from '../responses'

export type RouteHandler = (
    request: NextRequest
) => NextResponse | Promise<NextResponse>

abstract class Adapter {
    /**
     * Create a route which takes a query parameter 'id' and returns the
     * converted calendar from the service of this adapter.
     * @param timeoutMilliseconds How long to wait before fetching the original calendar times out.
     * @returns The route handler.
     */
    createCalendarRoute(timeoutMilliseconds?: number): RouteHandler {
        return async (request: NextRequest): Promise<NextResponse> => {
            const id = request.nextUrl.searchParams.get('id')
            if (!id) {
                return NextResponse.json(
                    {
                        error: {
                            message: "Missing required query parameter 'id'",
                        },
                    },
                    {
                        status: 400,
                    }
                )
            }

            const url = this.createUrl(String(id))
            const originalCalendar: Calendar | NextResponse =
                await this.fetchCalendar(url, timeoutMilliseconds).catch(
                    error => {
                        const errorResponse = error as ErrorResponse
                        return NextResponse.json(
                            {
                                error: { message: errorResponse.message },
                            },
                            {
                                status: errorResponse.status,
                            }
                        )
                    }
                )
            if (originalCalendar instanceof NextResponse) {
                return originalCalendar
            }

            let convertedCalendar: Calendar
            try {
                convertedCalendar = this.convertCalendar(
                    originalCalendar,
                    request
                )
            } catch (error) {
                return NextResponse.json(
                    {
                        error: {
                            message: `Failed to convert calendar: ${error instanceof Error ? error.message : String(error)}`,
                        },
                    },
                    {
                        status: 500,
                    }
                )
            }

            const serializedConvertedCalendar = convertedCalendar.serialize()

            return new NextResponse(serializedConvertedCalendar, {
                headers: {
                    'Content-Type': 'text/calendar',
                },
            })
        }
    }

    /**
     * Fetch and parse a calendar from a URL.
     * @param url The URL to fetch from.
     * @param timeoutMilliseconds How many milliseconds to wait before timeout.
     * @returns The parsed calendar.
     * @throws {ErrorResponse} If the fetch times out.
     * @throws {ErrorResponse} If the fetch returns an error.
     * @throws {ErrorResponse} If the calendar cannot be parsed.
     */
    async fetchCalendar(
        url: URL,
        timeoutMilliseconds: number = 5000
    ): Promise<Calendar> {
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
            calendar = parseCalendar(calendarText)
        } catch (error) {
            throw new ErrorResponse(
                500,
                `Failed to parse calendar: ${error instanceof Error ? error.message : String(error)}`
            )
        }

        return calendar
    }

    /**
     * Create a route which takes a query parameter 'url' and returns the
     * URL which will route the calendar through this adapter.
     * @returns The route handler.
     */
    createUrlRoute(): RouteHandler {
        return async (request: NextRequest): Promise<NextResponse> => {
            const originalUrl = request.nextUrl.searchParams.get('url')
            if (!originalUrl) {
                return NextResponse.json(
                    {
                        error: {
                            message: "Missing required query parameter 'url'",
                        },
                    },
                    { status: 400 }
                )
            }
            let id: string | undefined = undefined
            try {
                id = this.getId(new URL(String(originalUrl)))
            } catch (error) {
                return NextResponse.json(
                    {
                        error: {
                            message: `Failed to extract id from URL: ${error instanceof Error ? error.message : String(error)}`,
                        },
                    },
                    {
                        status: 400,
                    }
                )
            }

            let extra: object | undefined = undefined
            try {
                extra = await this.getExtras(new URL(String(originalUrl)))
            } catch (error) {
                const message = `Failed to get extra information about URL: ${error instanceof Error ? error.message : String(error)}`
                console.error(message)
                console.error(error)
                return NextResponse.json(
                    {
                        error: {
                            message: message,
                        },
                    },
                    {
                        status: 500,
                    }
                )
            }

            console.log(`Host: ${request.headers.get('host')} ${request.url}`)
            const adapterUrl = new URL(
                request.url
                    .replace(/\/[^/]*$/, '')
                    .replace(/https?:\/\//, 'webcal://')
            )
            // Add id query parameter
            adapterUrl.search = '?id=' + encodeURIComponent(id)

            const response: UrlResponse = {
                id: id,
                url: adapterUrl.toString(),
                ...(extra ? { extra: extra } : {}),
            }
            return NextResponse.json(response)
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
     * @param req The context of the request to get this calendar.
     * @returns The converted calendar.
     */
    abstract convertCalendar(calendar: Calendar, req?: NextRequest): Calendar

    /**
     * Provide extra information about the URL for this adapter.
     * @param url The URL to the calendar.
     * @returns The extra information as a JSON-serializable object, or undefined if no extra information is available.
     */
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    getExtras(url: URL): object | undefined | Promise<object | undefined> {
        return undefined
    }
}

export default Adapter
