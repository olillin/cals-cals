'use client'

import {
    cloneTree,
    getSelectedCalendars,
    getTreeCalendars,
    getTrees,
    propagateSelectionUp,
    RenderedCalendarTree,
    RenderedPickerCalendar,
    selectAll,
    TreeSelectedState,
} from '@/app/lib/calendarTree'
import { Dispatch, SetStateAction, useState } from 'react'
import { PickerCalendar } from '@/app/lib/picker'
import CalendarTree from './CalendarTree'
import CalendarCard from '../CalendarCard'

export default function CalendarPicker({
    initialTree,
    baseUrl,
}: {
    initialTree: RenderedCalendarTree
    baseUrl: string
}) {
    const [tree, setTree] = useState<RenderedCalendarTree>(initialTree)
    const [showOrigin, setShowOrigin] = useState(true)

    const selectedCalendars = getSelectedCalendars(tree)
    const showOriginCheckbox = selectedCalendars.length >= 2
    const url = generateUrl(baseUrl, selectedCalendars, showOrigin)
    const calendarName = generateCalendarName(selectedCalendars, tree)

    return (
        <>
            <CalendarTree
                tree={tree}
                // Clone the tree so React can detect when we update it
                onSelectCalendar={selectCalendar(cloneTree(tree), setTree)}
                onSelectTree={selectTree(cloneTree(tree), setTree)}
            />

            {showOriginCheckbox && (
                <span className="checkbox-field show-origin-section">
                    <input
                        type="checkbox"
                        name="show-origin"
                        id="show-origin"
                        checked={showOrigin}
                        onChange={ev => {
                            setShowOrigin(ev.currentTarget.checked)
                        }}
                    />
                    <label htmlFor="show-origin">
                        Show calendar name in events
                    </label>
                </span>
            )}

            {url && <CalendarCard url={url} calendarName={calendarName} />}
        </>
    )
}

function selectCalendar(
    treeCopy: RenderedCalendarTree,
    setTree: Dispatch<SetStateAction<RenderedCalendarTree>>
) {
    return (selectedCalendar: RenderedPickerCalendar) => {
        if (!treeCopy) return

        const calendarCopy = getTreeCalendars(treeCopy).find(
            c => c.id === selectedCalendar.id
        )

        if (!calendarCopy) return
        calendarCopy.selected = !selectedCalendar.selected
        propagateSelectionUp(calendarCopy.parent)

        setTree(treeCopy)
    }
}

function selectTree(
    treeCopy: RenderedCalendarTree,
    setTree: Dispatch<SetStateAction<RenderedCalendarTree>>
) {
    return (selectedTree: RenderedCalendarTree) => {
        if (!treeCopy) return

        const selectTreeCopy = getTrees(treeCopy).find(
            currentTree => currentTree.id === selectedTree.id
        )
        if (!selectTreeCopy) return

        const newSelectedValue =
            selectTreeCopy.selected !== TreeSelectedState.FULL
        selectAll(selectTreeCopy, newSelectedValue)

        setTree(treeCopy)
    }
}

function generateUrl(
    baseUrl: string,
    calendars: PickerCalendar[],
    showOrigin: boolean = true
): string | null {
    if (calendars.length === 0) {
        return null
    }

    if (calendars.length == 1) {
        // Single calendar
        const filename = calendars[0].filename
        return new URL(`/c/${filename}`, baseUrl).href
    }

    // Merge calendars
    let bitmask = BigInt(0)
    for (const calendar of calendars) {
        bitmask += BigInt(1) << BigInt(calendar.id)
    }
    const url = new URL(`/m/${bitmask}`, baseUrl).href
    if (showOrigin) {
        return url + '?origin'
    }
    return url
}

function generateCalendarName(
    calendars: PickerCalendar[],
    tree: RenderedCalendarTree
): string | undefined {
    if (calendars.length === 0) {
        return undefined
    }

    const getDisplayName = (
        calendarId: number,
        tree: RenderedCalendarTree
    ): string | null => {
        for (const calendar of tree.calendars ?? []) {
            if (calendar.id === calendarId) {
                return calendar.displayName
            }
        }

        for (const subcategory of tree.subcategories ?? []) {
            const name = getDisplayName(calendarId, subcategory)
            if (name !== null) return name
        }

        return null
    }

    return calendars
        .map(calendar => getDisplayName(calendar.id, tree))
        .join('+')
}
