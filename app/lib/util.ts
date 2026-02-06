import path from 'path'

/**
 * Capitalize a string.
 * @param text The string to capitalize.
 * @returns The string with the first letter in uppercase and the rest in lowercase.
 */
export function capitalize(text: string): string {
    return text.substring(0, 1).toUpperCase() + text.substring(1).toLowerCase()
}

/**
 * Capitalize every word in a string.
 * @param text The string to capitalize.
 * @returns The string with the first letter of every word in uppercase and the rest in lowercase.
 */
export function capitalizeWords(text: string): string {
    return text
        .split(' ')
        .map(word => capitalize(word))
        .join(' ')
}

/**
 * Convert a calendar name to a safe filename ensuring no directory traversal.
 * @param calendarName The calendar name, does not need the file extension.
 * @returns The safe calendar filename.
 */
export function getSafeFilename(calendarName: string): string {
    return (
        path.basename(calendarName) +
        (calendarName.endsWith('.ics') ? '' : '.ics')
    )
}

/**
 * Convert a kebab-case string into capitalized words.
 * @param text The kebab-case string.
 * @returns The same string with capitalized words and spaces instead of hyphens.
 */
export function formatKebabCase(text: string): string {
    return capitalizeWords(text.replaceAll('-', ' '))
}
