import { Event } from '../../src/Calendar'
import { CapitalizeField } from '../../src/pipeline/FieldModifications'

var event: Event
beforeEach(function () {
    event = {
        SUMMARY: 'abc',
        UID: 'test-event123',
        DTSTAMP: '00000000T000000Z',
    }
})
it('All lowercase', function () {
    event.SUMMARY = 'abc'
    let step = new CapitalizeField({
        field: 'SUMMARY',
    })
    let processed = step.modify(event)
    expect(processed.SUMMARY === 'Abc')
})
it('All uppercase', function () {
    event.SUMMARY = 'ABC'
    let step = new CapitalizeField({
        field: 'SUMMARY',
    })
    let processed = step.modify(event)
    expect(processed.SUMMARY === 'Abc')
})
it('Field does not exist', function () {
    let step = new CapitalizeField({
        field: 'DESCRIPTION',
    })
    let processed = step.modify(event)
    expect(processed.DESCRIPTION === undefined)
})
