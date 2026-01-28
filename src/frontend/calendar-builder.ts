let calendarUrlIn: HTMLInputElement
let builderError: HTMLSpanElement
let builderOutput: HTMLDivElement
let calendarsOut: HTMLDivElement
let addExamsToggle: HTMLInputElement
let addCalendarButton: HTMLButtonElement

type GroupByOption = 'activity' | 'campus' | 'kursKod' | 'lokalnamn'
interface AvailableGroup {
    property: GroupByOption
    values: {
        [k: string]: string
    }
}
interface CalendarGroup {
    includedValues: {
        [k: string]: string
    }
}
interface UrlResponse {
    id: string
    url: string
    extra: {
        groups: AvailableGroup[]
    }
}

let currentBuilderData: UrlResponse | undefined = undefined
let usingGroup: number = -1
const currentCalendarGroups: CalendarGroup[] = []

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
    addExamsToggle = document.getElementById(
        'add-exams'
    ) as HTMLInputElement
    addCalendarButton = document.getElementById(
        'add-group'
    ) as HTMLButtonElement

    // Setup
    calendarUrlIn.addEventListener('keydown', event => {
        if (event.key === 'Enter') {
            setBuilderUrl()
            event.preventDefault()
        }
    })
    // TODO: Add compatability with grouping activity "Tentamen"
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

    // Clear current filters
    currentCalendarGroups.splice(0)
    // Set using group to first available
    usingGroup = -1
    for (let i = 0; i < data.extra.groups.length; i++) {
        const group = data.extra.groups[i]
        if (Object.keys(group.values).length >= 2) {
            usingGroup = i
            break
        }
    }

    updateBuilder()
}

function setUsingGroup(groupIndex: number) {
    usingGroup = groupIndex

    // Recreate groups
    currentCalendarGroups.splice(0)
    addGroup()
}

function updateBuilder() {
    builderOutput.hidden =
        currentBuilderData === undefined || currentBuilderData.url === ''
    if (currentBuilderData === undefined) return

    const addExams: boolean = addExamsToggle.checked

    addCalendarButton.innerText =
        currentCalendarGroups.length === 0 ? 'Group events' : 'Add calendar'

    // Clear old output
    calendarsOut.innerHTML = ''

    if (currentCalendarGroups.length === 0) {
        const url = currentBuilderData.url + (addExams ? '&addExams=1' : '')
        const urlContainer = createUrlContainer(url)
        calendarsOut.appendChild(urlContainer)
    } else {
        const groupBySelector = createGroupBySelector()
        calendarsOut.appendChild(groupBySelector)
        for (let i = 0; i < currentCalendarGroups.length; i++) {
            const groupContainer = createCalendarGroupContainer(i)
            calendarsOut.appendChild(groupContainer)
        }
    }
}

function addGroup() {
    if (!currentBuilderData) {
        console.error('Unable to add calendar, no data to base off')
        return
    }
    if (!currentBuilderData.extra.groups[usingGroup]) {
        console.error(
            `Unable to add calendar, grouping by non-existent group ${usingGroup}`
        )
        return
    }

    if (currentCalendarGroups.length === 0) {
        currentCalendarGroups.push({
            includedValues: Object.fromEntries(
                Object.entries(
                    currentBuilderData.extra.groups[usingGroup].values
                )
            ),
        })
    }
    currentCalendarGroups.push({
        includedValues: {},
    })
    updateBuilder()
}

function removeGroup(i: number) {
    if (currentCalendarGroups.length <= 2) {
        // Delete all groups and return to ungrouped calendars
        currentCalendarGroups.splice(0)
    } else {
        // Move values to new group
        const oldGroup = currentCalendarGroups[i]
        const moveTo = i === 0 ? 1 : i - 1
        Object.entries(oldGroup.includedValues).forEach(
            ([key, prettyValue]) => {
                currentCalendarGroups[moveTo].includedValues[key] = prettyValue
            }
        )

        // Delete just this group
        currentCalendarGroups.splice(i, 1)
    }

    updateBuilder()
}

