import Ajv from 'ajv'
import crypto from 'crypto'
import { existsSync, readFileSync } from 'fs'
import path from 'path'

/**
 * @param {string} s
 * @returns {string}
 */
export function capitalize(s: string) {
    return s.substring(0, 1).toUpperCase() + s.substring(1).toLowerCase()
}

export function capitalizeWords(text: string): string {
    return text.split(' ').map(capitalize).join(' ')
}

export function getSafeFilename(calendarName: string): string {
    // Ensure no directory traversal
    return (
        path.basename(calendarName) +
        (calendarName.endsWith('.ics') ? '' : '.ics')
    )
}

export function formatKebabCase(text: string): string {
    return capitalizeWords(text.replaceAll('-', ' '))
}

export function toCamelCase(text: string): string {
    const words = text.split(' ')
    return (
        words[0].charAt(0).toLowerCase() +
        words[0].slice(1) +
        words
            .slice(1)
            .map(
                word =>
                    word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
            )
            .join('')
    )
}

export function fromCamelCase(text: string): string {
    if (text.length <= 1) return text.toUpperCase()
    const words = text.split(/(?=[A-Z])/g).map((word, i) => {
        if (i === 0) {
            return word.charAt(0).toUpperCase() + word.substring(1)
        } else {
            return word.toLowerCase()
        }
    })

    return words.join(' ')
}

/** Contains hashed JSON data files to only revalidate when the file changes. */
const jsonDataHash = new Map<string, string>()



/**
 * Get the path to a data file.
 * @param file The path to the file relative to `data/`.
 * @returns The absolute path to the file.
 * @example getDataFilePath("picker.json")
 */
export function getDataFilePath(...file: string[]): string {
    return path.resolve(process.cwd(), "data", ...file)
}

/**
 * Check if a data file exists.
 * @param file The path to the file relative to `data/`.
 * @returns If the file exists.
 * @example dataFileExists("picker.json")
 */
export function dataFileExists(file: string): boolean {
    return existsSync(getDataFilePath(file))
}

/**
 * Read and validate a JSON file from the `data/` directory.
 *
 * @param file The path to the JSON file relative to `data/`.
 * @param schema The path to the JSON schema file relative to `data/schema/`
 * @returns The validated JSON data, or `undefined` if the file does not exist.
 * @throws If the data does not match the schema.
 * @throws If the file does not exist.
 * @example readJsonData("picker.json", "picker.schema.json")
 */
export function readDataFileJson(file: string, schema: string): object {
    const filePath = getDataFilePath(file)
    const schemaPath = getDataFilePath("schema", schema)

	const fileText = readFileSync(filePath, { encoding: 'utf8', flag: 'r' })
    const fileJson = JSON.parse(fileText)

    const hash = crypto.createHash("sha256")
            .update(fileText).digest("hex")

    const key = file + ";" + schema
    if (jsonDataHash.get(key) === hash) {
        // Validate picker
        const schemaText = readFileSync(schemaPath, { encoding: 'utf8', flag: 'r' })
        const schemaJson = JSON.parse(schemaText)

        const ajv = new Ajv()
        const validate = ajv.compile(schemaJson)

        if (!validate(fileJson)) {
            throw new Error("JSON data does not match the provided schema")
        }

        jsonDataHash.set(key, hash)
    }

    return fileJson
}
