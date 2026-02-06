import { capitalize } from '../../../app/lib/util'
import { it, expect } from 'vitest'

it('converts foo -> Foo', () => {
    expect(capitalize('foo')).toBe('Foo')
})

it('converts foo bar -> Foo bar', () => {
    expect(capitalize('foo bar')).toBe('Foo bar')
})

it('converts foo-bar -> Foo-bar', () => {
    expect(capitalize('foo-bar')).toBe('Foo-bar')
})
