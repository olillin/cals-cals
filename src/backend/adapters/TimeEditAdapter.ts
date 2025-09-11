import { Calendar } from 'iamcal'
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
        calendar.getEvents().forEach(event => {
            const oldSummary = this.unescapeText(event.getSummary()!)
            const oldLocation = this.unescapeText(event.getLocation()!)

            const groupedSummaryData = this.groupRawData(oldSummary)
            const groupedLocationData = this.groupRawData(oldLocation)

            const courseCodes = groupedSummaryData['Kurs kod'] ?? []
            const courseNames = groupedSummaryData['Kurs namn'] ?? []
            const classCodes = groupedSummaryData['Klass kod'] ?? []
            const activity = groupedSummaryData['Activity'] ?? []

            const title = groupedSummaryData['Titel'] ?? []

            const room = groupedLocationData['Lokalnamn'] ?? []
            const campus = groupedLocationData['Campus'] ?? []

            event.setSummary(
                this.escapeText(
                    title[0] ??
                        `${activity[0]}: ${courseNames[0]} (${courseCodes.map(code => code.split('_')[0]).join(', ')})`
                )
            )

            const activityRow = activity[0] ? `Vad: ${activity[0]}` : null
            const courseRow =
                courseNames[0] && courseCodes[0]
                    ? `Kurs: ${courseNames[0]} (${courseCodes.join(', ')})`
                    : courseNames[0]
                      ? `Kurs: ${courseNames[0]}`
                      : courseCodes[0]
                        ? `Kurs: ${courseCodes.join(', ')}`
                        : null
            const classRow = classCodes[0]
                ? 'Klass: ' + classCodes.join(', ')
                : null

            event.setDescription(
                this.escapeText(
                    [activityRow, courseRow, classRow]
                        .filter(row => row !== null)
                        .join('\n')
                )
            )

            const url = event.getProperty('URL')?.value

            if (
                event
                    .getSummary()
                    ?.includes('Välkommen på drop in utanför Hubben')
            ) {
                // Special case for this specific event
                event.setLocation('Utanför Hubben')
            } else {
                event.setLocation(
                    this.escapeText(
                        room.join(', ') +
                            (campus[0] ? ` (${campus.join(', ')})` : '') +
                            (url ? ` ${url}` : '')
                    )
                )
            }
        })
        return calendar
    }

    private groupRawData(rawData: string): { [k: string]: string[] } {
        const dataPairs = Array.from(
            rawData.matchAll(
                /([^:.,\s][^:.,\n]*?): (.+?)(?=(?:[,.] )?(?:[^:.,\s][^:.,\n]*?:|$))/gm
            )
        ).map(match => [match[1].trim(), match[2].trim()])

        const groupedData = dataPairs.reduce<{ [k: string]: string[] }>(
            (acc, [key, value]) => {
                if (!acc[key]) acc[key] = []
                if (!acc[key].includes(value)) acc[key].push(value)
                return acc
            },
            {}
        )

        return groupedData
    }

    private unescapeText(text: string): string {
        return text.replace(/\\(?=[,;\\])/g, '').replace(/(?<!\\)\\n/g, '\n')
    }

    private escapeText(text: string): string {
        return text.replace(/(?=[,;\\])/g, '\\').replace(/(?<!\\)\n/g, '\\n')
    }
}
