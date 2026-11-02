import { urlencodeChar } from '@/app/lib/util'
import { it, expect } from 'vitest'

it('converts ! -> %21', () => {
    const char = '!'
    const encoded = urlencodeChar(char)
    expect(encoded).toBe('%21')
    expect(decodeURIComponent(encoded)).toBe(char)
})

it('converts . -> %2E', () => {
    const char = '.'
    const encoded = urlencodeChar(char)
    expect(encoded).toBe('%2E')
    expect(decodeURIComponent(encoded)).toBe(char)
})

it('converts : -> %3A', () => {
    const char = ':'
    const encoded = urlencodeChar(char)
    expect(encoded).toBe('%3A')
    expect(decodeURIComponent(encoded)).toBe(char)
})

it('converts A -> %41', () => {
    const char = 'A'
    const encoded = urlencodeChar(char)
    expect(encoded).toBe('%41')
    expect(decodeURIComponent(encoded)).toBe(char)
})

it('throws for multibyte characters', () => {
    const char = '€'
    expect(() => {
        urlencodeChar(char)
    }).toThrow()
})
