'use client'

import Image from 'next/image'
import clsx from 'clsx'
import { useState } from 'react'
import type { Changes } from '../lib/changes'

export interface Props {
    changes: Changes
}

export default function UpdateNotice({ changes }: Props) {
    const { version, name, body } = changes

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
            // onClick={closed ? () => setClosed(false) : undefined}
        >
            <div className="notice-title">
                <strong>
                    {version} {name}
                </strong>
                <CloseButton onClick={() => setHidden(true)} />
            </div>
            <div className="notice-body">
                {body}
                <button
                    className="close-toggle"
                    onClick={() => setClosed(!closed)}
                >
                    {closed ? 'Read more' : 'Read less'}
                </button>
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
