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

export function toCamelCase(text: string): string {
    const words = text.split(' ')
    return (
        words[0].charAt(0).toLowerCase() +
        words[0].slice(1) +
        words
            .slice(1)
            .map(
                word =>
                    word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
            )
            .join('')
    )
}

export function fromCamelCase(text: string): string {
    if (text.length <= 1) return text.toUpperCase()
    const words = text.split(/(?=[A-Z])/g).map((word, i) => {
        if (i === 0) {
            return word.charAt(0).toUpperCase() + word.substring(1)
        } else {
            return word.toLowerCase()
        }
    })

    return words.join(' ')
}
