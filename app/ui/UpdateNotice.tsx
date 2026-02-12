'use client'

import Image from 'next/image'
import clsx from 'clsx'
import { ReactNode, useState } from 'react'

export default function UpdateNotice() {
    const title: string = 'Update v2.0 is here!'
    const body: ReactNode = (
        <>
            <p>
                Cal&apos;s cals has been rewritten using Next.js, finally ending
                the long feature freeze. Expect new exciting features soon!
            </p>
            <strong>v2.0.2</strong>
            <p>
                The TimeEdit adapter has been fixed after TimeEdit changed their
                calendar format again. Sorry for the inconvenience.
            </p>
        </>
    )
    const [closed, setClosed] = useState(true)
    const [hidden, setHidden] = useState(false)

    if (hidden) {
        return null
    }

    return (
        <div
            className={clsx('update-notice', {
                closed: closed,
            })}
            onClick={() => setClosed(false)}
        >
            <div className="notice-title">
                <strong>{title} </strong>
                <CloseButton onClick={() => setHidden(true)} />
            </div>
            <div className="notice-body">
                {body}
                {closed && <span className="read-more">Read more</span>}
            </div>
        </div>
    )
}

function CloseButton({ onClick }: { onClick: () => void }) {
    return (
        <span
            className="close-button-container"
            onClick={event => {
                event.stopPropagation()
            }}
        >
            <button className="close-button" onClick={onClick}>
                <Image
                    alt=""
                    src="/symbols/close.png"
                    sizes="1em"
                    style={{
                        width: '1em',
                        height: 'auto',
                    }}
                    width={16}
                    height={16}
                />
            </button>
        </span>
    )
}
