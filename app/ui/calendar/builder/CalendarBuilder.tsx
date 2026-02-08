'use client'

import { TimeEditUrlResponse } from '@/app/lib/timeedit'
import { UrlResponse } from '@/app/lib/responses'
import { useEffect, useRef, useState } from 'react'
import CalendarBuilderOutput from './CalendarBuilderOutput'

export type AdapterChoice = 'timeedit'

export default function CalendarBuilder() {
    const [inputUrl, setInputUrl] = useState<string | null>(null)
    const [addExams, setAddExams] = useState<boolean>(true)
    const [error, setError] = useState<string | null>(null)
    const [urlData, setUrlData] = useState<TimeEditUrlResponse | null>(null)

    useEffect(() => {
        if (!inputUrl) return

        const params = addExams
            ? new URLSearchParams([['addExams', '1']])
            : undefined
        fetchAdapterUrl('timeedit', inputUrl, params)
            .then(data => {
                setUrlData(data as TimeEditUrlResponse)
            })
            .catch(reason => {
                console.error(reason)
                setInputUrl(null)
                setError(String(reason).split(':')[1] ?? String(reason))
            })
    }, [inputUrl, addExams])

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
                <span className="checkbox-field">
                    <input
                        type="checkbox"
                        id="add-exams"
                        name="add-exams"
                        defaultChecked={true}
                        onChange={event => {
                            setUrlData(null)
                            setAddExams(event.target.checked)
                        }}
                    />
                    <label htmlFor="add-exams">Add exams (tentamen)</label>
                </span>
            </div>
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
                    <CalendarBuilderOutput data={urlData} />
                ) : (
                    <span>Loading...</span>
                ))}
        </div>
    )
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
