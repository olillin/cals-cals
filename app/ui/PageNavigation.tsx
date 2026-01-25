'use client'

import Link from 'next/link'
import clsx from 'clsx'
import { usePathname } from 'next/navigation'

export default function PageNavigation() {
    const pathname = usePathname()
    return (
        <nav>
            <Link
                href={'/'}
                className={clsx({
                    selected: pathname === "/",
                })}
            >
                Calendar picker
            </Link>
            <Link
                href={'/builder'}
                className={clsx({
                    selected: pathname === "/builder",
                })}
            >
                Calendar builder
            </Link>
        </nav>
    )
}
