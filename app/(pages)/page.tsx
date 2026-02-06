import { RenderedPicker, RenderedPickerCalendar } from '@/app/lib/calendarTree'
import { Picker, readPicker } from '@/app/lib/picker'
import { parseCalendar } from 'iamcal'
import { headers } from 'next/headers'
import { getCalendarFile } from '../(routes)/c/[calendarName]/route'
import CalendarPicker from '../ui/calendar/picker/CalendarPicker'
import { formatKebabCase } from '@/app/lib/util'
import PickerUnavailable from '../ui/calendar/picker/PickerUnavailable'
import { buildTree, RenderedCalendarTree } from '../lib/calendarTree'
import ErrorPage from '../ui/ErrorPage'

export default async function Page() {
    const pickerConfig = readPicker()
    if (pickerConfig === undefined) {
        return <PickerUnavailable />
    }

    const picker = await renderPicker(pickerConfig)

    const hostHeader = (await headers()).get('host')
    const urlBase = 'webcal://' + (hostHeader ?? 'cal.olillin.com')

    // Load picker tree
    let tree: RenderedCalendarTree | null
    try {
        const calendars = picker.calendars
        tree = buildTree(calendars)
    } catch (error) {
        console.error('Failed to build picker tree, see error below.')
        console.log(error)
        tree = null
    }

    return (
        <section className="calendar-picker">
            <h2>Calendar Picker</h2>
            <p>
                Here you can select which calendars you want to include in your
                custom calendar feed. The URL you get at the bottom will
                automatically update as you select and deselect calendars. You
                can then use this URL to subscribe to your custom calendar feed
                in your calendar application of choice.
            </p>

            {tree !== null ? (
                <CalendarPicker initialTree={tree} urlBase={urlBase} />
            ) : (
                <ErrorPage>
                    Failed to load calendar picker, try again later
                </ErrorPage>
            )}
        </section>
    )
}

/**
 * Render a picker by reading the calendar names from the files.
 */
export async function renderPicker(picker: Picker): Promise<RenderedPicker> {
    const calendars: RenderedPickerCalendar[] = await Promise.all(
        picker.calendars.map(async calendar => {
            const displayName = await getCalendarName(calendar.filename)
            return {
                ...calendar,
                displayName: displayName,
                selected: false,
            }
        })
    )

    return {
        calendars: calendars,
    }
}

export async function getCalendarName(filename: string): Promise<string> {
    let fileContents: string
    const fallback: string = formatKebabCase(filename.replace(/\.ics$/, ''))
    try {
        fileContents = await getCalendarFile(filename)
    } catch (err) {
        console.warn(`Failed to read calendar file: ${err}`)
        return fallback
    }

    try {
        const calendar = await parseCalendar(fileContents)
        return calendar.getCalendarName() ?? fallback
    } catch (err) {
        console.warn(`Failed to parse calendar name: ${err}`)
        return fallback
    }
}
