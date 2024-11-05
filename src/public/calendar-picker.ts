const calendarGrid = document.getElementById('calendar-grid')!
const calendarUrl = document.getElementById('calendar-url')!

;(async function setupGrid() {
    const indexUrl = '/c/index'
    const index = await getIndex(indexUrl)
    const elements = await toGridElements(index)

    elements.forEach(element => {
        calendarGrid.append(element)
    })
})()

async function toGridElements(index: string[]): Promise<HTMLElement[]> {
    const elementPromises = index.map(async (filename, i) => {
        const displayName = await getCalendarName(filename)

        const item = document.createElement('div')
        item.classList.add('calendar-item')
        item.setAttribute('data-bit-value', (2 ** i).toString())
        const text = document.createElement('span')
        text.innerText = displayName
        item.appendChild(text)
        return item
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
