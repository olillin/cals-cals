import { mergeCalendars } from '@/app/lib/Calendar'
import { Calendar, load, parseCalendar } from 'iamcal'
import { NextRequest, NextResponse } from 'next/server'
import pickerConfig from '@/data/picker.json'
import { getCalendarFile } from '@/app/(routes)/c/[calendarName]/route'

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ bitmask: string }> }
) {
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
        calendarNames.map(
            name =>
                new Promise<Calendar>((resolve, reject) => {
                    try {
                        return getCalendarFile(name)
                            .then(content => parseCalendar(content))
                            .then(resolve)
                            .catch(reject)
                    } catch (reason) {
                        reject(reason)
                    }
                })
        )
    )

    const mergedCalendar = (
        await mergeCalendars(calendars, appendOriginName)
    ).serialize()

    return new NextResponse(mergedCalendar, {
        headers: {
            'Content-Type': 'text/calendar; charset=utf-8',
            'Content-Disposition': `inline; filename="merged-calendar.ics"`,
            'Cache-Control': 'no-store, max-age=0',
        },
    })
}

export function dec2bin(dec: number) {
    return (dec >>> 0).toString(2)
}
