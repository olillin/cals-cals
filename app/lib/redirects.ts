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
export async function readRedirects(): Promise<Redirects> {
    const redirectsFile = 'redirects.json'
    return await readDataFileJson<Redirects>(
        redirectsFile,
        'redirects.schema.json'
    ).catch(reason => {
        console.warn(`Failed to load ${redirectsFile}, using default redirects`)
        console.warn(reason)

        return defaultRedirects
    })
}
