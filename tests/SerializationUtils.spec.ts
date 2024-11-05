import { serializeParams, deserializeParams, toPercentCode, fromPercentCode } from '../src/PipelineRegistry'

it('Serialize params', function() {
    const params = {
        foo: 1,
        spam: 'This is a test',
    }
    let serialized = serializeParams(params)
    let deserialized = deserializeParams(serialized)
    expect(params === deserialized)
})
it('Convert to percent code', function() {
    const char = 'B'
    let code = toPercentCode(char)
    expect(code === '%42')
})
it('Convert from percent code', function() {
    let code = '%42'
    const char = fromPercentCode(code)
    expect(char === 'B')
})
