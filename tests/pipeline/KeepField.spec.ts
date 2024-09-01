import { Event } from '../../src/Calendar'
import { KeepField } from '../../src/pipeline/FieldModifications'

var event: Event
beforeEach(function () {
    event = {
        SUMMARY: 'abcdefc',
        UID: 'test-event123',
        DTSTAMP: '00000000T000000Z',
    }
})

it('No regex, match one', function () {
    let step = new KeepField({
        field: 'SUMMARY',
        query: 'c',
    })
    let processed = step.modify(event)
    expect(processed.SUMMARY === 'c')
})
it('No regex, match all', function () {
    let step = new KeepField({
        field: 'SUMMARY',
        query: 'c',
        matchAll: true,
    })
    let processed = step.modify(event)
    expect(processed.SUMMARY === 'cc')
})
it('Regex, match one', function () {
    let step = new KeepField({
        field: 'SUMMARY',
        query: '[ec]',
        useRegex: true,
    })
    let processed = step.modify(event)
    expect(processed.SUMMARY === 'c')
})
it('Regex, match all', function () {
    let step = new KeepField({
        field: 'SUMMARY',
        query: '[ec]',
        useRegex: true,
        matchAll: true,
    })
    let processed = step.modify(event)
    expect(processed.SUMMARY === 'cec')
})
it('Field does not exist', function () {
    let step = new KeepField({
        field: 'DESCRIPTION',
        query: 'c',
    })
    let processed = step.modify(event)
    expect(!processed.DESCRIPTION)
})
