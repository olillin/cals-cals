/**
 * @param {string} s
 * @returns {string}
 */
export function capitalize(s: string) {
    return s.substring(0, 1).toUpperCase() + s.substring(1).toLowerCase()
}

//prettier-ignore
export type KeyOfType<T, U> = NonNullable<{
   [K in keyof T]: [U] extends [T[K]] ? T[K] extends U ? K : never : never;
}[keyof T]>
