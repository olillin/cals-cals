'use server'

import { Suspense } from 'react'
import RootCalendarTree from '@/app/ui/RootCalendarTree'
import { CalendarTreeSkeleton } from '@/app/ui/skeletons'

export default async function Page() {
    return (
        <section className="calendar-picker">
            <h2>Calendar Picker</h2>
            <p>
                Here you can select which calendars you want to include in your
                custom calendar feed. The URL you get at the bottom will
                automatically update as you select and deselect calendars. You
                can then use this URL to subscribe to your custom calendar feed
                in your calendar application of choice.
            </p>

            <RootCalendarTree />

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

            <span className="calendar-url" id="calendar-url-section">
                <input
                    type="text"
                    id="calendar-url"
                    disabled
                    aria-disabled="true"
                />
                <span id="copy-notice" className="copy-notice">
                    <span className="no-select">Copied!</span>
                </span>
                <button
                    id="copy-calendar-url"
                    className="copy-calendar-url"
                    // onClick={copyUrl}
                ></button>
            </span>
        </section>
    )
}

const selectedClassName = 'selected'

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

function copyUrl() {
    const calendarUrl = document.getElementById(
        'calendar-url'
    ) as HTMLInputElement
    const copyNotice = document.getElementById('copy-notice') as HTMLSpanElement

    calendarUrl.select()
    calendarUrl.setSelectionRange(0, 99999) // For mobile devices

    navigator.clipboard.writeText(calendarUrl.value)

    copyNotice.classList.add('visible')
    setTimeout(() => {
        copyNotice.classList.remove('visible')
    }, 3000)
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
