import { mergeCalendars } from '@/app/lib/merge'
import { parseCalendar } from 'iamcal'
import { NextRequest, NextResponse } from 'next/server'
import { Picker, readPicker } from '@/app/lib/picker'
import { NoPickerError, readCalendarFile } from '@/app/lib/datafiles'

// eslint-disable-next-line jsdoc/require-jsdoc
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ bitmask: string }> }
): Promise<NextResponse> {
    const pickerConfig: Picker | undefined = await readPicker()
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
    let selectedCalendars: bigint
    try {
        selectedCalendars = BigInt(bitmask)
    } catch {
        return NextResponse.json(
            {
                error: {
                    message: 'Invalid calendars',
                },
            },
            { status: 400 }
        )
    }
    const selectedBits = selectedCalendars.toString(2)

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

    const allCalendars = await Promise.allSettled(
        calendarNames.map(async name => {
            const content = await readCalendarFile(name)
            return content === null ? null : parseCalendar(content)
        })
    )

    const error = allCalendars.find(settled => settled.status === 'rejected')
        ?.reason as unknown
    if (error) {
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
        console.error(
            'An unknown error occured while reading calendar files to merge:',
            error
        )
        return NextResponse.json(
            {
                error: {
                    message:
                        'An unknown error occurred while reading calendar files',
                },
            },
            { status: 500 }
        )
    }

    const calendars = allCalendars
        .map(settled => (settled.status === 'fulfilled' ? settled.value : null))
        .filter(value => value !== null)
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
