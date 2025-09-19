import { Calendar, CalendarEvent } from 'iamcal'
import Adapter from '../Adapter'

export default class TimeEditAdapter extends Adapter {
    createUrl(id: string): URL {
        const [category, filename] = id.split('.')
        return new URL(
            `https://cloud.timeedit.net/chalmers/web/${category}/${filename}.ics`
        )
    }

    getId(url: URL): string {
        const urlPattern =
            /^(https|webcal):\/\/cloud\.timeedit\.net\/chalmers\/web\/public\/[^\/]+\.ics$/
        if (!urlPattern.test(url.href)) {
            throw new Error('Invalid URL')
        }

        const categoryPattern = /(?<=web\/).+?(?=\/)/
        const category = categoryPattern.exec(url.href)?.[0]

        if (category !== 'public')
            throw new Error('Calendar must be from the public schedule')

        const filenamePattern = /[^\/]+?(?=\.ics)/
        const filename = filenamePattern.exec(url.href)?.[0]
        if (!filename) throw new Error(`Invalid URL, unable to find filename`)

        const id = `${category}.${filename}`
        return id
    }

    convertCalendar(calendar: Calendar): Calendar {
        calendar.getEvents().forEach(this.convertEvent)
        return calendar
    }

    convertEvent(event: CalendarEvent) {
        const eventData = this.groupEventData(event)

        const summary = this.formatSummary(eventData, event)
        event.setSummary(this.escapeText(summary))
        const description = this.formatDescription(eventData, event)
        event.setDescription(this.escapeText(description))
        const location = this.formatLocation(eventData, event)
        event.setLocation(this.escapeText(location))
    }

    formatSummary(data: TimeEditEventData, context: CalendarEvent): string {
        if (data.titel) {
            return data.titel.join(', ')
        }

        const activityPart = data.activity
            ? `${data.activity.join(', ')}${data.kursKod || data.kursNamn ? ':' : ''}`
            : null
        const courseNamePart = data.kursNamn ? data.kursNamn[0] : null
        const joinedCourseCodes = data.kursKod
            ?.map(code => code.split('_')[0])
            .join(', ')
        const courseCodesPart = courseNamePart
            ? `(${joinedCourseCodes})`
            : joinedCourseCodes

        return [activityPart, courseNamePart, courseCodesPart]
            .filter(part => part !== null)
            .join(' ')
    }

    formatDescription(data: TimeEditEventData, context: CalendarEvent): string {
        const activityRow = data.activity ? `Vad: ${data.activity[0]}` : null
        const courseRow =
            data.kursNamn && data.kursKod
                ? `Kurs: ${data.kursNamn[0]} (${data.kursKod.join(', ')})`
                : data.kursNamn
                  ? `Kurs: ${data.kursNamn[0]}`
                  : data.kursKod
                    ? `Kurs: ${data.kursKod.join(', ')}`
                    : null
        const classRow = data.klassKod
            ? 'Klass: ' + data.klassKod.join(', ')
            : null

        const url =
            data.kartlänk ??
            (context.hasProperty('URL')
                ? [context.getProperty('URL')!.value]
                : null)

        const mapRow = url ? 'Karta: ' + url.join(', ') : null

        return [activityRow, courseRow, classRow, mapRow]
            .filter(row => row !== null)
            .join('\n')
    }

    formatLocation(data: TimeEditEventData, context: CalendarEvent): string {
        if (data.titel && data.titel[0].includes('utanför Hubben')) {
            return 'Utanför Hubben'
        }

        const room = data.lokalnamn ? data.lokalnamn.join(', ') : null
        const campus = data.campus
            ? room
                ? `(${data.campus.join(', ')})`
                : data.campus.join(', ')
            : null

        return [room, campus].filter(part => part !== null).join(' ')
    }

    private groupEventData(event: CalendarEvent): TimeEditEventData {
        const summary = this.unescapeText(event.getSummary()!)
        const location = this.unescapeText(event.getLocation()!)
        return this.groupEventDataString(summary, location)
    }

    private groupEventDataString(...strings: string[]): TimeEditEventData {
        const dataPairs = strings
            .flatMap(s =>
                Array.from(
                    s.matchAll(
                        /([^:.,\s][^:.,\n]*?): (.+?)(?=(?:[,.] )?(?:[^:.,\s][^:.,\n]*?:|$))/gm
                    )
                )
            )
            .map(match => [this.toCamelCase(match[1].trim()), match[2].trim()])

        const groupedData: TimeEditEventData = dataPairs.reduce<{
            [k: string]: string[]
        }>((acc, [key, value]) => {
            if (!acc[key]) acc[key] = []
            if (!acc[key].includes(value)) acc[key].push(value)
            return acc
        }, {})

        return groupedData
    }

    private unescapeText(text: string): string {
        return text.replace(/\\(?=[,;\\])/g, '').replace(/(?<!\\)\\n/g, '\n')
    }

    private escapeText(text: string): string {
        return text.replace(/(?=[,;\\])/g, '\\').replace(/(?<!\\)\n/g, '\\n')
    }

    private toCamelCase(text: string): string {
        const words = text.split(' ')
        return (
            words[0].charAt(0).toLowerCase() +
            words[0].slice(1) +
            words
                .slice(1)
                .map(
                    word =>
                        word.charAt(0).toUpperCase() +
                        word.slice(1).toLowerCase()
                )
                .join('')
        )
    }
}

interface TimeEditEventData {
    [k: string]: string[] | undefined
    activity?: string[]
    klassNamn?: string[]
    klassKod?: string[]
    kursNamn?: string[]
    kursKod?: string[]
    titel?: string[]
    lokalnamn?: string[]
    kartlänk?: string[]
    campus?: string[]
    antalDatorer?: string[]
}
