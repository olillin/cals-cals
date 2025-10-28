'use server'

import { getSafeFilename } from '@/app/lib/Util'
import { promises as fs } from 'fs'
import { NextRequest, NextResponse } from 'next/server'
import path from 'path'

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ calendarName: string }> }
) {
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
    } catch (err) {
        return NextResponse.json(
            { error: { message: 'Not found' } },
            { status: 404 }
        )
    }
}

export async function getCalendarFile(safeFilename: string): Promise<string> {
    const filePath = path.join(
        process.cwd(),
        'data',
        'calendars',
        `${safeFilename}`
    )

    const fileContents = await fs.readFile(filePath, 'utf8')

    return fileContents
}
