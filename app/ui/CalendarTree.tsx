'use server'

import { PickerCalendar } from '@/app/lib/types'
import React, { ReactNode } from 'react'
import { getCalendarFile } from '../(routes)/c/[calendarName]/route'
import { parseCalendar } from 'iamcal'
import { CalendarButton, SelectAllButton } from './pickerClientComponents'

export interface PickerCalendarTree {
    calendars?: PickerCalendar[]
    subcategories?: PickerCalendarSubTree[]
}

export interface PickerCalendarSubTree extends PickerCalendarTree {
    name: string
}

function isSubTree(tree: PickerCalendarTree): tree is PickerCalendarSubTree {
    return 'name' in tree
}

export default async function CalendarTree({
    tree,
    depth = 2,
}: {
    tree: PickerCalendarTree | PickerCalendarSubTree
    depth?: number
}) {
    const subCalendars = tree.calendars ?? []
    const sortedCalendars = subCalendars //
        .sort((a, b) => a.filename.localeCompare(b.filename))
        .sort((a, b) => (a.order ?? Infinity) - (b.order ?? Infinity))

    const subCategories = tree.subcategories ?? []
    const sortedSubCategories = subCategories.sort((a, b) =>
        a.name.localeCompare(b.name)
    )

    return (
        <div className="calendar-group">
            {isSubTree(tree) ? <Header depth={depth}>data.name</Header> : null}

            <SelectAllButton />

            {/* Calendar buttons */}
            <div className="calendar-grid">
                {sortedCalendars.map(async calendar => (
                    <CalendarButton
                        calendar={calendar}
                        name={await getCalendarName(calendar.filename)}
                        key={calendar.id}
                    />
                ))}
            </div>

            {/* Subcategories */}
            {sortedSubCategories.map(subTree => (
                <CalendarTree tree={subTree} depth={depth + 1} />
            ))}
        </div>
    )
}

function Header({
    depth = 1,
    children,
}: {
    depth?: number
    children: ReactNode
}) {
    const safeDepth = Math.min(Math.max(Math.floor(depth), 1), 6)
    return React.createElement(`h${safeDepth}`, null, children)
}

export async function getCalendarName(filename: string): Promise<string> {
    let parsedCalendarName: string | undefined
    try {
        const fileContents = await getCalendarFile(filename)
        const calendar = await parseCalendar(fileContents)
        parsedCalendarName = calendar.getCalendarName()
    } catch (err) {
        return 'N/A'
    }

    if (!parsedCalendarName) {
        return 'N/A'
    }

    return parsedCalendarName
}
