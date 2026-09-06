import AdapterBuilder from '@/app/ui/calendar/builder/AdapterBuilder'
import Link from 'next/link'

export default function Page() {
    return (
        <section>
            <h2>Canvas Adapter</h2>
            <p>
                Make your Canvas calendar better! By pasting the subscription
                URL to your calendar below you can get a new URL with rich
                formatting and a convenient link right to the assignment!
            </p>

            <details>
                <summary>Where do I find the URL?</summary>
                <p>
                    Go to the{' '}
                    <Link href="https://canvas.chalmers.se/calendar">
                        Canvas calendar
                    </Link>{' '}
                    and click the &quot;Calendar Feed&quot;
                    (&quot;Kalenderflöde&quot;) button near the bottom right of
                    the page. Copy the URL from the dialog that appears.
                </p>
            </details>

            <AdapterBuilder adapter="canvas" />
        </section>
    )
}
