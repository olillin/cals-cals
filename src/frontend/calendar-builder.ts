document.addEventListener('DOMContentLoaded', () => {
    const calendarUrlSection = document.getElementById(
        'calendar-builder-url-section'
    ) as HTMLSpanElement
    calendarUrlSection.hidden = true

    const calendarUrlIn = document.getElementById(
        'calendar-builder-input-url'
    ) as HTMLInputElement
    calendarUrlIn.addEventListener('keydown', event => {
        if (event.key === 'Enter') {
            updateBuilder()
            event.preventDefault()
        }
    })
})

function updateBuilder() {
    // Get elements
    const calendarUrlIn = document.getElementById(
        'calendar-builder-input-url'
    ) as HTMLInputElement

    const calendarUrlOut = document.getElementById(
        'calendar-builder-output-url'
    ) as HTMLInputElement

    const builderError = document.getElementById(
        'calendar-builder-error'
    ) as HTMLSpanElement

    const calendarUrlSection = document.getElementById(
        'calendar-builder-url-section'
    ) as HTMLSpanElement

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
                return response.json().then(data => data.url as string)
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
                        return calendarUrlOut.value
                    })
            } else {
                const message = 'An unknown error occurred'
                builderError.innerText = message
                return calendarUrlOut.value
            }
        })
        .then(url => {
            calendarUrlOut.value = url
            calendarUrlSection.hidden = url === ''
        })
}

function copyBuilderUrl() {
    const calendarUrl = document.getElementById(
        'calendar-builder-output-url'
    ) as HTMLInputElement
    const copyNotice = document.getElementById(
        'copy-builder-notice'
    ) as HTMLSpanElement

    calendarUrl.select()
    calendarUrl.setSelectionRange(0, 99999) // For mobile devices

    navigator.clipboard.writeText(calendarUrl.value)

    copyNotice.classList.add('visible')
    setTimeout(() => {
        copyNotice.classList.remove('visible')
    }, 3000)
}
