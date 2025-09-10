import { group } from 'console'
import Adapter from '../Adapter'
import { Calendar, parseCalendar } from 'iamcal'

export default class TimeEditAdapter extends Adapter {
    createUrl(id: string): URL {
        const [filename, category, organization] = id.split('@')
        return new URL(
            `https://cloud.timeedit.net/${organization}/web/${category}/${filename}.ics`
        )
    }

    getId(url: URL): string {
        const organizationPattern = /(?<=timeedit\.net\/).+?(?=\/)/
        const organization = organizationPattern.exec(url.href)?.[0]
        if (!organization)
            throw new Error(
                `Unable to find organization in TimeEdit URL: '${url.href}'`
            )

        const categoryPattern = /(?<=web\/).+?(?=\/)/
        const category = categoryPattern.exec(url.href)?.[0]
        if (!category)
            throw new Error(
                `Unable to find category in TimeEdit URL: '${url.href}'`
            )

        const filenamePattern = /[^\/]+?(?=\.ics)/
        const filename = filenamePattern.exec(url.href)?.[0]
        if (!filename)
            throw new Error(
                `Unable to find filename in TimeEdit URL: '${url.href}'`
            )

        return `${filename}@${category}@${organization}`
    }

    convertCalendar(calendar: Calendar): Calendar {
        calendar.getEvents().forEach(event => {
            const oldSummary = this.unescapeText(event.getSummary()!)
            const oldLocation = this.unescapeText(event.getLocation()!).replace(
                '\n',
                ' '
            )

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

            event.setLocation(
                this.escapeText(
                    room.join(', ') +
                        (campus[0] ? ` (${campus.join(', ')})` : '') +
                        url
                        ? ` ${url}`
                        : ''
                )
            )
        })
        return calendar
    }

    private groupRawData(rawData: string): { [k: string]: string[] } {
        const dataPairs = Array.from(
            rawData.matchAll(
                /([^:.,\s][^:.,]*?): (.+?)(?=(?:[,.] )?(?:[^:.,\s][^:.,]*?:|$))/g
            )
        ).map(match => [match[1], match[2]])

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
