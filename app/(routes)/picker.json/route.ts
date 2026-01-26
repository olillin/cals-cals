import { Picker, readPicker } from '@/app/lib/picker'
import { NextResponse } from 'next/server'

const pickerConfig: Picker = readPicker()

console.log(
    'Loaded calendars:\n',
    pickerConfig.calendars.map(c => `\t${c.filename}`).join('\n')
)

export function GET() {
    const filteredPicker = {
        calendars: pickerConfig.calendars.filter(c => c.id !== -1),
    }
    return NextResponse.json(filteredPicker)
}
