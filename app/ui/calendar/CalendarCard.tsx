import CalendarSubscribeMenu from './CalendarSubscribeMenu'
import CalendarUrl from './CalendarUrl'

export default function CalendarCard({
    url,
    calendarName,
}: {
    url: string
    calendarName?: string
}) {
    return (
        <div className="calendar-card">
            <CalendarUrl url={url} />
            <CalendarSubscribeMenu url={url} calendarName={calendarName} />
        </div>
    )
}
