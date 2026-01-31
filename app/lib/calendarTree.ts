import { PickerCalendar } from './picker'

/** Calendar to be shown in the calendar picker. */
export interface RenderedPickerCalendar extends PickerCalendar {
    /** Display name of the calendar. */
    displayName: string
    /** If the calendar is selected. */
    selected: boolean
    /** The parent tree the calendar is in. */
    parent?: RenderedCalendarTree
}

export interface RenderedPicker {
    /** Calendars in the picker. */
    calendars: RenderedPickerCalendar[]
}

/** The state of the calendar tree. */
export interface RenderedCalendarTree {
    /** Unique identifier of the tree. */
    id: number
    /** Selected state of the tree. */
    selected: TreeSelectedState
    /** Calendars directly in the tree. */
    calendars?: RenderedPickerCalendar[]
    /** Parent tree above the tree. */
    parent?: RenderedCalendarTree
    /** Child trees to the tree. */
    subcategories?: RenderedCalendarTree[]
    /** Name of the category. */
    name?: string
}

/** How many of the calendars in the tree are selected. */
export enum TreeSelectedState {
    /** No calendars all selected. */
    NONE,
    /** At least one calendar is selected. */
    PARTIAL,
    /** All calendars all selected. */
    FULL,
}

/**
 * Render the calendar tree based on the picker calendars.
 * @param calendars The calendars in the picker.
 * @returns The rendered tree.
 */
export function buildTree(
    calendars: RenderedPickerCalendar[]
): RenderedCalendarTree {
    let idCounter = 0
    const calendarTree: RenderedCalendarTree = {
        id: idCounter++,
        selected: TreeSelectedState.NONE,
    }
    calendars
        .filter(calendar => calendar.hidden !== true)
        .forEach(calendar => {
            addCalendar(
                calendarTree,
                {
                    ...calendar,
                    selected: false,
                },
                () => idCounter++
            )
        })

    return calendarTree
}

/**
 * Add a new calendar to a picker tree.
 * @param calendarTree The tree to add the calendar to.
 * @param calendar The calendar to add.
 * @param id Function to create identifiers for new subcategories.
 */
function addCalendar(
    calendarTree: RenderedCalendarTree,
    calendar: RenderedPickerCalendar,
    id: () => number
): void {
    if (calendar.category === undefined) {
        if (!calendarTree.calendars) calendarTree.calendars = []
        calendarTree.calendars.push({
            ...calendar,
            parent: calendarTree,
        })
        return
    }

    let tokens: string[] = calendar.category
        .split('/')
        .filter(token => token.trim().length)
    let latest: string
    let node: RenderedCalendarTree = calendarTree
    while (tokens.length > 0) {
        ;[latest, ...tokens] = tokens
        let subcategory = node.subcategories?.find(s => s.name === latest)
        if (subcategory) {
            node = subcategory
        } else {
            subcategory = {
                id: id(),
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
    node.calendars.push({
        ...calendar,
        parent: node,
    })
}

/**
 * Compute the selected state of a tree based on the direct child trees and calendars.
 * @param tree The tree to check.
 * @returns The current selected state.
 */
export function computeTreeSelectedState(
    tree: RenderedCalendarTree
): TreeSelectedState {
    const subcategoryCount = tree.subcategories?.length ?? 0
    let fullySelectedSubcategoryCount = 0
    for (const subcategory of tree.subcategories ?? []) {
        if (subcategory.selected === TreeSelectedState.PARTIAL)
            return TreeSelectedState.PARTIAL

        if (subcategory.selected === TreeSelectedState.FULL)
            fullySelectedSubcategoryCount++
    }

    const calendarCount = tree.calendars?.length ?? 0
    const selectedCalendarCount =
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

/**
 * Recompute the selected state of all parent trees.
 * @param tree The bottom tree to recompute.
 */
export function propagateSelectionUp(
    tree: RenderedCalendarTree | undefined
): void {
    while (tree) {
        tree.selected = computeTreeSelectedState(tree)
        tree = tree.parent
    }
}

/**
 * Set selected state of all calendars in a tree.
 * @param tree The tree to select calendars in.
 * @param selected If the calendars should be selected or unselected.
 */
export function selectAll(tree: RenderedCalendarTree, selected: boolean): void {
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
 * @yields {RenderedPickerCalendar} Each calendar using a preorder traversal of the subcategories.
 */
export function* getTreeCalendars(
    tree: RenderedCalendarTree
): Generator<RenderedPickerCalendar, void, void> {
    for (const currentTree of getTrees(tree)) {
        if (!currentTree.calendars) continue
        for (const calendar of currentTree.calendars) {
            yield calendar
        }
    }
}

/**
 * Get the currently selected picker calendars.
 * @param tree The tree to check.
 * @returns The list of selected calendars.
 */
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
 * @yields {RenderedCalendarTree} Each tree using a preorder traversal.
 */
export function* getTrees(
    tree: RenderedCalendarTree
): Generator<RenderedCalendarTree, void, void> {
    const stack: RenderedCalendarTree[] = [tree]
    while (stack.length > 0) {
        const currentTree: RenderedCalendarTree = stack.pop()!
        yield currentTree
        if (!currentTree.subcategories) continue
        stack.push(...currentTree.subcategories)
    }
}

/**
 * Clone the tree, updates all references to be within the new tree.
 * @param tree The tree to clone.
 * @param parent The parent of the new tree, defaults to undefined.
 * @returns The cloned tree.
 */
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
