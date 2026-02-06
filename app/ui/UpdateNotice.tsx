'use client'

import { useState } from 'react'

export default function UpdateNotice() {
    const title = 'Update v2.0 is here!'
    const body =
        "Cal's cals has been rewritten using Next.js finally ending the feature freeze. Expect new exciting features soon!"

    const [hidden, setHidden] = useState(false)

    if (hidden) {
        return null
    }

    return (
        <details className="update-notice">
            <summary>
                {title}{' '}
                <button className="hideButton" onClick={() => setHidden(true)}>
                    ×
                </button>
            </summary>
            <p>{body}</p>
        </details>
    )
}
