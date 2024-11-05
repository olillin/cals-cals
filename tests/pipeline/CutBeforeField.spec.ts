import { Event } from '../../src/Calendar'
import { CutBeforeField } from '../../src/pipeline/FieldModifications'

var event: Event
beforeEach(function () {
    event = {
        SUMMARY: 'ab?def',
        UID: 'test-event123',
        DTSTAMP: '00000000T000000Z',
    }
})
it('No regex', function() {
    let step = new CutBeforeField({
        field: 'SUMMARY',
        query: '?',
    })
    let processed = step.modify(event)
    expect(processed.SUMMARY === '?def')
})
it('No regex, cut query', function() {
    let step = new CutBeforeField({
        field: 'SUMMARY',
        query: '?',
        cutQuery: true,
    })
    let processed = step.modify(event)
    expect(processed.SUMMARY === 'def')
})
it('Regex', function() {
    let step = new CutBeforeField({
        field: 'SUMMARY',
        query: '[de]',
        useRegex: true,
    })
    let processed = step.modify(event)
    expect(processed.SUMMARY === 'def')
})
it('Regex, cut query', function() {
    let step = new CutBeforeField({
        field: 'SUMMARY',
        query: '[de]',
        useRegex: true,
        cutQuery: true,
    })
    let processed = step.modify(event)
    expect(processed.SUMMARY === 'ef')
})
it('Query does not exist', function() {
    let step = new CutBeforeField({
        field: 'SUMMARY',
        query: 'c',
    })
    let processed = step.modify(event)
    expect(processed.SUMMARY === event.SUMMARY)
})
it('Field does not exist', function() {
    let step = new CutBeforeField({
        field: 'DESCRIPTION',
        query: '?',
    })
    let processed = step.modify(event)
    expect(processed.DESCRIPTION === undefined)
})
