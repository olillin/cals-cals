const indexUrl = '/c/index'
const selectedClassName = 'selected'

const elements: Promise<HTMLElement[]> = (async () => {
    const index = await getIndex(indexUrl)
    return toGridElements(index)
})()

document.addEventListener('DOMContentLoaded', async () => {
    const calendarGrid = document.getElementById('calendar-grid') as HTMLDivElement

    ;(await elements).forEach(element => {
        calendarGrid.append(element)

        element.addEventListener('click', ev => {
            const el = ev.currentTarget as HTMLElement
            if (el.classList.contains(selectedClassName)) {
                el.classList.remove(selectedClassName)
            } else {
                el.classList.add(selectedClassName)
            }
            updateUrl()
        })
    })

    updateUrl()
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

function updateUrl() {
    const calendarGrid = document.getElementById('calendar-grid') as HTMLDivElement
    const calendarUrl = document.getElementById('calendar-url') as HTMLInputElement
    const showOrigin = document.getElementById('show-origin') as HTMLInputElement

    const showOriginSection = document.getElementById('show-origin-section') as HTMLSpanElement
    showOriginSection.hidden = true
    const calendarUrlSection = document.getElementById('calendar-url-section') as HTMLSpanElement
    calendarUrlSection.hidden = false

    const urlBase = window.location.origin

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