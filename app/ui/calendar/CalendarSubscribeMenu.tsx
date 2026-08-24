import Image from 'next/image'
import { ReactNode } from 'react'

export default function CalendarSubscribeMenu({ url }: { url: string }) {
    return (
        <div className="calendar-grid">
            <CalendarLink
                href={`https://calendar.google.com/calendar/r?cid=${encodeURIComponent(
                    url
                )}`}
            >
                Google Calendar
            </CalendarLink>
            <CalendarLink href={url.replace(/^\w+:\/\//, 'webcal://')}>
                Apple Calendar
            </CalendarLink>
            <CalendarLink
                href={`https://outlook.office.com/owa/?path=/calendar/action/compose&rru=addsubscription&url=${encodeURIComponent(
                    url
                )}`}
            >
                Outlook
            </CalendarLink>
        </div>
    )
}

interface CalendarLinkProps {
    href: string
    children?: ReactNode
}

const CalendarLink = (props: CalendarLinkProps) => {
    return (
        <a href={props.href} className="calendar-link">
            <Image
                src="/symbols/material/calendar_add_on.png"
                width={128}
                height={128}
                alt="Subscribe to calendar"
            />
            <span>{props.children}</span>
        </a>
    )
}