function moveGroupValue(key: string, fromGroup: number, toGroup: number) {
    const prettyValue = currentCalendarGroups[fromGroup].includedValues[key]
    delete currentCalendarGroups[fromGroup].includedValues[key]
    currentCalendarGroups[toGroup].includedValues[key] = prettyValue
    updateBuilder()
}

function createGroupUrl(calendar: CalendarGroup): string {
    if (currentBuilderData === undefined) {
        throw new Error('Unable to create calendar group URL, no base URL data')
    }
    const baseUrl = currentBuilderData.url
    const groupBy = usingGroup
    const gi = Object.keys(calendar.includedValues).join('+')
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

function createCalendarGroupContainer(groupIndex: number): HTMLElement {
    const group = currentCalendarGroups[groupIndex]

    const container = document.createElement('div')
    container.className = 'calendar-builder-group'

    const header = document.createElement('h3')
    header.innerText = `Calendar group #${groupIndex + 1}`
    container.appendChild(header)

    const deleteGroup = document.createElement('button')
    deleteGroup.className = 'delete-group'
    deleteGroup.onclick = () => {
        removeGroup(groupIndex)
    }
    container.appendChild(deleteGroup)

    const valuesList = document.createElement('ul')
    valuesList.className = 'included-values'
    const includedValues = Object.entries(group.includedValues)
    includedValues.forEach(([key, prettyValue]) => {
        const valueListItem = document.createElement('li')

        const name = document.createElement('span')
        name.innerText = prettyValue
        valueListItem.appendChild(name)

        const moveUp = document.createElement('button')
        moveUp.className = 'move-up'
        moveUp.onclick = () => {
            moveGroupValue(key, groupIndex, groupIndex - 1)
        }
        if (groupIndex < 1) {
            moveUp.disabled = true
            moveUp.ariaDisabled = 'true'
        }
        valueListItem.appendChild(moveUp)

        const moveDown = document.createElement('button')
        moveDown.className = 'move-down'
        moveDown.onclick = () => {
            moveGroupValue(key, groupIndex, groupIndex + 1)
        }
        if (groupIndex >= currentCalendarGroups.length - 1) {
            moveDown.disabled = true
            moveDown.ariaDisabled = 'true'
        }
        valueListItem.appendChild(moveDown)

        valuesList.appendChild(valueListItem)
    })
    container.appendChild(valuesList)

    if (includedValues.length === 0) {
        const empty = document.createElement('p')
        empty.className = 'empty-group'
        empty.innerText =
            'This group is empty, try moving an entry from another group!'
        container.appendChild(empty)
    } else {
        const url = createUrlContainer(createGroupUrl(group))
        container.appendChild(url)
    }

    return container
}

function createGroupBySelector(): HTMLElement {
    const optionCount = currentBuilderData?.extra?.groups?.length ?? 0
    if (optionCount === 0) {
        throw new Error('Unable to create group by selector, no data')
    }

    const container = document.createElement('div')
    container.className = 'group-by'

    const label = document.createElement('label')
    label.innerText = 'Grouping events by'
    container.appendChild(label)

    const buttonContainer = document.createElement('span')
    buttonContainer.className = 'group-by-selector'

    currentBuilderData!.extra.groups.forEach((group, i) => {
        // Ignore properties with less than 2 values
        if (Object.keys(group.values).length < 2) return

        const groupButton = document.createElement('button')
        if (usingGroup === i) {
            groupButton.className = 'selected'
            groupButton.disabled = true
            groupButton.ariaDisabled = 'true'
        } else {
            groupButton.onclick = () => {
                setUsingGroup(i)
            }
        }
        groupButton.innerText = group.property

        buttonContainer.appendChild(groupButton)
    })
    container.appendChild(buttonContainer)

    return container
}
