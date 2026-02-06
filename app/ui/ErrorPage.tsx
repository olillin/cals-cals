import { ReactNode } from 'react'

export default function ErrorPage({ children }: { children: ReactNode }) {
    return (
        <div>
            <span className="error">{children}</span>
        </div>
    )
}
