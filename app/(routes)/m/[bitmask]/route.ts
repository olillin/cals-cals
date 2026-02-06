import { mergeCalendars } from '@/app/lib/merge'
import { parseCalendar } from 'iamcal'
import { NextRequest, NextResponse } from 'next/server'
import { Picker, readPicker } from '@/app/lib/picker'
import { getCalendarFile } from '@/app/(routes)/c/[calendarName]/route'

// eslint-disable-next-line jsdoc/require-jsdoc
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ bitmask: string }> }
): Promise<NextResponse> {
    const pickerConfig: Picker | undefined = readPicker()
    if (pickerConfig === undefined) {
        return NextResponse.json(
            {
                error: {
                    message: 'Service unavailable, picker is not configured',
                },
            },
            { status: 503 }
        )
    }

    const appendOriginName = !['false', '0', 'f'].includes(
        String(
            request.nextUrl.searchParams.get('origin') ?? false
        ).toLowerCase()
    )

    const { bitmask } = await params
    const selectedCalendars = parseInt(bitmask)
    if (isNaN(selectedCalendars)) {
        return NextResponse.json(
            {
                error: {
                    message: 'Invalid calendars',
                },
            },
            { status: 400 }
        )
    }
    const selectedBits = dec2bin(selectedCalendars)

    const calendarNames: string[] = pickerConfig.calendars
        .filter(c => {
            return (
                selectedBits.length > c.id && //
                selectedBits.charAt(selectedBits.length - 1 - c.id) === '1'
            )
        })
        .map(c => c.filename)
    if (calendarNames.length == 0) {
        return NextResponse.json(
            {
                error: {
                    message: 'No calendars selected',
                },
            },
            { status: 400 }
        )
    }

    const calendars = await Promise.all(
        calendarNames.map(name =>
            getCalendarFile(name).then(content => parseCalendar(content))
        )
    )

    const mergedCalendar = mergeCalendars(
        calendars,
        appendOriginName
    ).serialize()

    return new NextResponse(mergedCalendar, {
        headers: {
            'Content-Type': 'text/calendar; charset=utf-8',
            'Content-Disposition': `inline; filename="merged-calendar.ics"`,
            'Cache-Control': 'no-store, max-age=0',
        },
    })
}

/**
 * Convert a decimal number to binary.
 * @param dec The decimal number.
 * @returns The binary as a string of 1s and 0s.
 */
export function dec2bin(dec: number): string {
    return (dec >>> 0).toString(2)
}
