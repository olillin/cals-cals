const calendarGrid = document.getElementById('calendar-grid')!
const calendarUrl = document.getElementById('calendar-url')!

const indexUrl = '/c/index'
fetch(indexUrl)
    .then(response => response.text())
    .then(response => response.split('\n').filter(line => line.trim().length > 0))
    .then(index => {
        Promise.all(index.map(calendarName => fetch(`/c/name/${calendarName}`).then(async response => (await response.json()).name).then(name => {
            const item = document.createElement('div')
            item.classList.add('calendar-item')
            const text = document.createElement('span')
            text.innerText = name
            item.appendChild(text)
            return item
        })))
        .then(elements => {
            elements.forEach(element => {
                calendarGrid.append(element)
            })
        })
        index.forEach(calendarName => {
        })
    })