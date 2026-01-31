import { Picker, readPicker } from '@/app/lib/picker'
import { NextResponse } from 'next/server'

// eslint-disable-next-line jsdoc/require-jsdoc
export function GET(): NextResponse {
    const pickerConfig: Picker | undefined = readPicker()
    if (pickerConfig === undefined) {
        return NextResponse.json(
            {
                error: {
                    message: 'Picker is not configured',
                },
            },
            { status: 404 }
        )
    }

    const filteredPicker = {
        calendars: pickerConfig.calendars.filter(c => c.id !== -1),
    }
    return NextResponse.json(filteredPicker)
}
