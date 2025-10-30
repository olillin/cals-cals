import {
    AvailableGroup,
    GroupByOption,
    groupByOptions,
    TimeEditUrlResponse,
} from '@/app/lib/adapters/TimeEditAdapter'
import clsx from 'clsx'
import { useEffect, useState } from 'react'
import CalendarUrl from '../../CalendarUrl'

export default function CalendarGroups({
    data,
}: {
    data: TimeEditUrlResponse
}) {
    const [groupBy, setGroupBy] = useState<GroupByOption>(
        getGroupByOptions(data.extra.groups)[0]
    )
    const [groups, setGroups] = useState<BuilderGroup[]>([])

    useEffect(() => {
        setGroups([])
    }, [groupBy])

    if (groups.length === 0) {
        const initialGroups: BuilderGroup[] = [
            {
                includedValues: data.extra.groups.find(
                    availableGroup => availableGroup.property === groupBy
                )!.values,
            },
        ]
        setGroups(initialGroups)
    }

    return (
        <>
            {groups.map((group, i) => (
                <CalendarGroupContainer
                    groups={groups}
                    groupIndex={i}
                    baseUrl={data.url}
                    groupBy={groupByOptions.indexOf(groupBy)}
                />
            ))}

            <button
                id="add-group"
                className="add-group"
                onClick={() => {
                    // TODO: Add new group
                }}
            >
                Add group
            </button>
        </>
    )
}

export function GroupBySelector({
    options,
    currentGroupBy,
    setGroupBy,
}: {
    options: GroupByOption[]
    currentGroupBy: number
    setGroupBy: (groupBy: number) => void
}) {
    const optionCount = options.length
    if (optionCount === 0) {
        throw new Error('Unable to create group by selector, no data')
    }

    return (
        <div className="group-by">
            <label>Grouping events by</label>
            <span className="group-by-selector">
                {options.map((property, i) => {
                    const selected = i === currentGroupBy
                    return (
                        <button
                            className={clsx({ selected: selected })}
                            disabled={selected}
                            aria-disabled={selected}
                            onClick={() => {
                                setGroupBy(i)
                            }}
                        >
                            {property}
                        </button>
                    )
                })}
            </span>
        </div>
    )
}

export function CalendarGroupContainer({
    groups,
    groupIndex,
    baseUrl,
    groupBy,
    onDelete,
    onMoveUp,
    onMoveDown,
}: {
    groups: BuilderGroup[]
    groupIndex: number
    baseUrl: string
    groupBy: number
    onDelete?: () => void
    onMoveUp?: (key: string) => void
    onMoveDown?: (key: string) => void
}) {
    const group = groups[groupIndex]
    const includedValues = Object.entries(group.includedValues)
    const url = createGroupUrl(baseUrl, group, groupBy)

    const isTopGroup = groupIndex < 1
    const isBottomGroup = groupIndex >= groups.length - 1

    return (
        <div className="calendar-builder-group">
            <h3>Calendar group #{groupIndex + 1}</h3>

            {onDelete && (
                <button className="delete-group" onClick={onDelete}></button>
            )}

            {includedValues.length === 0 ? (
                <p className="empty-group">
                    This group is empty, try moving an entry from another group!
                </p>
            ) : (
                <>
                    <ul className="included-values">
                        {includedValues.map(([key, prettyValue]) => (
                            <li key={key}>
                                <span>{prettyValue}</span>
                                {onMoveUp && (
                                    <button
                                        className="move-up"
                                        onClick={() => onMoveUp(key)}
                                        disabled={isTopGroup}
                                        aria-disabled={isTopGroup}
                                    ></button>
                                )}
                                {onMoveDown && (
                                    <button
                                        className="move-down"
                                        onClick={() => onMoveDown(key)}
                                        disabled={isBottomGroup}
                                        aria-disabled={isBottomGroup}
                                    ></button>
                                )}
                            </li>
                        ))}
                    </ul>

                    <CalendarUrl url={url} />
                </>
            )}
        </div>
    )
}

export interface BuilderGroup {
    includedValues: {
        [k: string]: string
    }
}

export function getGroupByOptions(
    availableGroups: AvailableGroup[]
): GroupByOption[] {
    return availableGroups
        .filter(group => Object.keys(group.values).length > 1)
        .map(group => group.property)
}

function addGroup() {
    if (!currentBuilderData) {
        console.error('Unable to add calendar, no data to base off')
        return
    }
    if (!currentBuilderData.extra.groups[usingGroup]) {
        console.error(
            `Unable to add calendar, grouping by non-existent group ${usingGroup}`
        )
        return
    }

    if (currentCalendarGroups.length === 0) {
        currentCalendarGroups.push({
            includedValues: Object.fromEntries(
                Object.entries(
                    currentBuilderData.extra.groups[usingGroup].values
                )
            ),
        })
    }
    currentCalendarGroups.push({
        includedValues: {},
    })
    updateBuilder()
}

function removeGroup(i: number) {
    if (currentCalendarGroups.length <= 2) {
        // Delete all groups and return to ungrouped calendars
        currentCalendarGroups.splice(0)
    } else {
        // Move values to new group
        const oldGroup = currentCalendarGroups[i]
        const moveTo = i === 0 ? 1 : i - 1
        Object.entries(oldGroup.includedValues).forEach(
            ([key, prettyValue]) => {
                currentCalendarGroups[moveTo].includedValues[key] = prettyValue
            }
        )

        // Delete just this group
        currentCalendarGroups.splice(i, 1)
    }

    updateBuilder()
}

function moveGroupValue(key: string, fromGroup: number, toGroup: number) {
    const prettyValue = currentCalendarGroups[fromGroup].includedValues[key]
    delete currentCalendarGroups[fromGroup].includedValues[key]
    currentCalendarGroups[toGroup].includedValues[key] = prettyValue
    updateBuilder()
}

/**
 * Create a URL for the calendar of a group.
 * @param baseUrl The 'url' field from the adapter response which query parameters can be added to.
 * @param group The group to generate the URL for.
 * @param groupBy The index of the option to group by.
 * @returns The URL pointing to the calendar for this group.
 */
function createGroupUrl(
    baseUrl: string,
    group: BuilderGroup,
    groupBy: number
): string {
    const gi = Object.keys(group.includedValues).join('+')
    const search = `&group=${groupBy}&gi=${gi}`

    return baseUrl + search
}
