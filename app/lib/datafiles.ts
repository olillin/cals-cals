import Ajv from 'ajv'
import crypto from 'crypto'
import { existsSync, readFileSync } from 'fs'
import path from 'path'

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
 * @param file The path to the JSON file relative to `data/`.
 * @param schema The path to the JSON schema file relative to `data/schema/`.
 * @returns The validated JSON data, or `undefined` if the file does not exist.
 * @throws {Error} If the data does not match the schema.
 * @throws {Error} If the file does not exist.
 * @example readJsonData("picker.json", "picker.schema.json")
 */
export function readDataFileJson(file: string, schema: string): object {
    const filePath = getDataFilePath(file)
    const schemaPath = getDataFilePath('schema', schema)

    const fileText = readFileSync(filePath, { encoding: 'utf8' })
    const fileJson = JSON.parse(fileText) as object

    const fileHash = crypto.createHash('sha256').update(fileText).digest('hex')
    const schemaHash = crypto.createHash('sha256').update(fileText).digest('hex')
    const hash = fileHash + schemaHash

    const key = file + ';' + schema
    if (jsonDataHash.get(key) === hash) {
        // Validate picker
        const schemaText = readFileSync(schemaPath, {
            encoding: 'utf8',
            flag: 'r',
        })
        const schemaJson = JSON.parse(schemaText) as object

        const ajv = new Ajv()
        const validate = ajv.compile(schemaJson)

        if (!validate(fileJson)) {
            throw new Error('JSON data does not match the provided schema')
        }

        jsonDataHash.set(key, hash)
    }

    return fileJson
}
