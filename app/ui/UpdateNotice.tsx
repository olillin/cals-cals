'use client'

import Image from 'next/image'
import clsx from 'clsx'
import { ReactNode, useState } from 'react'
import Link from 'next/link'

export default function UpdateNotice() {
    const title: string = 'Hello tentavecka!'
    const body: ReactNode = (
        <>
            <p>
                Just in time for the exams, v2.1 is here with a new feature! The
                calendar builder is now able to add events for the exams of your
                subscribed courses. These events are treated like any other so
                all of you who use calendar groups can highlight your exams in
                the brightest colours so you won&apos;t miss them. Internally
                this uses my library{' '}
                <Link
                    href="https://github.com/olillin/chalmers-search-exam"
                    target="_blank"
                >
                    chalmers-search-exam
                </Link>
                , which is also available as a CLI if that&apos;s something you
                want.
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
