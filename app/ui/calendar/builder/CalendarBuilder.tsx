'use client'

import { TimeEditUrlResponse } from '@/app/lib/timeedit'
import { UrlResponse } from '@/app/lib/types'
import { useEffect, useRef, useState } from 'react'
import CalendarBuilderOutput from './CalendarBuilderOutput'

export type AdapterChoice = 'timeedit'

export default function CalendarBuilder() {
    const [chosenAdapter, setChosenAdapter] =
        useState<AdapterChoice>('timeedit')
    const [inputUrl, setInputUrl] = useState<string | null>(null)
    const [error, setError] = useState<string | null>(null)
    const [urlData, setUrlData] = useState<UrlResponse | null>(null)

    useEffect(() => {
        if (!inputUrl) return

        fetchUrl(chosenAdapter, inputUrl)
            .then(data => {
                setUrlData(data)
            })
            .catch(reason => {
                console.error(reason)
                setInputUrl(null)
                setError(String(reason).split(':')[1] ?? String(reason))
            })
    }, [inputUrl])

    const input = useRef<HTMLInputElement>(null)
    function updateInputUrl() {
        const value = input.current?.value ?? null
        if (!value || value.trim() === '') {
            setError('Please enter a URL')
        } else {
            setError(null)
            setInputUrl(value)
        }
    }

    return (
        <div>
            <span className="calendar-builder-input">
                <div>
                    <label htmlFor="calendar-builder-input-url">
                        TimeEdit Calendar URL
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
                    <CalendarBuilderOutput
                        data={urlData as TimeEditUrlResponse}
                    />
                ) : (
                    <span>Loading...</span>
                ))}
        </div>
    )
}

function fetchUrl(
    adapter: AdapterChoice,
    inputUrl: string
): Promise<UrlResponse> {
    return new Promise((resolve, reject) => {
        fetch(`/adapter/${adapter}/url?url=${inputUrl}`, {
            method: 'POST',
        }).then(response => {
            if (response.ok) {
                resolve(response.json())
                return
            }

            console.error('Failed to fetch adapter URL:')
            console.error(response)

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
