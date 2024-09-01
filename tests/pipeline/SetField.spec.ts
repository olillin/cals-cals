import { Event } from '../../src/Calendar'
import { SetField } from '../../src/pipeline/FieldModifications'

var event: Event
beforeEach(function () {
    event = {
        SUMMARY: 'abc',
        UID: 'test-event123',
        DTSTAMP: '00000000T000000Z',
    }
})
it('Field exists', function () {
    let step = new SetField({
        field: "SUMMARY",
        value: "def",
    })
    let processed = step.modify(event)
    expect(processed.SUMMARY === 'def')
})
it('Field does not exist', function () {
    let step = new SetField({
        field: "DESCRIPTION",
        value: "def",
    })
    let processed = step.modify(event)
    expect(processed.DESCRIPTION === 'def')
})
it('Delete field', function () {
    let step = new SetField<string | undefined>({
        field: "DESCRIPTION",
        value: undefined,
    })
    let processed = step.modify(event)
    expect(!processed.DESCRIPTION)
})
