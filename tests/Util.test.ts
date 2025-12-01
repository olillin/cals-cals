import { capitalize } from '../app/lib/Util'

describe('test capitalize', () => {
    test('foo -> Foo', () => {
        expect(capitalize('foo')).toBe('Foo')
    })

    test('foo bar -> Foo bar', () => {
        expect(capitalize('foo bar')).toBe('Foo bar')
    })

    test('foo-bar -> Foo-bar', () => {
        expect(capitalize('foo-bar')).toBe('Foo-bar')
    })
})
