import CalendarSubscribeMenu from './CalendarSubscribeMenu'
import CalendarUrl from './CalendarUrl'

export default function CalendarCard({ url }: { url: string }) {
    return (
        <div className="calendar-card">
            <CalendarUrl url={url} />
            <CalendarSubscribeMenu url={url} />
        </div>
    )
}
