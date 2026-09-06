'use client'

import { UrlResponse } from '@/app/lib/responses'
import { useEffect, useRef, useState } from 'react'
import AdapterBuilderOutput from './AdapterBuilderOutput'
import TimeEditOptions from './options/TimeEditOptions'
import CanvasOptions from './options/CanvasOptions'
import { GroupedUrlResponseOfAdapter } from '@/app/lib/group'

export type AdapterOptionsMap = {
    timeedit: {
        noExam: boolean
        keepGlobal: boolean
        hideGu: boolean
    }
    canvas: {
        plainText: boolean
    }
}
export type AdapterChoice = keyof AdapterOptionsMap
export type AdapterOptions<T extends AdapterChoice> = AdapterOptionsMap[T]

function createDefaultOptions<T extends AdapterChoice>(
    adapter: T
): AdapterOptions<T> {
    const defaults: AdapterOptionsMap = {
        timeedit: {
            noExam: false,
            keepGlobal: false,
            hideGu: false,
        },
        canvas: {
            plainText: false,
        },
    }
    return defaults[adapter]
}

export default function AdapterBuilder<T extends AdapterChoice>({
    adapter,
}: {
    adapter: T
}) {
    const [inputUrl, setInputUrl] = useState<string | null>(null)
    const [adapterOptions, setAdapterOptions] = useState<AdapterOptions<T>>(
        createDefaultOptions(adapter)
    )
    const [error, setError] = useState<string | null>(null)
    const [urlData, setUrlData] =
        useState<GroupedUrlResponseOfAdapter<T> | null>(null)

    useEffect(() => {
        if (!inputUrl) return

        const params = createSearchParamsFromOptions(adapterOptions)

        fetchAdapterUrl(adapter, inputUrl, params.size > 0 ? params : undefined)
            .then(data => {
                setUrlData(data as GroupedUrlResponseOfAdapter<T>)
            })
            .catch(reason => {
                console.error(reason)
                setInputUrl(null)
                setError(String(reason).split(':')[1] ?? String(reason))
            })
    }, [adapter, inputUrl, adapterOptions])

    const input = useRef<HTMLInputElement>(null)
    function updateInputUrl() {
        const value = input.current?.value ?? null
        if (!value || value.trim() === '') {
            setError('Please enter a URL')
        } else {
            setUrlData(null)
            setError(null)
            setInputUrl(value)
        }
    }

    return (
        <div>
            <div className="calendar-builder-options">
                <h3>Options</h3>
                {adapter === 'timeedit' ? (
                    <TimeEditOptions
                        options={adapterOptions as AdapterOptions<'timeedit'>}
                        setOptions={options => {
                            setAdapterOptions(options as AdapterOptions<T>)
                            setUrlData(null)
                        }}
                    />
                ) : (
                    <CanvasOptions
                        options={adapterOptions as AdapterOptions<'canvas'>}
                        setOptions={options => {
                            setAdapterOptions(options as AdapterOptions<T>)
                            setUrlData(null)
                        }}
                    />
                )}
            </div>
            <span className="calendar-builder-input">
                <div>
                    <label htmlFor="calendar-builder-input-url">
                        {formatAdapterName(adapter)} Calendar URL
                    </label>
                    <input
                        ref={input}
                        type="text"
                        name="calendar-builder-input-url"
                        id="calendar-builder-input-url"
                        onKeyDown={event => {
                            if (event.key === 'Enter') {
                                event.preventDefault()
                                updateInputUrl()
                            }
                        }}
                    ></input>
                </div>
                <button type="button" onClick={updateInputUrl}>
                    Convert URL
                </button>
            </span>

            {error && (
                <span id="calendar-builder-error" className="error">
                    {error}
                </span>
            )}

            {inputUrl &&
                (urlData ? (
                    <AdapterBuilderOutput data={urlData} />
                ) : (
                    <span>Loading...</span>
                ))}
        </div>
    )
}

function isTimeEditOptions(
    options: AdapterOptions<AdapterChoice>
): options is AdapterOptions<'timeedit'> {
    return (
        Object.hasOwn(options, 'noExam') &&
        Object.hasOwn(options, 'keepGlobal') &&
        Object.hasOwn(options, 'hideGu')
    )
}

function createSearchParamsFromOptions(
    options: AdapterOptions<AdapterChoice>
): URLSearchParams {
    if (isTimeEditOptions(options)) {
        // TimeEdit options
        return new URLSearchParams(
            [
                options.noExam == true ? ['noExam', '1'] : undefined,
                options.keepGlobal == true ? ['keepGlobal', '1'] : undefined,
                options.hideGu == true ? ['hideGu', '1'] : undefined,
            ].filter(entry => entry != undefined)
        )
    } else {
        // Canvas options
        return new URLSearchParams(
            [options.plainText == true ? ['plain', '1'] : undefined].filter(
                entry => entry != undefined
            )
        )
    }
}

function fetchAdapterUrl(
    adapter: AdapterChoice,
    inputUrl: string,
    params?: URLSearchParams
): Promise<UrlResponse> {
    return new Promise((resolve, reject) => {
        const searchParams = new URLSearchParams(params)
        searchParams.set('url', inputUrl)

        fetch(`/adapter/${adapter}/url?${searchParams.toString()}`, {
            method: 'POST',
        }).then(response => {
            if (response.ok) {
                resolve(response.json())
                return
            }

            console.error('Failed to fetch adapter URL:\n', response)

            return response
                .json()
                .catch(reason => {
                    console.error(`Failed to parse JSON: ${reason}`)
                    return {
                        error: { message: 'An unknown error occurred.' },
                    }
                })
                .then(data => {
                    const message = data.error.message as string
                    reject(message)
                })
        })
    })
}

function formatAdapterName(adapter: AdapterChoice): string {
    const map: Record<AdapterChoice, string> = {
        timeedit: 'TimeEdit',
        canvas: 'Canvas',
    }
    return map[adapter]
}
