import { Event } from '../../src/Calendar'
import { CutBeforeField } from '../../src/pipeline/FieldModifications'

var event: Event
beforeEach(function () {
    event = {
        SUMMARY: 'abcdef',
        UID: 'test-event123',
        DTSTAMP: '00000000T000000Z',
    }
})
it('No regex', function() {
    let step = new CutBeforeField({
        field: 'SUMMARY',
        query: 'c',
    })
    let processed = step.modify(event)
    expect(processed.SUMMARY === 'cdef')
})
it('No regex, cut query', function() {
    let step = new CutBeforeField({
        field: 'SUMMARY',
        query: 'c',
        cutQuery: true,
    })
    let processed = step.modify(event)
    expect(processed.SUMMARY === 'def')
})
it('Regex', function() {
    let step = new CutBeforeField({
        field: 'SUMMARY',
        query: '[dc]',
    })
    let processed = step.modify(event)
    expect(processed.SUMMARY === 'cdef')
})
it('Regex, cut query', function() {
    let step = new CutBeforeField({
        field: 'SUMMARY',
        query: '[dc]',
        cutQuery: true,
    })
    let processed = step.modify(event)
    expect(processed.SUMMARY === 'def')
})
it('Field does not exist', function() {
    let step = new CutBeforeField({
        field: 'DESCRIPTION',
        query: 'c',
    })
    let processed = step.modify(event)
    expect(processed.DESCRIPTION === undefined)
})