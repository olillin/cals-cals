let calendarUrlIn: HTMLInputElement
let builderError: HTMLSpanElement
let builderOutput: HTMLDivElement
let calendarsOut: HTMLDivElement
let addCalendarButton: HTMLButtonElement

type GroupByOption = 'activity' | 'campus' | 'kursKod' | 'lokalnamn'
interface AvailableGroup {
    property: GroupByOption
    values: {
        [k: string]: string
    }
}
interface FilteredCalendar {
    includedValues: string[]
}
interface UrlResponse {
    id: string
    url: string
    groups: AvailableGroup[]
}

let currentBuilderData: UrlResponse | undefined = undefined
let usingGroup: number = -1
let currentCalendars: FilteredCalendar[] = []

document.addEventListener('DOMContentLoaded', () => {
    // Get elements
    calendarUrlIn = document.getElementById(
        'calendar-builder-input-url'
    ) as HTMLInputElement
    builderError = document.getElementById(
        'calendar-builder-error'
    ) as HTMLSpanElement
    builderOutput = document.getElementById(
        'calendar-builder-output'
    ) as HTMLDivElement
    calendarsOut = document.getElementById(
        'builder-calendars'
    ) as HTMLInputElement
    addCalendarButton = document.getElementById(
        'add-calendar'
    ) as HTMLButtonElement

    // Setup
    calendarUrlIn.addEventListener('keydown', event => {
        if (event.key === 'Enter') {
            setBuilderUrl()
            event.preventDefault()
        }
    })
    builderOutput.hidden = true
})

function setBuilderUrl() {
    builderError.innerText = ''

    const chosenAdapter = 'timeedit'

    const oldUrl = calendarUrlIn.value.trim()
    if (!oldUrl) {
        builderError.innerText = 'Please enter a URL'
        return
    }

    fetch(`/adapter/${chosenAdapter}/url?url=${oldUrl}`, {
        method: 'POST',
    })
        .then(response => {
            if (response.ok) {
                return response.json()
            }

            const isJson = response.headers
                .get('Content-Type')
                ?.startsWith('application/json')

            console.error('Failed to fetch adapter URL:')
            console.error(response)

            if (isJson) {
                return response
                    .json()
                    .then(data => data.error.message as string)
                    .then(message => {
                        builderError.innerText = message
                        return currentBuilderData
                    })
            } else {
                builderError.innerText = 'An unknown error occurred'
                return currentBuilderData
            }
        })
        .then(data => {
            setBuilderData(data)
        })
}

function setBuilderData(data: UrlResponse) {
    currentBuilderData = data

    updateBuilder()
}

function updateBuilder() {
    builderOutput.hidden =
        currentBuilderData === undefined || currentBuilderData.url === ''
    if (currentBuilderData === undefined) return

    addCalendarButton.innerText =
        currentCalendars.length === 0
            ? 'Add another calendar to group events'
            : 'Add calendar'

    // Clear old output
    calendarsOut.innerHTML = ''

    if (currentCalendars.length === 0) {
        const url = currentBuilderData.url
        const urlContainer = createUrlContainer(url)
        calendarsOut.appendChild(urlContainer)
    } else {
        currentCalendars.forEach(calendar => {
            console.log(calendar.includedValues)
            const url = createGroupUrl(calendar)
            const urlContainer = createUrlContainer(url)
            calendarsOut.appendChild(urlContainer)
        })
    }
}

function addCalendar() {
    currentCalendars.push({
        includedValues: [],
    })
    updateBuilder()
}

function removeCalendar(i: number) {
    currentCalendars.splice(i, 1)
    updateBuilder()
}

function createGroupUrl(calendar: FilteredCalendar): string {
    if (currentBuilderData === undefined) {
        throw new Error('Unable to create calendar group URL, no base URL data')
    }
    const baseUrl = currentBuilderData.url
    const groupBy = usingGroup
    const gi = calendar.includedValues.join('+')
    const search = `&group=${groupBy}&gi=${gi}`

    return baseUrl + search
}

function createUrlContainer(url: string): HTMLElement {
    const container = document.createElement('span')
    container.className = 'calendar-url'

    const urlInput = document.createElement('input')
    urlInput.type = 'text'
    urlInput.disabled = true
    urlInput.ariaDisabled = 'true'
    urlInput.value = url
    container.appendChild(urlInput)

    const copyNotice = document.createElement('span')
    copyNotice.className = 'copy-notice'
    const innerCopyNotice = document.createElement('span')
    innerCopyNotice.className = 'no-select'
    innerCopyNotice.innerText = 'Copied!'
    copyNotice.appendChild(innerCopyNotice)
    container.appendChild(copyNotice)

    const copyButton = document.createElement('button')
    copyButton.className = 'copy-calendar-url'
    copyButton.onclick = () => {
        urlInput.select()
        urlInput.setSelectionRange(0, 99999) // For mobile devices

        navigator.clipboard.writeText(urlInput.value)

        copyNotice.classList.add('visible')
        setTimeout(() => {
            copyNotice.classList.remove('visible')
        }, 3000)
    }
    container.appendChild(copyButton)

    return container
}
