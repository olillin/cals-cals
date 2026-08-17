'use server'

import { NoPickerError, readCalendarFile } from '@/app/lib/datafiles'
import { withSuffix } from '@/app/lib/util'
import { NextRequest, NextResponse } from 'next/server'

// eslint-disable-next-line jsdoc/require-jsdoc
export async function GET(
    _request: NextRequest,
    { params }: { params: Promise<{ calendarName: string }> }
): Promise<NextResponse> {
    const { calendarName } = await params

    const filename = withSuffix(calendarName, '.ics')
    try {
        const fileContents = await readCalendarFile(filename)
        if (fileContents == null) {
            throw new Error('No file')
        }

        return new NextResponse(fileContents, {
            headers: {
                'Content-Type': 'text/calendar; charset=utf-8',
                'Content-Disposition': `inline; filename="${filename}"`,
                'Cache-Control': 'no-store, max-age=0',
            },
        })
    } catch (error) {
        if (error instanceof NoPickerError) {
            return NextResponse.json(
                {
                    error: {
                        message:
                            'Service unavailable, picker is not configured',
                    },
                },
                { status: 503 }
            )
        }

        return NextResponse.json(
            { error: { message: 'Not found' } },
            { status: 404 }
        )
    }
}
