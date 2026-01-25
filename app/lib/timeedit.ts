import { UrlResponse } from './types'

// DO NOT CHANGE ORDER, WILL BREAK EXISTING CALENDAR URLS
export const groupByOptions = (<T extends keyof TimeEditEventData>(
    options: T[]
): T[] => options)([
    'activity',
    'campus',
    'kurskod',
    'lokalnamn',
    'klasskod',
] as const)

export type GroupByOption = (typeof groupByOptions)[number]

export interface AvailableGroup {
    property: GroupByOption
    values: {
        [k: string]: string
    }
}

export interface TimeEditUrlExtras {
    groups: AvailableGroup[]
}

export interface TimeEditUrlResponse extends UrlResponse {
    extra: TimeEditUrlExtras
}

export interface TimeEditEventData {
    [k: string]: string[] | undefined
    activity?: string[]
    klassnamn?: string[]
    klasskod?: string[]
    kursnamn?: string[]
    kurskod?: string[]
    titel?: string[]
    lokalnamn?: string[]
    kartlänk?: string[]
    campus?: string[]
    antaldatorer?: string[]
}

export function parseEventDataString(...strings: string[]): TimeEditEventData {
    const dataPairs = strings
        .flatMap(s =>
            Array.from(
                s.matchAll(
                    /([^:.,\s][^:.,\n]*?): (.+?)(?=(?:[,.] )?(?:[^:.,\s][^:.,\n]*?: |$))/gm
                )
            )
        )
        .map(match => [formatKey(match[1]), match[2].trim()])

    const groupedData: TimeEditEventData = dataPairs.reduce<{
        [k: string]: string[]
    }>((acc, [key, value]) => {
        if (!acc[key]) acc[key] = []
        if (
            !acc[key].includes(value) ||
            key === 'lokalnamn' ||
            key === 'campus'
        ) {
            acc[key].push(value)
        }
        return acc
    }, {})

    // Deduplicate rooms and compuses
    const rooms = groupedData['lokalnamn']
    const campuses = groupedData['campus']
    if (campuses && new Set(campuses).size <= 1) {
        campuses.splice(1)
    } else if (rooms && campuses && rooms.length === campuses.length) {
        const toRemove: number[] = []
        for (let i = rooms.length - 1; i > 0; i--) {
            for (let j = i - 1; j >= 0; j--) {
                if (rooms[j] === rooms[i] && campuses[j] === campuses[i]) {
                    toRemove.push(i)
                    break
                }
            }
        }
        toRemove.forEach(i => {
            rooms.splice(i, 1)
            campuses.splice(i, 1)
        })
    }

    return groupedData
}

export function formatKey(text: string): string {
    const key = text.replaceAll(/\s/g, '').toLowerCase()
    if (key === "aktivitet") return "activity"
    return key
}

export function shortenCourseCode(code: string): string {
    return code.split('_')[0]
}
