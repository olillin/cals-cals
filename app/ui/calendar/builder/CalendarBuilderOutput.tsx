'use client'

import { AvailableGroup, TimeEditUrlResponse } from '@/app/lib/timeedit'
import { useState } from 'react'
import CalendarGroups, { getGroupByOptions } from './CalendarGroups'
import CalendarUrl from '../../CalendarUrl'

export default function CalendarBuilderOutput({
    data,
}: {
    data: TimeEditUrlResponse
}) {
    const [showGrouping, setShowGrouping] = useState(false)

    const canGroup: boolean =
        !!data.extra.groups &&
        getGroupByOptions(data.extra.groups as AvailableGroup[]).length > 0

    return (
        <div id="calendar-builder-output" className="calendar-builder-output">
            {showGrouping ? (
                <CalendarGroups
                    data={data as TimeEditUrlResponse}
                    onClose={() => setShowGrouping(false)}
                />
            ) : (
                <>
                    <div id="builder-calendars" className="builder-calendars">
                        <CalendarUrl url={data.url} />
                    </div>

                    {canGroup && (
                        <button
                            id="add-group"
                            className="add-group"
                            onClick={() => {
                                setShowGrouping(true)
                            }}
                        >
                            Group events
                        </button>
                    )}
                </>
            )}
        </div>
    )
}
