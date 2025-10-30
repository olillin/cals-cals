import { UrlResponse } from '@/app/lib/Adapter'
import {
    AvailableGroup,
    TimeEditUrlResponse,
} from '@/app/lib/adapters/TimeEditAdapter'
import { useState } from 'react'
import CalendarGroups, { getGroupByOptions } from './CalendarGroups'

export default async function CalendarBuilderOutput({
    data,
}: {
    data: UrlResponse<any> | Promise<UrlResponse<any>>
}) {
    const [showGrouping, setShowGrouping] = useState(false)

    const awaitedData = await data

    const canGroup: boolean =
        !!awaitedData?.extra?.groups &&
        getGroupByOptions(awaitedData.extra.groups as AvailableGroup[]).length >
            0

    return (
        <div id="calendar-builder-output" className="calendar-builder-output">
            {showGrouping ? (
                <CalendarGroups data={awaitedData as TimeEditUrlResponse} />
            ) : (
                <>
                    <div
                        id="builder-calendars"
                        className="builder-calendars"
                    ></div>

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
