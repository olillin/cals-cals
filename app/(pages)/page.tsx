import { Suspense } from 'react'
import CalendarPicker from '@/app/ui/CalendarPicker'
import { CalendarTreeSkeleton } from '@/app/ui/skeletons'

export default async function Page() {
    return (
        <section className="calendar-picker">
            <h2>Calendar Picker</h2>
            <p>
                Here you can select which calendars you want to include in your
                custom calendar feed. The URL you get at the bottom will
                automatically update as you select and deselect calendars. You
                can then use this URL to subscribe to your custom calendar feed
                in your calendar application of choice.
            </p>

            <Suspense fallback={<CalendarTreeSkeleton />}>
                <CalendarPicker />
            </Suspense>
        </section>
    )
}
