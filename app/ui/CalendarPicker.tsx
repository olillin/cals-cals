'use client'

import { useState } from 'react'
import { Picker, PickerCalendar } from '../lib/types'
import CalendarTree, {
    buildSelectionTree,
    SelectableCalendarTree,
} from './CalendarTree'
import CalendarUrl from './CalendarUrl'
import ErrorPage from './ErrorPage'

export default async function CalendarPicker() {
    // Load picker tree
    const pickerResponse = await fetch('/picker.json')
    if (
        !pickerResponse.ok ||
        !pickerResponse.headers
            .get('Content-Type')
            ?.includes('application/json')
    ) {
        console.error('Received invalid response from /picker.json, see below')
        console.log(pickerResponse)
        return (
            <ErrorPage>
                Failed to load calendar picker, try again later
            </ErrorPage>
        )
    }
    const picker: Picker = await pickerResponse.json()
    const [tree, setTree] = useState(buildSelectionTree(picker.calendars))

    const url: string | null = null

    return (
        <>
            <CalendarTree tree={tree} />
            <span className="checkbox-field" id="show-origin-section">
                <input
                    type="checkbox"
                    id="show-origin"
                    checked={true}
                    // onChange={update}
                />
                <label htmlFor="show-origin">
                    Show calendar name in events
                </label>
            </span>

            {url && <CalendarUrl url={url} />}
        </>
    )
}

// document.addEventListener('DOMContentLoaded', async () => {
//     update()
// })

function update() {
    // Get elements
    const calendarContainer = document.getElementById(
        'calendars'
    ) as HTMLDivElement
    const calendarUrl = document.getElementById(
        'calendar-url'
    ) as HTMLInputElement
    const showOrigin = document.getElementById(
        'show-origin'
    ) as HTMLInputElement

    const showOriginSection = document.getElementById(
        'show-origin-section'
    ) as HTMLSpanElement
    showOriginSection.hidden = true
    const calendarUrlSection = document.getElementById(
        'calendar-url-section'
    ) as HTMLSpanElement
    calendarUrlSection.hidden = false

    // Get domain name
    const urlBase = window.location.origin.replace(/^https?/, 'webcal')

    // Find selected elements
    const elements = Array.from(
        calendarContainer.getElementsByClassName('calendar-item')
    )
    const selectedElements = Array.from(
        calendarContainer.getElementsByClassName(selectedClassName)
    )
    if (selectedElements.length == 1) {
        const filename = selectedElements[0].getAttribute(
            'data-calendar-filename'
        )

        calendarUrl.value = `${urlBase}/c/${filename}`
    } else if (selectedElements.length > 1) {
        showOriginSection.hidden = false

        let selected = 0
        for (const element of selectedElements) {
            const id = parseInt(element.getAttribute('data-calendar-id')!)
            selected += 1 << id
        }
        calendarUrl.value = `${urlBase}/m/${selected}${showOrigin.checked ? '?origin' : ''}`
    } else {
        calendarUrlSection.hidden = true
        calendarUrl.value = ''
    }

    for (const selectAll of document.getElementsByClassName('select-all')) {
        ;(selectAll as HTMLInputElement).checked = elements.every(e => {
            let isSelected = e.classList.contains('selected')
            let inGroup = selectAll.parentElement!.parentElement!.contains(e)
            console.log({
                selectAll,
                e,
                isSelected,
                inGroup,
            })
            return !(!isSelected && inGroup)
            // S G
            // 0 0 1
            // 1 0 1
            // 0 1 0
            // 1 1 1
        })
    }
}

function select(predicate: (el: Element) => boolean) {
    const calendarContainer = document.getElementById(
        'calendars'
    ) as HTMLDivElement

    const elements = calendarContainer.getElementsByClassName('calendar-item')
    for (const element of elements) {
        if (predicate(element)) {
            element.classList.add(selectedClassName)
        }
    }
    update()
}

function unselect(predicate: (el: Element) => boolean) {
    const calendarContainer = document.getElementById(
        'calendars'
    ) as HTMLDivElement

    const elements = calendarContainer.getElementsByClassName('calendar-item')
    for (const element of elements) {
        if (predicate(element)) {
            element.classList.remove(selectedClassName)
        }
    }
    update()
}
