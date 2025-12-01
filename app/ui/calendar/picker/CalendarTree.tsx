'use client'

import { PickerCalendar } from '@/app/lib/types'
import clsx from 'clsx'
import React, { ReactNode } from 'react'
import {
    RenderedCalendarTree,
    RenderedPickerCalendar,
    TreeSelectedState,
} from '../../../lib/RenderedCalendarTree'
import {} from './CalendarPicker'

export default function CalendarTree({
    tree,
    depth = 2,
    onSelectCalendar,
    onSelectTree,
}: {
    tree: RenderedCalendarTree
    depth?: number
    onSelectCalendar?: (calendar: RenderedPickerCalendar) => void
    onSelectTree?: (tree: RenderedCalendarTree) => void
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
        <div>
            {tree.name && <Header depth={depth}>{tree.name}</Header>}

            {onSelectTree && (
                <SelectAllButton
                    onClick={() => onSelectTree(tree)}
                    selected={tree.selected}
                />
            )}

            {/* Calendar buttons */}
            <div className="grid grid-cols-auto gap-4">
                {sortedCalendars.map(calendar => (
                    <CalendarButton
                        calendar={calendar}
                        key={calendar.id}
                        selected={calendar.selected}
                        onClick={
                            onSelectCalendar
                                ? () => onSelectCalendar(calendar)
                                : undefined
                        }
                    >
                        {calendar.displayName}
                    </CalendarButton>
                ))}
            </div>

            {/* Subcategories */}
            {sortedSubCategories.map(subtree => (
                <CalendarTree
                    key={subtree.id}
                    tree={subtree}
                    depth={depth + 1}
                    onSelectCalendar={onSelectCalendar}
                    onSelectTree={onSelectTree}
                />
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

export function SelectAllButton({
    selected = TreeSelectedState.NONE,
    onClick,
}: {
    selected?: TreeSelectedState | boolean
    onClick?: () => void
}) {
    const isChecked =
        typeof selected === 'boolean'
            ? selected
            : selected === TreeSelectedState.FULL
    return (
        <span
            className="checkbox-field"
            onClick={ev => {
                if (onClick) {
                    ev.preventDefault()
                    onClick()
                }
            }}
        >
            <input
                type="checkbox"
                className={clsx({
                    partial: selected === TreeSelectedState.PARTIAL,
                })}
                checked={isChecked}
                readOnly
            />
            <label className="no-select">Select all</label>
        </span>
    )
}

export function CalendarButton({
    calendar,
    selected = false,
    onClick,
    children,
}: {
    calendar: PickerCalendar
    selected?: boolean
    onClick?: () => void
    children: ReactNode
}) {
    return (
        <button
            data-calendar-id={calendar.id.toString()}
            data-calendar-filename={calendar.filename}
            className={clsx('border-2 border-foreground', {
                'border-glow duration-(--duration-glow-on)': selected,
                'duration-(--duration-glow-off)': !selected,
            })}
            onClick={onClick}
        >
            {children}
        </button>
    )
}
