import { Event } from '../../src/Calendar'
import { CutAfterField } from '../../src/pipeline/FieldModifications'

var event: Event
beforeEach(function () {
    event = {
        SUMMARY: 'ab?def',
        UID: 'test-event123',
        DTSTAMP: '00000000T000000Z',
    }
})
it('No regex', function() {
    let step = new CutAfterField({
        field: 'SUMMARY',
        query: '?',
    })
    let processed = step.modify(event)
    expect(processed.SUMMARY === 'ab?')
})
it('No regex, cut query', function() {
    let step = new CutAfterField({
        field: 'SUMMARY',
        query: '?',
        cutQuery: true,
    })
    let processed = step.modify(event)
    expect(processed.SUMMARY === 'ab')
})
it('Regex', function() {
    let step = new CutAfterField({
        field: 'SUMMARY',
        query: '[de]',
        useRegex: true,
    })
    let processed = step.modify(event)
    expect(processed.SUMMARY === 'abcd')
})
it('Regex, cut query', function() {
    let step = new CutAfterField({
        field: 'SUMMARY',
        query: '[de]',
        useRegex: true,
        cutQuery: true,
    })
    let processed = step.modify(event)
    expect(processed.SUMMARY === 'abc')
})
it('Query does not exist', function() {
    let step = new CutAfterField({
        field: 'SUMMARY',
        query: 'c',
    })
    let processed = step.modify(event)
    expect(processed.SUMMARY === event.SUMMARY)
})
it('Field does not exist', function() {
    let step = new CutAfterField({
        field: 'DESCRIPTION',
        query: '?',
    })
    let processed = step.modify(event)
    expect(processed.DESCRIPTION === undefined)
})
