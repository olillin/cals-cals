import { AdapterOptions } from '../AdapterBuilder'

interface Props {
    options: AdapterOptions<'timeedit'>
    setOptions: (options: AdapterOptions<'timeedit'>) => void
}

export default function TimeEditOptions({ options, setOptions }: Props) {
    return (
        <>
            <span className="checkbox-field">
                <input
                    type="checkbox"
                    name="add-exams"
                    id="add-exams"
                    defaultChecked={!options.noExam}
                    onChange={event => {
                        setOptions({
                            ...options,
                            noExam: !event.target.checked,
                        })
                    }}
                />
                <label htmlFor="add-exams">Add exams (tentamen)</label>
            </span>
            <span className="checkbox-field">
                <input
                    type="checkbox"
                    name="keep-global"
                    id="keep-global"
                    defaultChecked={false}
                    onChange={event => {
                        setOptions({
                            ...options,
                            keepGlobal: event.target.checked,
                        })
                    }}
                />
                <label htmlFor="keep-global">Keep global events</label>
            </span>
            <span className="checkbox-field">
                <input
                    type="checkbox"
                    name="hide-gu"
                    id="hide-gu"
                    defaultChecked={true}
                    onChange={event => {
                        setOptions({
                            ...options,
                            hideGu: event.target.checked,
                        })
                    }}
                />
                <label htmlFor="hide-gu">Hide GU course codes</label>
            </span>
        </>
    )
}
