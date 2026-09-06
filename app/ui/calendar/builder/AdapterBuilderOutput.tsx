import { AvailableGroup, GroupedUrlResponse } from '@/app/lib/group'
import { useState } from 'react'
import AdapterGroups, { getGroupByOptions } from './AdapterGroups'
import CalendarCard from '../CalendarCard'

export default function AdapterBuilderOutput<T extends string>({
    data,
}: {
    data: GroupedUrlResponse<T>
}) {
    const [showGrouping, setShowGrouping] = useState(false)

    const hasGroups =
        getGroupByOptions(data.extra.groups as AvailableGroup<T>[]).length > 0
    const canGroup: boolean = !!data.extra.groups && hasGroups

    return (
        <div id="calendar-builder-output" className="calendar-builder-output">
            {showGrouping ? (
                <AdapterGroups
                    data={data as GroupedUrlResponse<T>}
                    onClose={() => setShowGrouping(false)}
                />
            ) : (
                <>
                    <div id="builder-calendars" className="builder-calendars">
                        <CalendarCard
                            url={data.url}
                            calendarName={data.extra.name}
                        />
                    </div>

                    {canGroup ? (
                        <button
                            id="add-group"
                            className="add-group"
                            onClick={() => {
                                setShowGrouping(true)
                            }}
                        >
                            Group events
                        </button>
                    ) : (
                        <p style={{ textAlign: 'center' }}>
                            This calendar cannot be grouped. All events have the
                            same properties.
                        </p>
                    )}
                </>
            )}
        </div>
    )
}
