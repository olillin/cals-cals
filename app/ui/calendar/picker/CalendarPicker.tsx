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
import CalendarUrl from '../CalendarUrl'

export default function CalendarPicker({
    initialTree,
    urlBase,
}: {
    initialTree: RenderedCalendarTree
    urlBase: string
}) {
    const [tree, setTree] = useState<RenderedCalendarTree>(initialTree)
    const [showOrigin, setShowOrigin] = useState(true)

    const selectedCalendars = getSelectedCalendars(tree)
    const showOriginCheckbox = selectedCalendars.length >= 2
    const url: string | null = generateUrl(
        urlBase,
        selectedCalendars,
        showOrigin
    )

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

            {url && <CalendarUrl url={url} />}
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
    urlBase: string,
    calendars: PickerCalendar[],
    showOrigin: boolean = true
): string | null {
    if (calendars.length === 0) {
        return null
    }

    if (calendars.length == 1) {
        // Single calendar
        const filename = calendars[0].filename
        return `${urlBase}/c/${filename}`
    }

    // Merge calendars
    let bitmask = 0
    for (const calendar of calendars) {
        bitmask += 1 << calendar.id
    }
    return `${urlBase}/m/${bitmask}${showOrigin ? '?origin' : ''}`
}
