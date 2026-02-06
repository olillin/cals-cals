import { readDataFileJson } from './datafiles'

/** A mapping of redirects, where each key is the path to redirect from and the value the destination path. */
export interface Redirects {
    [x: string]: string
}

export const defaultRedirects: Redirects = {}

/**
 * Read and validate redirects from file.
 * @returns The parsed redirects, or an empty redirects configuration if the file is missing or invalid.
 */
export function readRedirects(): Redirects {
    const redirectsFile = 'redirects.json'
    try {
        return readDataFileJson(
            redirectsFile,
            'redirects.schema.json'
        ) as Redirects
    } catch (e) {
        console.warn(`Failed to load ${redirectsFile}, using default redirects`)
        console.warn(e)

        return defaultRedirects
    }
}
