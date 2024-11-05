import { CapitalizeField, KeepField } from '../FieldModifications'
import { Pipeline } from '../Pipeline'

const VklassPipeline: Pipeline = [
    new IncludeField({
        field: 'SUMMARY',
        query: '^[wåäöÅÄÖ -]+[wåäöÅÄÖ]',
        useRegex: true,
    }),
    new CapitalizeField({
        field: 'SUMMARY',
    }),
]
export default VklassPipeline
