'use server'

import { getSafeFilename } from '@/app/lib/util'
import { promises as fs } from 'fs'
import { NextRequest, NextResponse } from 'next/server'
import path from 'path'

// eslint-disable-next-line jsdoc/require-jsdoc
export async function GET(
    _request: NextRequest,
    { params }: { params: Promise<{ calendarName: string }> }
): Promise<NextResponse> {
    const { calendarName } = await params

    const safeFilename = getSafeFilename(calendarName)

    try {
        const fileContents = await getCalendarFile(safeFilename)

        return new NextResponse(fileContents, {
            headers: {
                'Content-Type': 'text/calendar; charset=utf-8',
                'Content-Disposition': `inline; filename="${safeFilename}"`,
                'Cache-Control': 'no-store, max-age=0',
            },
        })
    } catch {
        return NextResponse.json(
            { error: { message: 'Not found' } },
            { status: 404 }
        )
    }
}

/**
 * Read a calendar file from `/data/calendars`.
 * @param filename The name of the calendar, does not need the file extension.
 * @returns The content of the file.
 */
export async function getCalendarFile(filename: string): Promise<string> {
    const safeFilename = getSafeFilename(filename)
    const filePath = path.join(
        process.cwd(),
        'data',
        'calendars',
        `${safeFilename}`
    )
    return fs.readFile(filePath, 'utf8')
}
