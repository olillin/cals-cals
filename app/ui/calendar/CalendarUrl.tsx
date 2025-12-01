'use client'

import { useRef } from 'react'

export default function CalendarUrl({ url }: { url: string }) {
    const input = useRef<HTMLInputElement>(null)
    const copyNotice = useRef<HTMLElement>(null)

    return (
        <span className="calendar-url" id="calendar-url-section">
            <input
                ref={input}
                type="text"
                value={url}
                disabled
                aria-disabled="true"
            />
            <span ref={copyNotice} className="copy-notice">
                <span className="no-select">Copied!</span>
            </span>
            <button
                className="copy-calendar-url"
                onClick={() => {
                    if (!input.current) return

                    input.current.select()
                    input.current.setSelectionRange(0, 99999) // For mobile devices

                    navigator.clipboard.writeText(input.current.value)

                    if (copyNotice.current) {
                        copyNotice.current.classList.add('visible')
                        setTimeout(() => {
                            copyNotice.current?.classList.remove('visible')
                        }, 3000)
                    }
                }}
            ></button>
        </span>
    )
}
