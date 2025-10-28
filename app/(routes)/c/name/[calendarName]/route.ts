import { NextResponse } from 'next/server'
import {
    getCalendarFile,
    getSafeFilename,
} from '@/app/(routes)/c/[calendarName]/route'
import { parseCalendar } from 'iamcal'

export async function GET(
    request: Request,
    { params }: { params: Promise<{ calendarName: string }> }
) {
    const { calendarName } = await params

    const safeFilename = getSafeFilename(calendarName)

    let fileContents: string
    try {
        fileContents = await getCalendarFile(safeFilename)
    } catch (err) {
        return NextResponse.json(
            {
                error: { message: 'Not found' },
            },
            { status: 404 }
        )
    }

    let parsedCalendarName: string | undefined
    try {
        const calendar = await parseCalendar(fileContents)
        parsedCalendarName = calendar.getCalendarName()
    } catch (err) {
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

    return NextResponse.json(
        {
            name: parsedCalendarName,
        },
        {
            headers: {
                'Cache-Control': 'no-store, max-age=0',
            },
        }
    )
}
