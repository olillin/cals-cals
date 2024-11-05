const calendarGrid = document.getElementById('calendarGrid')
const calendarUrl = document.getElementById('calendarUrl')

const indexUrl = '/c/index'
fetch(indexUrl)
    .then(response => response.text())
    .then(response => response.split('\n').filter(line => line.trim().length > 0))