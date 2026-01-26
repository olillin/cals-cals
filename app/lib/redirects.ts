import { readDataFileJson } from "./Util"


export interface Redirects {
    [x: string]: string
}

export const defaultRedirects: Redirects = {}

export function readRedirects(): Redirects {
    const redirectsFile = "redirects.json"
    try {
        return readDataFileJson(redirectsFile, "redirects.schema.json") as Redirects
    } catch (e) {
        console.warn(`Failed to load ${redirectsFile}, using default redirects`)
        console.warn(e)

        return defaultRedirects
    }
}

