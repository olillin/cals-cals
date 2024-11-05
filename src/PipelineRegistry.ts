import { Pipeline, PipelineStep } from './pipeline/Pipeline'

export type PipelineStepClass = string

export default class PipelineRegistry {
    pipelines: Array<[RegExp, Pipeline]>
    steps: Map<string, PipelineStepClass>
    constructor() {
        this.pipelines = []
        this.steps = new Map()
    }
    registerPipeline(pattern: RegExp, pipeline: Pipeline) {
        this.pipelines.push([pattern, pipeline])
    }
    registerStep(stepClass: PipelineStepClass, name?: string) {
        if (name) {
            this.steps.set(name, stepClass)
        } else {
            this.steps.set(stepClass.name, stepClass)
        }
    }
    registerSteps(...stepClasses: [PipelineStepClass]) {
        stepClasses.forEach(stepClass => {
            this.registerStep(stepClass)
        })
    }
    getStepClass(name: string): (PipelineStepClass) | undefined {
        return this.steps.get(name)
    }
    getStepName(clazz: PipelineStepClass): string | undefined {
        let entry = Object.entries(this.steps).find(e => e[1] == clazz)
        if (entry) {
            return entry[0]
        }
    }
    serializeStep(step: PipelineStep<any>, separator: string = '+'): string {
        const safeSeparator = toPercentCode(separator)
        return this.getStepName(typeof step) + separator + serializeParams(step.params).replace(separator, '%2B')
    }
    deserializeStep(serialized: string, separator: string = '+'): PipelineStep<any> {
        let [name, serializedParams] = serialized.split(separator, 1)
        let clazz = this.getStepClass(name)
        if (!clazz) {
            throw new Error('')
        }
        let params = deserializeParams(serializedParams.replace('%2B', separator))
        //@ts-ignore
        return new clazz(params)
    }
    serializePipeline(pipeline: Pipeline, separator: string = ','): string {
        let safeSeparator = toPercentCode(separator)
        return pipeline.map(step => this.serializeStep(step).replace(separator, safeSeparator)).join(separator)
    }
    deserializePipeline(serialized: string, separator: string = ','): Pipeline {
        let safeSeparator = toPercentCode(separator)
        return serialized.split(separator).map(serializedStep => {
            let step = this.deserializeStep(serializedStep.replace(safeSeparator, separator))
            return step
        })
    }
}

export function serializeParams(params: object): string {
    return JSON.stringify(params)
}
export function deserializeParams(serialized: string): object {
    return JSON.parse(serialized)
}
export function toPercentCode(char: string): string {
    return '%' + char.charCodeAt(0).toString(16)
}
export function fromPercentCode(code: string): string {
    return parseInt(code.replace('%', ''), 16).toString(10)
}
