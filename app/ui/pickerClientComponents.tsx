'use client'

import { PickerCalendar } from '../lib/types'

const selectedClassName = 'selected'

export function SelectAllButton({ group }: { group?: HTMLElement }) {
    return (
        <span
            className="checkbox-field"
            // onClick={ev => {
            //     if (ev.target === checkbox.current) return
            //     ev.preventDefault()
            //     checkbox.current?.click()
            // }}
        >
            <input
                // ref={checkbox}
                type="checkbox"
                className="select-all"
                onChange={ev => {
                    // if (ev.currentTarget.checked) {
                    //     select(el => group.contains(el))
                    // } else {
                    //     unselect(el => group.contains(el))
                    // }
                }}
            />
            <label>Select all</label>
        </span>
    )
}

export function CalendarButton({
    calendar,
    name = 'N/A',
}: {
    calendar: PickerCalendar
    name?: string
}) {
    return (
        <button
            data-calendar-id={calendar.id.toString()}
            data-calendar-filename={calendar.filename}
            className="calendar-item"
            onClick={ev => {
                const el = ev.currentTarget as HTMLElement
                if (el.classList.contains(selectedClassName)) {
                    el.classList.remove(selectedClassName)
                } else {
                    el.classList.add(selectedClassName)
                }
                // update()
            }}
        >
            <span>{name}</span>
        </button>
    )
}
