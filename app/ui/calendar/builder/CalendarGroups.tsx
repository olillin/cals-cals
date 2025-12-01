import {
    AvailableGroup,
    GroupByOption,
    TimeEditUrlResponse,
} from '@/app/lib/timeedit'
import clsx from 'clsx'
import { useEffect, useState } from 'react'
import CalendarUrl from '../CalendarUrl'

export default function CalendarGroups({
    data,
    onClose,
}: {
    data: TimeEditUrlResponse
    onClose: () => void
}) {
    const [groupBy, setGroupBy] = useState(0)
    const [groups, setGroups] = useState<BuilderGroup[]>([])

    const groupByOptions = getGroupByOptions(data.extra.groups)
    const groupByProperty = groupByOptions[groupBy]

    useEffect(() => {
        setGroups([])
    }, [groupBy])

    if (groups.length === 0) {
        const initialGroups: BuilderGroup[] = [
            {
                includedValues: data.extra.groups.find(
                    availableGroup =>
                        availableGroup.property === groupByProperty
                )!.values,
            },
            {
                includedValues: {},
            },
        ]
        setGroups(initialGroups)
    }

    return (
        <>
            {groupByOptions.length > 1 && (
                <GroupBySelector
                    options={groupByOptions}
                    selected={groupBy}
                    setGroupBy={newGroupBy => setGroupBy(newGroupBy)}
                />
            )}

            {groups.map((group, i) => (
                <CalendarGroupContainer
                    key={i}
                    groups={groups}
                    groupIndex={i}
                    baseUrl={data.url}
                    groupBy={groupBy}
                    onMoveDown={
                        i >= groups.length - 1
                            ? undefined
                            : (key: string) =>
                                  setGroups(
                                      moveGroupValue(groups, key, i, i + 1)
                                  )
                    }
                    onMoveUp={
                        i <= 0
                            ? undefined
                            : (key: string) =>
                                  setGroups(
                                      moveGroupValue(groups, key, i, i - 1)
                                  )
                    }
                    onDelete={() => {
                        const newGroups = removeGroup(groups, i)
                        if (newGroups.length < 2) {
                            onClose()
                        } else {
                            setGroups(newGroups)
                        }
                    }}
                />
            ))}

            <button
                id="add-group"
                className="add-group"
                onClick={() => {
                    setGroups(addGroup(groups))
                }}
            >
                Add group
            </button>
        </>
    )
}

export function GroupBySelector({
    options,
    selected: currentGroupBy,
    setGroupBy,
}: {
    options: GroupByOption[]
    selected: number
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
                            key={i}
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

    const moveUpDisabled = !onMoveUp
    const moveDownDisabled = !onMoveDown

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
                                <button
                                    className="move-up"
                                    onClick={onMoveUp && (() => onMoveUp(key))}
                                    disabled={moveUpDisabled}
                                    aria-disabled={moveUpDisabled}
                                ></button>
                                <button
                                    className="move-down"
                                    onClick={
                                        onMoveDown && (() => onMoveDown(key))
                                    }
                                    disabled={moveDownDisabled}
                                    aria-disabled={moveDownDisabled}
                                ></button>
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

function cloneGroups(groups: BuilderGroup[]): BuilderGroup[] {
    return groups.map<BuilderGroup>(group => ({
        includedValues: { ...group.includedValues },
    }))
}

function addGroup(
    groups: BuilderGroup[],
    group: BuilderGroup = { includedValues: {} }
): BuilderGroup[] {
    const newGroups = cloneGroups(groups)
    newGroups.push(group)
    return newGroups
}

function removeGroup(groups: BuilderGroup[], index: number): BuilderGroup[] {
    if (groups.length <= 1) return []

    // Copy groups without deleted group
    const newGroups = cloneGroups(groups)
    newGroups.splice(index, 1)

    // Reinsert values from deleted group
    const oldGroup = groups[index]
    const moveTo = index === 0 ? 0 : index - 1
    Object.entries(oldGroup.includedValues).forEach(([key, prettyValue]) => {
        newGroups[moveTo].includedValues[key] = prettyValue
    })

    return newGroups
}

function moveGroupValue(
    groups: BuilderGroup[],
    key: string,
    fromGroup: number,
    toGroup: number
) {
    const newGroups = cloneGroups(groups)
    const prettyValue = newGroups[fromGroup].includedValues[key]
    delete newGroups[fromGroup].includedValues[key]
    newGroups[toGroup].includedValues[key] = prettyValue
    return newGroups
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
