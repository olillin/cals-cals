const indexUrl = '/c/index'
const selectedClassName = 'selected'

const elements: Promise<HTMLElement[]> = (async () => {
    const index = await getIndex(indexUrl)
    return toGridElements(index)
})()

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
    const calendarGrid = document.getElementById('calendar-grid') as HTMLDivElement

    const calendarTree: PickerCalendarTree = {}
    const addCalendar = (calendar: PickerCalendar) => {
        if (calendar.category) {
            let tokens: string[] = calendar.category.split('/')
            let latest: string
            let node: PickerCalendarTree = calendarTree
            while (tokens) {
                [latest, ...tokens] = tokens
                let subcategory = node.subcategories?.find(s => {s.name === latest})
                if (subcategory) {
                    node = subcategory
                } else {
                    subcategory = {
                        name: latest
                    }
                    if (node.subcategories) {
                        node.subcategories.push(subcategory)
                    } else {
                        node.subcategories = [subcategory]
                    }
                    node = subcategory
                }
            }
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

    const renderRoot = calendarGrid
    const renderTree = (tree: PickerCalendarTree|PickerCalendarSubTree, level=2) => {
        if ("name" in tree) {
            const header = document.createElement(`h${level}`)
            renderRoot.append(header)
        }

        const sortedCalendars = tree.calendars?.sort((a, b) => a.filename.localeCompare(b .filename))
        sortedCalendars.forEach(calendar => {
            
        })
    }

    ;(await elements).forEach(element => {
        calendarGrid.append(element)

        element.addEventListener('click', ev => {
            const el = ev.currentTarget as HTMLElement
            if (el.classList.contains(selectedClassName)) {
                el.classList.remove(selectedClassName)
            } else {
                el.classList.add(selectedClassName)
            }
            update()
        })
    })

    update()

    const aspaAlltButton = document.getElementById('aspa-allt') as HTMLInputElement 
    aspaAlltButton.addEventListener("change", () => {
        if (aspaAlltButton.checked) {
            aspaAllt()
        } else {
            select(() => false)
        }
    })
})

async function toGridElements(index: string[]): Promise<HTMLElement[]> {
    const elementPromises = index.map(async (filename, i) => {
        const displayName = await getCalendarName(filename)

        const button = document.createElement('button')
        button.classList.add('calendar-item')
        button.setAttribute('data-bit-value', (2 ** i).toString())
        button.setAttribute("data-calendar-filename", filename)
        const text = document.createElement('span')
        text.innerText = displayName
        button.appendChild(text)
        return button
    })

    const elements = await Promise.all(elementPromises)
    return elements
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
    const calendarGrid = document.getElementById('calendar-grid') as HTMLDivElement
    const calendarUrl = document.getElementById('calendar-url') as HTMLInputElement
    const showOrigin = document.getElementById('show-origin') as HTMLInputElement
    const aspaAlltCheck = document.getElementById('aspa-allt') as HTMLInputElement

    const showOriginSection = document.getElementById('show-origin-section') as HTMLSpanElement
    showOriginSection.hidden = true
    const calendarUrlSection = document.getElementById('calendar-url-section') as HTMLSpanElement
    calendarUrlSection.hidden = false

    const urlBase = window.location.origin

    const elements = Array.from(calendarGrid.getElementsByClassName('calendar-item'))
    const selectedElements = Array.from(calendarGrid.getElementsByClassName(selectedClassName))
    if (selectedElements.length == 1) {
        const filename = selectedElements[0].getAttribute("data-calendar-filename")

        calendarUrl.value = `${urlBase}/c/${filename}`
    } else if (selectedElements.length > 1) {
        showOriginSection.hidden = false

        let selected = 0
        for (const element of selectedElements) {
            selected += parseInt(element.getAttribute('data-bit-value')!)
        }
        calendarUrl.value = `${urlBase}/m/${selected}?origin=${+showOrigin.checked}`
    } else {
        calendarUrlSection.hidden = true
        calendarUrl.value = ''
    }

    aspaAlltCheck.checked = elements.every(e => {
        let isSelected = e.classList.contains('selected')
        let isAspa = e.getAttribute('data-calendar-filename')!.startsWith('aspa')
        return !(+isSelected ^ +isAspa)
    })
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

function aspaAllt() {
    select(el => {
        const filename = el.getAttribute('data-calendar-filename')!
        return filename.startsWith("aspa")
    })
}

function select(predicate: (el: Element) => boolean) {
    const calendarGrid = document.getElementById('calendar-grid') as HTMLDivElement
    
    const elements = calendarGrid.getElementsByClassName("calendar-item")
    for (const element of elements) {
        if (predicate(element)) {
            element.classList.add(selectedClassName)
        } else {
            element.classList.remove(selectedClassName)
        }
    }
    update()
}