import { AdapterOptions } from '../AdapterBuilder'

interface Props {
    options: AdapterOptions<'canvas'>
    setOptions: (options: AdapterOptions<'canvas'>) => void
}

export default function CanvasOptions({ options, setOptions }: Props) {
    return (
        <>
            <span className="checkbox-field">
                <input
                    type="checkbox"
                    name="rich-format"
                    id="rich-format"
                    defaultChecked={!options.plainText}
                    onChange={event => {
                        setOptions({
                            ...options,
                            plainText: !event.target.checked,
                        })
                    }}
                />
                <label htmlFor="rich-format">Rich formatting</label>
            </span>
        </>
    )
}
