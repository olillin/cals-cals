/**
* @param {string} s
* @returns {string}
*/
export function capitalize(s: string) {
   return s.substring(0, 1).toUpperCase() + s.substring(1).toLowerCase()
}
