import Image from 'next/image'
import Link from 'next/link'
import { ReactNode } from 'react'

export default function CalendarSubscribeMenu({
    url,
    calendarName,
}: {
    url: string
    calendarName?: string
}) {
    const webcalUrl = url.replace(/^\w+:\/\//, 'webcal://')

    return (
        <div className="calendar-grid">
            <CalendarLink
                href={`https://calendar.google.com/calendar/r?cid=${encodeURIComponent(
                    webcalUrl
                )}`}
            >
                Google Calendar
            </CalendarLink>
            <CalendarLink href={webcalUrl}>Apple Calendar</CalendarLink>
            <CalendarLink
                href={`https://outlook.office.com/calendar/0/addcalendar?url=${encodeURIComponent(
                    url
                )}&name=${encodeURIComponent(calendarName ?? "Cal's cals Calendar")}`}
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
        <Link href={props.href} className="calendar-link">
            <Image
                src="/symbols/material/calendar_add_on.png"
                width={128}
                height={128}
                alt="Subscribe to calendar"
            />
            <span>{props.children}</span>
        </Link>
    )
}
