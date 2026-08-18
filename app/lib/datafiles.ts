import Ajv from 'ajv'
import crypto from 'crypto'
import { readFile } from 'fs/promises'
import path from 'path'
import fs from 'fs/promises'
import { Picker, readPicker } from './picker'

/** Contains hashed JSON data files to only revalidate when the file changes. */
const jsonDataHash = new Map<string, string>()

/**
 * Get the path to a data file.
 * @param file The path to the file relative to `data/`.
 * @returns The absolute path to the file.
 * @example getDataFilePath("picker.json")
 */
export function getDataFilePath(...file: string[]): string {
    return path.resolve(process.cwd(), 'data', ...file)
}

/**
 * Read and validate a JSON file from the `data/` directory.
 * @template T The expected type of the object.
 * @param file The path to the JSON file relative to `data/`.
 * @param schema The path to the JSON schema file relative to `data/schema/`.
 * @returns The validated JSON data, or `undefined` if the file does not exist.
 * @throws {Error} If the data file does not exist.
 * @throws {Error} If the schema file does not exist.
 * @throws {Error} If the data does not match the schema.
 * @example readJsonData("picker.json", "picker.schema.json")
 */
export async function readDataFileJson<T extends object>(
    file: string,
    schema: string
): Promise<T> {
    const filePath = getDataFilePath(file)
    const schemaPath = getDataFilePath('schema', schema)

    const fileText = await readFile(filePath, { encoding: 'utf8' }).catch(
        reason => reason as unknown
    )
    if (typeof fileText !== 'string') {
        // Failed to read data file
        throw new Error(`Failed to read data file: ${String(fileText)}`)
    }

    const fileJson = JSON.parse(fileText) as object

    const hash = crypto.createHash('sha256').update(fileText).digest('hex')

    const key = file + ';' + schema
    if (jsonDataHash.get(key) === hash) {
        // Validate picker
        const schemaText = await readFile(schemaPath, {
            encoding: 'utf8',
            flag: 'r',
        }).catch(reason => reason as unknown)

        if (typeof schemaText !== 'string') {
            // Failed to read schema file
            throw new Error(
                `Failed to read data file schema: ${String(schemaText)}`
            )
        }

        const schemaJson = JSON.parse(schemaText) as object

        const ajv = new Ajv()
        const validate = ajv.compile(schemaJson)

        if (!validate(fileJson)) {
            throw new Error('JSON data does not match the provided schema')
        }

        jsonDataHash.set(key, hash)
    }

    return fileJson as T
}

export class NoPickerError extends Error {}

/**
 * Read a calendar file.
 * @param filename The name of the calendar including the file extension.
 * @returns The content of the file or null if the file is invalid.
 */
export async function readCalendarFile(
    filename: string
): Promise<string | null> {
    const pickerConfig: Picker | undefined = await readPicker()
    if (pickerConfig === undefined) {
        throw new NoPickerError(
            'Unable to find calendar file, picker file is undefined'
        )
    }

    const pickerCalendar = pickerConfig.calendars.find(
        c => c.filename === filename
    )
    if (pickerCalendar === undefined) {
        return null
    }

    const filePath = getDataFilePath('calendars', pickerCalendar.filename)
    return fs.readFile(filePath, 'utf8')
}
