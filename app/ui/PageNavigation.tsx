'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ReactNode } from 'react'

export default function PageNavigation() {
    return (
        <nav>
            <NavigationLink href={'/'}>Calendar picker</NavigationLink>
            <NavigationLink href={'/timeedit'}>TimeEdit Adapter</NavigationLink>
            <NavigationLink href={'/canvas'}>Canvas Adapter</NavigationLink>
        </nav>
    )
}

function NavigationLink({
    href,
    children,
}: {
    href: string
    children: ReactNode
}) {
    const pathname = usePathname()
    const selected: boolean = pathname === href
    return selected ? (
        <span className="selected">{children}</span>
    ) : (
        <Link href={href}>{children}</Link>
    )
}
