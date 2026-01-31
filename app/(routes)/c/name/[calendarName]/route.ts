'use server'

import { getCalendarFile } from '@/app/(routes)/c/[calendarName]/route'
import { CalendarNameResponse } from '@/app/lib/responses'
import { parseCalendar } from 'iamcal'
import { NextRequest, NextResponse } from 'next/server'

// eslint-disable-next-line jsdoc/require-jsdoc
export async function GET(
    _request: NextRequest,
    { params }: { params: Promise<{ calendarName: string }> }
): Promise<NextResponse> {
    const { calendarName } = await params

    let fileContents: string
    try {
        fileContents = await getCalendarFile(calendarName)
    } catch {
        return NextResponse.json(
            {
                error: { message: 'Not found' },
            },
            { status: 404 }
        )
    }

    let parsedCalendarName: string | undefined
    try {
        const calendar = parseCalendar(fileContents)
        parsedCalendarName = calendar.getCalendarName()
    } catch {
        return NextResponse.json(
            {
                error: {
                    message: 'Failed to parse calendar name',
                },
            },
            { status: 500 }
        )
    }

    if (!parsedCalendarName) {
        return NextResponse.json(
            {
                error: {
                    message: 'Calendar has no name',
                },
            },
            { status: 500 }
        )
    }

    const response: CalendarNameResponse = {
        name: parsedCalendarName,
    }

    return NextResponse.json(response, {
        headers: {
            'Cache-Control': 'no-store, max-age=0',
        },
    })
}
