import { capitalize } from '../Util'
import { FieldModification, FieldModificationParams } from './Pipeline'

export interface TextMatchParams extends FieldModificationParams<string> {
    query: string
    useRegex?: boolean
}
export interface TextMatchAllParams extends FieldModificationParams<string> {
    query: string
    useRegex?: boolean
    matchAll?: boolean
}

export interface ReplaceFieldParams extends TextMatchAllParams {
    value: string
}
/** Remove the matched string from the field. */
export class ReplaceField extends FieldModification<ReplaceFieldParams, string | undefined> {
    params: ReplaceFieldParams
    constructor(params: ReplaceFieldParams) {
        super()
        this.params = params
    }
    modifyField(text: string | undefined): string | undefined {
        if (text === undefined) {
            return undefined
        }
        const query = this.params.useRegex ? RegExp(this.params.query) : this.params.query
        if (this.params.matchAll) {
            return text.replaceAll(this.params.query, this.params.value)
        } else {
            return text.replace(this.params.query, this.params.value)
        }
    }
}

/** Remove all but the matched string from the field. */
export class KeepField extends FieldModification<TextMatchAllParams, string | undefined> {
    params: TextMatchAllParams
    constructor(params: TextMatchAllParams) {
        super()
        this.params = params
    }
    modifyField(text: string | undefined): string | undefined {
        if (text === undefined) {
            return undefined
        }
        if (this.params.useRegex) {
            if (this.params.matchAll) {
                const query = RegExp(this.params.query, 'g')
                const matches = text.match(query)
                const result = matches?.join('') ?? ''
                return result
            } else {
                const query = RegExp(this.params.query)
                const match = text.match(query)
                return match ? match[0] : ''
            }
        } else {
            const query = this.params.query
            if (this.params.matchAll) {
                let remainder = text
                let result = ''
                while (remainder.length > 0) {
                    let index = remainder.search(query)
                    if (index == -1) {
                        remainder = ''
                    } else {
                        let endIndex = index + query.length
                        result += remainder.substring(index, endIndex)
                        remainder = remainder.substring(endIndex)
                    }
                }
                return result
            } else {
                const index = text.search(query)
                if (index == -1) {
                    return ''
                } else {
                    return text.substring(index, index + query.length)
                }
            }
        }
    }
}

/** Remove all but the matched string from the field. */
export class CapitalizeField extends FieldModification<FieldModificationParams<string | undefined>, string | undefined> {
    params: FieldModificationParams<string | undefined>
    constructor(params: FieldModificationParams<string | undefined>) {
        super()
        this.params = params
    }
    modifyField(text: string | undefined): string | undefined {
        if (text === undefined) {
            return undefined
        }
        return capitalize(text)
    }
}

export interface CutParams extends TextMatchParams {
    cutQuery?: boolean,
}
export class CutBeforeField extends FieldModification<CutParams, string | undefined> {
    params: CutParams
    constructor(params: CutParams) {
        super()
        this.params = params
    }
    modifyField(text: string | undefined): string | undefined {
        if (text === undefined) {
            return undefined
        }
        const query: RegExp | string = this.params.useRegex ? RegExp(this.params.query) : this.params.query
        const index = text.search(query)
        return text.substring(0, index)
    }
}

export class CutAfterField extends FieldModification<CutParams, string | undefined> {
    params: CutParams
    constructor(params: CutParams) {
        super()
        this.params = params
    }

    modifyField(text: string | undefined): string | undefined {
        if (text === undefined) {
            return undefined
        }
        const query: RegExp | string = this.params.useRegex ? RegExp(this.params.query) : this.params.query
        const index = text.search(query)
        return text.substring(index)
    }
}

export interface ConstantValueFieldParams<T> extends FieldModificationParams<T> {
    value: T
}
export class SetField<T> extends FieldModification<ConstantValueFieldParams<T>, T> {
    params: ConstantValueFieldParams<T>
    constructor(params: ConstantValueFieldParams<T>) {
        super()
        this.params = params
    }

    modifyField(text: T): T {
        return this.params.value
    }
}

export class AppendField extends FieldModification<ConstantValueFieldParams<string>, string> {
    params: ConstantValueFieldParams<string>
    constructor(params: ConstantValueFieldParams<string>) {
        super()
        this.params = params
    }

    modifyField(text: string): string {
        return text + this.params.value
    }
}

export class PrependField extends FieldModification<ConstantValueFieldParams<string>, string> {
    params: ConstantValueFieldParams<string>
    constructor(params: ConstantValueFieldParams<string>) {
        super()
        this.params = params
    }

    modifyField(text: string): string {
        return this.params.value + text
    }
}
