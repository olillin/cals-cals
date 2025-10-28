import path from 'path'

/**
 * @param {string} s
 * @returns {string}
 */
export function capitalize(s: string) {
    return s.substring(0, 1).toUpperCase() + s.substring(1).toLowerCase()
}

export function capitalizeWords(text: string): string {
    return text.split(' ').map(capitalize).join(' ')
}

export function getSafeFilename(calendarName: string): string {
    // Ensure no directory traversal
    return (
        path.basename(calendarName) +
        (calendarName.endsWith('.ics') ? '' : '.ics')
    )
}

export function formatKebabCase(text: string): string {
    return capitalizeWords(text.replaceAll('-', ' '))
}
