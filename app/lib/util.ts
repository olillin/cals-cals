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
 * Convert a kebab-case string into capitalized words.
 * @param text The kebab-case string.
 * @returns The same string with capitalized words and spaces instead of hyphens.
 */
export function formatKebabCase(text: string): string {
    return capitalizeWords(text.replaceAll('-', ' '))
}

/**
 * Check if a key is one that should be used for clicking.
 * @param key The key to check.
 * @returns True if the key is Enter or Space.
 */
export function isClickKey(key: string): boolean {
    const clickKeys: string[] = ['Space', 'Enter']
    return clickKeys.includes(key)
}

/**
 * Add a suffix to a string if missing.
 * @param s The string which may already have the suffix.
 * @param suffix The suffix which will be appended to the end of `s` if missing.
 * @returns The string, ending with suffix.
 */
export function withSuffix(s: string, suffix: string): string {
    return s.endsWith(suffix) ? s : s + suffix
}

/**
 * URL encode a character, regardless if it is special or not.
 * @param char The character to encode.
 * @returns The encoded character including the percent sign.
 * @throws If the character is a multi-byte character.
 */
export function urlencodeChar(char: string): string {
    const hex = char.charCodeAt(0).toString(16).toUpperCase()
    if (hex.length > 2) {
        throw new Error(`Cannot encode multi-byte character '${char}'`)
    }
    return '%' + hex
}
