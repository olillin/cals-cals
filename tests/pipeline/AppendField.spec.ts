import { Event } from '../../src/Calendar'
import { AppendField } from '../../src/pipeline/FieldModifications'

var event: Event
beforeEach(function () {
    event = {
        SUMMARY: 'abc',
        UID: 'test-event123',
        DTSTAMP: '00000000T000000Z',
    }
})
it('Field exists', function () {
    let step = new AppendField({
        field: "SUMMARY",
        value: "def",
    })
    let processed = step.modify(event)
    expect(processed.SUMMARY === 'abcdef')
})
it('Field does not exist', function () {
    let step = new AppendField({
        field: "DESCRIPTION",
        value: "def",
    })
    let processed = step.modify(event)
    expect(processed.DESCRIPTION === 'def')
})
