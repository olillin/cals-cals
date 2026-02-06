import { dataFileExists, readDataFileJson } from './datafiles'

/** A calendar in the calendar picker. */
export interface PickerCalendar {
    /** The filename of the calendar in `data/calendars/`. */
    filename: string
    /** Which bit in a merged calendar bitmask that the calendar corresponds to, from least significant. An id of -1 means that the calendar is always hidden and cannot be merged. */
    id: number
    /** The position in the picker relative to other calendars, lower numbers are shown first. */
    order?: number
    /** The category of the calendar. Subcategories are delimited by `/`. */
    category?: string
    /** If true, the calendar will not be shown in the picker, but is still served in /c and can be merged. */
    hidden?: boolean
}

/** A calendar picker configuration. */
export interface Picker {
    /** The calendars in the picker. */
    calendars: PickerCalendar[]
}

/**
 * Read and validate the picker configuration from file.
 * @returns The picker configuration, or undefined if it is invalid or does not exist.
 */
export function readPicker(): Picker | undefined {
    const pickerFile = 'picker.json'

    // Safe read with default
    if (!dataFileExists(pickerFile)) {
        console.warn(`${pickerFile} does not exist`)
        return undefined
    }

    try {
        return readDataFileJson(pickerFile, 'picker.schema.json') as Picker
    } catch (e) {
        console.warn(`Failed to load ${pickerFile}`)
        console.warn(e)
        return undefined
    }
}
