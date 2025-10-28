import { Picker, PickerCalendar } from '../lib/types'
import CalendarTree, { PickerCalendarTree } from './CalendarTree'
import pickerConfig from '@/data/picker.json'

export default async function RootCalendarTree() {
    const picker: Picker = pickerConfig
    const tree = buildTree(picker.calendars)

    return <CalendarTree tree={tree} />
}

function buildTree(calendars: PickerCalendar[]): PickerCalendarTree {
    const calendarTree: PickerCalendarTree = {}
    function addCalendar(calendar: PickerCalendar) {
        if (calendar.category) {
            let tokens: string[] = calendar.category
                .split('/')
                .filter(token => token.trim().length)
            let latest: string
            let node: PickerCalendarTree = calendarTree
            while (tokens.length > 0) {
                ;[latest, ...tokens] = tokens
                let subcategory = node.subcategories?.find(
                    s => s.name === latest
                )
                if (subcategory) {
                    node = subcategory
                } else {
                    subcategory = {
                        name: latest,
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
            node.calendars!.push(calendar)
        } else {
            if (calendarTree.calendars) {
                calendarTree.calendars.push(calendar)
            } else {
                calendarTree.calendars = [calendar]
            }
        }
    }

    calendars
        .filter(calendar => calendar.hidden !== true)
        .forEach(calendar => {
            addCalendar(calendar)
        })

    return calendarTree
}
