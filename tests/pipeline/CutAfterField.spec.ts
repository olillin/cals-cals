import { Event } from '../../src/Calendar'
import { CutAfterField } from '../../src/pipeline/FieldModifications'

var event: Event
beforeEach(function () {
    event = {
        SUMMARY: 'abcdef',
        UID: 'test-event123',
        DTSTAMP: '00000000T000000Z',
    }
})
it('No regex', function() {
    let step = new CutAfterField({
        field: 'SUMMARY',
        query: 'c',
    })
    let processed = step.modify(event)
    expect(processed.SUMMARY === 'abc')
})
it('No regex, cut query', function() {
    let step = new CutAfterField({
        field: 'SUMMARY',
        query: 'c',
        cutQuery: true,
    })
    let processed = step.modify(event)
    expect(processed.SUMMARY === 'ab')
})
it('Regex', function() {
    let step = new CutAfterField({
        field: 'SUMMARY',
        query: '[dc]',
    })
    let processed = step.modify(event)
    expect(processed.SUMMARY === 'abc')
})
it('Regex, cut query', function() {
    let step = new CutAfterField({
        field: 'SUMMARY',
        query: '[dc]',
        cutQuery: true,
    })
    let processed = step.modify(event)
    expect(processed.SUMMARY === 'ab')
})
it('Field does not exist', function() {
    let step = new CutAfterField({
        field: 'DESCRIPTION',
        query: 'c',
    })
    let processed = step.modify(event)
    expect(processed.DESCRIPTION === undefined)
})