import CalendarBuilder from '@/app/ui/calendar/builder/CalendarBuilder'

export default function Page() {
    return (
        <section>
            <h2>Calendar Builder</h2>
            <p>
                Frustrated by your TimeEdit schedule being needlessly difficult
                to read? By pasting the subscription URL to your schedule below
                you can get a new URL which contains the same information but in
                a more friendly format!
            </p>

            <details>
                <summary>Where do I find the URL?</summary>
                <p>
                    Go to your TimeEdit schedule and click the "Subscribe"
                    ("Prenumerera") button near the top right of the schedule.
                    Copy the URL from the dialog that appears.
                </p>
            </details>

            <CalendarBuilder />
        </section>
    )
}
