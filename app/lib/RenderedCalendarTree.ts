import { randomBytes } from 'crypto'
import { PickerCalendar } from './types'

export interface RenderedPickerCalendar extends PickerCalendar {
    displayName: string
    selected: boolean
    parent?: RenderedCalendarTree
}

export interface RenderedPicker {
    calendars: RenderedPickerCalendar[]
}

export interface RenderedCalendarTree {
    id: number
    selected: TreeSelectedState
    calendars?: RenderedPickerCalendar[]
    parent?: RenderedCalendarTree
    subcategories?: RenderedCalendarTree[]
    name?: string
}

export function buildTree(
    calendars: RenderedPickerCalendar[]
): RenderedCalendarTree {
    let idCounter = 0
    const calendarTree: RenderedCalendarTree = {
        id: idCounter++,
        selected: TreeSelectedState.NONE,
    }
    function addCalendar(calendar: RenderedPickerCalendar) {
        if (calendar.category) {
            let tokens: string[] = calendar.category
                .split('/')
                .filter(token => token.trim().length)
            let latest: string
            let node: RenderedCalendarTree = calendarTree
            while (tokens.length > 0) {
                ;[latest, ...tokens] = tokens
                let subcategory = node.subcategories?.find(
                    s => s.name === latest
                )
                if (subcategory) {
                    node = subcategory
                } else {
                    subcategory = {
                        id: idCounter++,
                        name: latest,
                        selected: TreeSelectedState.NONE,
                        parent: node,
                    }
                    if (node.subcategories) {
                        node.subcategories.push(subcategory)
                    } else {
                        node.subcategories = [subcategory]
                    }
                    node = subcategory
                }
            }
            if (!node.calendars) {
                node.calendars = []
            }
            node.calendars!.push({
                ...calendar,
                parent: node,
            })
        } else {
            if (!calendarTree.calendars) calendarTree.calendars = []
            calendarTree.calendars.push({
                ...calendar,
                parent: calendarTree,
            })
        }
    }

    calendars
        .filter(calendar => calendar.hidden !== true)
        .forEach(calendar => {
            addCalendar({
                ...calendar,
                selected: false,
            })
        })

    return calendarTree
}

export enum TreeSelectedState {
    NONE,
    PARTIAL,
    FULL,
}

export function recomputeTreeSelectedState(
    tree: RenderedCalendarTree
): TreeSelectedState {
    let subcategoryCount = tree.subcategories?.length ?? 0
    let fullySelectedSubcategoryCount = 0
    for (const subcategory of tree.subcategories ?? []) {
        if (subcategory.selected === TreeSelectedState.PARTIAL)
            return TreeSelectedState.PARTIAL

        if (subcategory.selected === TreeSelectedState.FULL)
            fullySelectedSubcategoryCount++
    }

    let calendarCount = tree.calendars?.length ?? 0
    let selectedCalendarCount =
        tree.calendars?.filter(c => c.selected).length ?? 0

    if (selectedCalendarCount === calendarCount) {
        return fullySelectedSubcategoryCount < subcategoryCount
            ? TreeSelectedState.PARTIAL
            : TreeSelectedState.FULL
    } else if (selectedCalendarCount === 0) {
        return fullySelectedSubcategoryCount > 0
            ? TreeSelectedState.PARTIAL
            : TreeSelectedState.NONE
    } else {
        return TreeSelectedState.PARTIAL
    }
}

export function propagateSelectionUp(tree: RenderedCalendarTree | undefined) {
    while (tree) {
        tree.selected = recomputeTreeSelectedState(tree)
        tree = tree.parent
    }
}

export function selectAll(tree: RenderedCalendarTree, selected: boolean) {
    for (const currentTree of getTrees(tree)) {
        currentTree.selected = selected
            ? TreeSelectedState.FULL
            : TreeSelectedState.NONE
        if (!currentTree.calendars) continue
        for (const calendar of currentTree.calendars) {
            calendar.selected = selected
        }
    }

    propagateSelectionUp(tree)
}

/**
 * Get all calendars in a {@link tree} and its subcategories.
 * @param tree The tree to get all calendars from.
 * @yields Each calendar using a preorder traversal of the subcategories.
 */
export function* getTreeCalendars(tree: RenderedCalendarTree) {
    for (const currentTree of getTrees(tree)) {
        if (!currentTree.calendars) continue
        for (const calendar of currentTree.calendars) {
            yield calendar
        }
    }
}

export function getSelectedCalendars(
    tree: RenderedCalendarTree
): RenderedPickerCalendar[] {
    const calendars: RenderedPickerCalendar[] = []
    for (const calendar of getTreeCalendars(tree)) {
        if (calendar.selected) calendars.push(calendar)
    }
    return calendars
}

/**
 * Get all trees in a {@link tree}, including the root tree.
 * @param tree The tree to get all trees of.
 * @yields Each tree using a preorder traversal.
 */
export function* getTrees(tree: RenderedCalendarTree) {
    const stack: RenderedCalendarTree[] = [tree]
    while (stack.length > 0) {
        const currentTree: RenderedCalendarTree = stack.pop()!
        yield currentTree
        if (!currentTree.subcategories) continue
        stack.push(...currentTree.subcategories)
    }
}

/** Clone the tree, updates all references to be within the new tree. */
export function cloneTree(
    tree: RenderedCalendarTree,
    parent: RenderedCalendarTree | undefined = undefined
): RenderedCalendarTree {
    const newTree: RenderedCalendarTree = {
        id: tree.id,
        parent: parent,
        name: tree.name,
        selected: tree.selected,
    }
    newTree.calendars = tree.calendars?.map<RenderedPickerCalendar>(
        calendar => ({
            ...calendar,
            parent: newTree,
        })
    )
    newTree.subcategories = tree.subcategories?.map(subtree =>
        cloneTree(subtree, newTree)
    )

    return newTree
}
