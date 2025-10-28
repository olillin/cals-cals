import { Picker } from '@/app/lib/types'
import pickerConfig from '@/data/picker.json'
import { NextResponse } from 'next/server'

console.log(
    'Loaded calendars:\n',
    (pickerConfig as Picker).calendars.map(c => `\t${c.filename}`).join('\n')
)

export function GET() {
    const filteredPicker: Picker = {
        calendars: pickerConfig.calendars.filter(c => c.id !== -1),
    }
    return NextResponse.json(filteredPicker)
}
