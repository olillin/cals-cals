import { Event } from '../../src/Calendar'
import { ReplaceField } from '../../src/pipeline/FieldModifications'

var event: Event
beforeEach(function () {
    event = {
        SUMMARY: 'abcdefc',
        UID: 'test-event123',
        DTSTAMP: '00000000T000000Z',
    }
})

it('No regex, match one', function () {
    let step = new ReplaceField({
        field: 'SUMMARY',
        query: 'c',
        value: 'h',
    })
    let processed = step.modify(event)
    expect(processed.SUMMARY === 'abhdefc')
})
it('No regex, match all', function () {
    let step = new ReplaceField({
        field: 'SUMMARY',
        query: 'c',
        value: 'h',
        matchAll: true,
    })
    let processed = step.modify(event)
    expect(processed.SUMMARY === 'abhdefh')
})
it('Regex, match one', function () {
    let step = new ReplaceField({
        field: 'SUMMARY',
        query: '[ec]',
        value: 'h',
        useRegex: true,
    })
    let processed = step.modify(event)
    expect(processed.SUMMARY === 'abhdefc')
})
it('Regex, match all', function () {
    let step = new ReplaceField({
        field: 'SUMMARY',
        query: '[ec]',
        value: 'h',
        useRegex: true,
        matchAll: true,
    })
    let processed = step.modify(event)
    expect(processed.SUMMARY === 'abhdhfh')
})
it('Field does not exist', function () {
    let step = new ReplaceField({
        field: 'DESCRIPTION',
        query: 'c',
        value: 'h',
    })
    let processed = step.modify(event)
    expect(!processed.DESCRIPTION)
})
