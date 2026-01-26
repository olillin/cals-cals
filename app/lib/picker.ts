import { dataFileExists, readDataFileJson } from "./Util"

export interface PickerCalendar {
    filename: string
    id: number
    order?: number
    category?: string
    hidden?: boolean
}

export interface Picker {
    calendars: PickerCalendar[]
}

/**
 * Read and validate the picker.json file.
 * @returns The picker if it is valid, or undefined if it is invalid or does not exist.
 */
export function readPicker(): Picker | undefined {
    const pickerFile = "picker.json"

    // Safe read with default
    if (!dataFileExists(pickerFile)) {
        console.warn(`${pickerFile} does not exist`)
        return undefined
    }

    try {
        return readDataFileJson(pickerFile, "picker.schema.json") as Picker
    } catch (e) {
        console.warn(`Failed to load ${pickerFile}`)
        console.warn(e)
        return undefined
    }
}

