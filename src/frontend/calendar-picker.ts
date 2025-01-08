const indexUrl = '/c/index'
const selectedClassName = 'selected'

interface PickerConfig {
    calendars: PickerCalendar[]
}

interface PickerCalendar {
    filename: string
    id: number
    order?: number
    category?: string
}

interface PickerCalendarTree {
    calendars?: PickerCalendar[]
    subcategories?: PickerCalendarSubTree[]
}

interface PickerCalendarSubTree extends PickerCalendarTree {
    name: string
}

const picker: Promise<PickerConfig> = (async () => {
    const response = await fetch('/picker.json')
    return response.json()
})()

document.addEventListener('DOMContentLoaded', async () => {
    const calendarContainer = document.getElementById('calendars') as HTMLDivElement

    const calendarTree: PickerCalendarTree = {}
    function addCalendar(calendar: PickerCalendar) {
        if (calendar.category) {
            let tokens: string[] = calendar.category.split('/').filter(token => token.trim().length)
            let latest: string
            let node: PickerCalendarTree = calendarTree
            while (tokens.length > 0) {
                ;[latest, ...tokens] = tokens
                let subcategory = node.subcategories?.find(s => s.name === latest)
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

    ;(await picker).calendars.forEach(calendar => {
        addCalendar(calendar)
    })

    renderTree(calendarTree, calendarContainer)
    update()

    // Make checkbox fields clickable anywhere
    for (const field of document.getElementsByClassName('checkbox-field')) {
        const checkbox = field.getElementsByTagName('input')[0]
        field.addEventListener('click', ev => {
            if (ev.target !== checkbox) {
                ev.preventDefault()
                checkbox.click()
            }
        })
    }
})

function renderTree(tree: PickerCalendarTree | PickerCalendarSubTree, container: HTMLElement, depth: number = 2) {
    if (depth > 6) {
        throw Error(`Unable to create header for depth ${depth}`)
    }

    const subContainer = document.createElement('div')
    subContainer.className = 'calendar-group'

    if ('name' in tree) {
        const header = document.createElement(`h${depth}`)
        header.innerText = tree.name
        subContainer.append(header)
    }

    // Select all button
    const selectAll = createSelectAllButton(subContainer)
    subContainer.appendChild(selectAll)

    // Render calendar buttons
    const subCalendars = tree.calendars ?? []
    const sortedCalendars = subCalendars //
        .sort((a, b) => a.filename.localeCompare(b.filename))
        .sort((a, b) => (a.order ?? Infinity) - (b.order ?? Infinity))

    const calendarDiv = document.createElement('div')
    calendarDiv.className = 'calendar-grid'
    subContainer.appendChild(calendarDiv)
    sortedCalendars.forEach(calendar => {
        const button = document.createElement('button')
        makeCalendarButton(button, calendar)
        calendarDiv.appendChild(button)
    })
    container.appendChild(subContainer)

    // Render subcategories
    const subCategories = tree.subcategories ?? []
    const sortedCategories = subCategories.sort((a, b) => a.name.localeCompare(b.name))
    sortedCategories.forEach(category => {
        renderTree(category, subContainer, depth + 1)
    })
}

function createSelectAllButton(group: HTMLElement) {
    const selectAll = document.createElement('span')
    selectAll.className = 'checkbox-field'
    const selectAllCheckbox = document.createElement('input')
    selectAllCheckbox.type = 'checkbox'
    selectAllCheckbox.className = 'select-all'
    const selectAllLabel = document.createElement('label')
    selectAllLabel.innerText = 'Select all'

    selectAll.appendChild(selectAllCheckbox)
    selectAll.appendChild(selectAllLabel)

    selectAllCheckbox.addEventListener('change', ev => {
        if (selectAllCheckbox.checked) {
            select(el => group.contains(el))
        } else {
            unselect(el => group.contains(el))
        }
    })

    return selectAll
}

async function makeCalendarButton(button: HTMLButtonElement, calendar: PickerCalendar) {
    // Data
    button.setAttribute('data-calendar-id', calendar.id.toString())
    button.setAttribute('data-calendar-filename', calendar.filename)

    // Style
    button.classList.add('calendar-item')

    const text = document.createElement('span')
    const displayName = await getCalendarName(calendar.filename)
    text.innerText = displayName

    // Select on click
    button.addEventListener('click', ev => {
        const el = ev.currentTarget as HTMLElement
        if (el.classList.contains(selectedClassName)) {
            el.classList.remove(selectedClassName)
        } else {
            el.classList.add(selectedClassName)
        }
        update()
    })

    button.appendChild(text)
}

function getIndex(indexUrl: string): Promise<string[]> {
    return new Promise((resolve, reject) => {
        fetch(indexUrl).then(async response => {
            if (!response.ok) {
                reject('Failed to get index file')
                return
            }

            const text = await response.text()
            const lines = text.split('\n').filter(line => line.trim().length > 0)

            resolve(lines)
        })
    })
}

function getCalendarName(filename: string): Promise<string> {
    return new Promise((resolve, reject) => {
        fetch(`/c/name/${filename}`).then(async response => {
            const json = await response.json()
            if (!response.ok) {
                if (json) {
                    reject(json.error.message)
                } else {
                    reject('Failed to fetch calendar name from server')
                }
                return
            }

            resolve(json.name)
        })
    })
}

function update() {
    // Get elements
    const calendarContainer = document.getElementById('calendars') as HTMLDivElement
    const calendarUrl = document.getElementById('calendar-url') as HTMLInputElement
    const showOrigin = document.getElementById('show-origin') as HTMLInputElement

    const showOriginSection = document.getElementById('show-origin-section') as HTMLSpanElement
    showOriginSection.hidden = true
    const calendarUrlSection = document.getElementById('calendar-url-section') as HTMLSpanElement
    calendarUrlSection.hidden = false

    // Get domain name
    const urlBase = window.location.origin

    // Find selected elements
    const elements = Array.from(calendarContainer.getElementsByClassName('calendar-item'))
    const selectedElements = Array.from(calendarContainer.getElementsByClassName(selectedClassName))
    if (selectedElements.length == 1) {
        const filename = selectedElements[0].getAttribute('data-calendar-filename')

        calendarUrl.value = `${urlBase}/c/${filename}`
    } else if (selectedElements.length > 1) {
        showOriginSection.hidden = false

        let selected = 0
        for (const element of selectedElements) {
            const id = parseInt(element.getAttribute('data-calendar-id')!)
            selected += 1 << id
        }
        calendarUrl.value = `${urlBase}/m/${selected}?origin=${+showOrigin.checked}`
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
    const calendarUrl = document.getElementById('calendar-url') as HTMLInputElement
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
    const calendarContainer = document.getElementById('calendars') as HTMLDivElement

    const elements = calendarContainer.getElementsByClassName('calendar-item')
    for (const element of elements) {
        if (predicate(element)) {
            element.classList.add(selectedClassName)
        }
    }
    update()
}

function unselect(predicate: (el: Element) => boolean) {
    const calendarContainer = document.getElementById('calendars') as HTMLDivElement

    const elements = calendarContainer.getElementsByClassName('calendar-item')
    for (const element of elements) {
        if (predicate(element)) {
            element.classList.remove(selectedClassName)
        }
    }
    update()
}
