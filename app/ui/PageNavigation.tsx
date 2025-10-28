import Link from 'next/link'

export default function PageNavivgation() {
    return (
        <nav>
            <Link href={'/picker'}>Calendar picker</Link>
            <Link href={'/builder'}>Calendar builder</Link>
        </nav>
    )
}
