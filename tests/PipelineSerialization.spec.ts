import { Event } from '../src/Calendar'
import { SetField } from '../src/pipeline/FieldModifications'
import PipelineRegistry from '../src/PipelineRegistry'

var event: Event
var registry: PipelineRegistry
beforeEach(function () {
    event = {
        SUMMARY: 'abc',
        UID: 'test-event123',
        DTSTAMP: '00000000T000000Z',
    }
    registry = new PipelineRegistry()
    registry.registerStep(SetField)
})
it('Serialize step', function () {
    let step = new SetField({
        field: "SUMMARY",
        value: "def",
    })
    let processed = step.modify(event)
    let serialized = registry.serializeStep(step)
    let deserialized = registry.deserializeStep(serialized) as SetField<string>
    let deserializedProcessed = deserialized.modify(event)
    expect(processed === deserializedProcessed)
})