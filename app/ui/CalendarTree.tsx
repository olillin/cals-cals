import { PickerCalendar } from '@/app/lib/types'
import React, { ReactNode } from 'react'
import { getCalendarFile } from '../(routes)/c/[calendarName]/route'
import { parseCalendar } from 'iamcal'
import { CalendarButton, SelectAllButton } from './pickerClientComponents'

export interface SelectablePickerCalendar extends PickerCalendar {
    selected: boolean
}

export interface SelectableCalendarTree {
    calendars?: SelectablePickerCalendar[]
    subcategories?: SelectableCalendarTree[]
    name?: string
}

export default async function CalendarTree({
    tree,
    depth = 2,
}: {
    tree: SelectableCalendarTree
    depth?: number
}) {
    const subCalendars = tree.calendars ?? []
    const sortedCalendars = subCalendars //
        .sort((a, b) => a.filename.localeCompare(b.filename))
        .sort((a, b) => (a.order ?? Infinity) - (b.order ?? Infinity))

    const subCategories = tree.subcategories ?? []
    const sortedSubCategories = subCategories.sort((a, b) =>
        (a.name ?? '').localeCompare(b.name ?? '')
    )

    return (
        <div className="calendar-group">
            {tree.name && <Header depth={depth}>data.name</Header>}

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

export function buildSelectionTree(
    calendars: PickerCalendar[]
): SelectableCalendarTree {
    const calendarTree: SelectableCalendarTree = {}
    function addCalendar(calendar: SelectablePickerCalendar) {
        if (calendar.category) {
            let tokens: string[] = calendar.category
                .split('/')
                .filter(token => token.trim().length)
            let latest: string
            let node: SelectableCalendarTree = calendarTree
            while (tokens.length > 0) {
                ;[latest, ...tokens] = tokens
                let subcategory = node.subcategories?.find(
                    s => s.name === latest
                )
                if (subcategory) {
                    node = subcategory
                } else {
                    subcategory = {
                        name: latest,
                    }
                    if (node.subcategories) {
                        node.subcategories.push(subcategory)
                    } else {
                        node.subcategories = [subcategory]
                    }
                    node = subcategory
                }
            }
            if (!node.calendars) {
                node.calendars = []
            }
            node.calendars!.push(calendar)
        } else {
            if (calendarTree.calendars) {
                calendarTree.calendars.push(calendar)
            } else {
                calendarTree.calendars = [calendar]
            }
        }
    }

    calendars
        .filter(calendar => calendar.hidden !== true)
        .forEach(calendar => {
            addCalendar({
                ...calendar,
                selected: false,
            })
        })

    return calendarTree
}
