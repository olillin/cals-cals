import { NextRequest } from 'next/server'
import { UrlResponse } from './responses'
import { TimeEditGroupByOption } from '@/app/lib/timeedit'
import { CanvasGroupByOption } from '@/app/lib/canvas'
import { AdapterChoice } from '../ui/calendar/builder/AdapterBuilder'

export interface AvailableGroup<T> {
    property: T
    propertyIndex: number
    values: {
        [k: string]: string
    }
}

export interface GroupedUrlExtras<T> {
    name?: string
    groups: AvailableGroup<T>[]
}

export interface GroupedUrlResponse<T> extends UrlResponse {
    extra: GroupedUrlExtras<T>
}

export type GroupedUrlResponseOfAdapter<T extends AdapterChoice> =
    GroupedUrlResponse<
        T extends 'timeedit' ? TimeEditGroupByOption : CanvasGroupByOption
    >

/**
 * Get the index of the property to group by.
 * @param req The request to parse.
 * @returns The index of the property in {@link groupByOptions}.
 * @throws {Error} If the 'group' query parameter is missing or invalid.
 */
export function parseGroupBy(req: NextRequest): number {
    const groupByString = req.nextUrl.searchParams.get('group')
    if (groupByString === undefined)
        throw new Error(
            "Unable to find property to group by. Missing query parameter 'group'"
        )

    let groupBy: number
    try {
        groupBy = parseInt(String(groupByString))
    } catch {
        throw new Error(
            "Invalid query parameter 'group', must be a positive integer"
        )
    }
    if (groupBy < 0) {
        throw new Error(
            "Invalid query parameter 'group', must be a positive integer"
        )
    }

    return groupBy
}

/**
 * Get the allowed values for grouping from the request.
 *
 * One element represents one allowed combination of TimeEdit property values.
 * @param req The request to parse.
 * @returns A set of allowed values.
 * @throws {Error} If the request has no group values.
 */
export function parseAllowedValues(req: NextRequest): Set<string> {
    const serializedValues = req.nextUrl.searchParams.get('gi')
    if (serializedValues == undefined)
        throw new Error(
            "Unable to get group index. Missing query parameter 'gi'"
        )

    const values = String(serializedValues)
        .replace(/[^a-z0-9_ -]/g, '')
        .split(' ')
        .map(value =>
            value === '_'
                ? value
                : value
                      .split('_')
                      .filter(v => v !== '')
                      .sort()
                      .join('_')
        )
        .filter(v => v !== '')

    return new Set(values)
}

/**
 * Prepare a value to be used in grouping comparisons.
 * @param value The value to simplify.
 * @returns A URL friendly simplified version of the value.
 */
export function prepareForComparison(value: string): string {
    return value.toLowerCase().replace(/[^a-z0-9]/g, '-')
}

/**
 * Prepare a value to be used in grouping comparisons.
 * @param value The set to simplify, represents one combination of property values.
 * @returns A URL friendly simplified version of the value.
 */
export function prepareSetForComparison(value: string[]): string {
    return value
        .map(prepareForComparison)
        .filter(v => v !== '')
        .sort()
        .join('_')
}
