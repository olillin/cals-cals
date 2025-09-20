import { Calendar, CalendarEvent } from 'iamcal'
import Adapter, { escapeText, unescapeText } from '../Adapter'

export default class TimeEditAdapter extends Adapter {
    createUrl(id: string): URL {
        const [category, filename] = id.split('.')
        return new URL(
            `https://cloud.timeedit.net/chalmers/web/${category}/${filename}.ics`
        )
    }

    getId(url: URL): string {
        const urlPattern =
            /^(https|webcal):\/\/cloud\.timeedit\.net\/\w+\/web\/\w+\/[^\/]+\.ics$/
        if (!urlPattern.test(url.href)) {
            throw new Error('Invalid URL')
        }

        const organizationPattern = /(?<=cloud\.timeedit\.net\/).+?(?=\/)/
        const organization = organizationPattern.exec(url.href)?.[0]
        if (organization !== 'chalmers') {
            throw new Error(
                'Unsupported organization. Calendar must be from Chalmers.'
            )
        }

        const categoryPattern = /(?<=web\/).+?(?=\/)/
        const category = categoryPattern.exec(url.href)?.[0]

        if (category !== 'public')
            throw new Error(
                'Unsupported category. Calendar must be from the "public" schedule ("Öppen schemavisning").'
            )

        const filenamePattern = /[^\/]+?(?=\.ics)/
        const filename = filenamePattern.exec(url.href)![0]

        const id = `${category}.${filename}`
        return id
    }

    convertCalendar(calendar: Calendar): Calendar {
        calendar.getEvents().forEach(event => this.convertEvent(event))
        return calendar
    }

    convertEvent(event: CalendarEvent) {
        const eventData = this.groupEventData(event)

        const summary = this.formatSummary(eventData, event)
        if (summary) {
            event.setSummary(escapeText(summary))
        } else {
            event.removeSummary()
        }

        const description = this.formatDescription(eventData, event)
        if (description) {
            event.setDescription(escapeText(description))
        } else {
            event.removeDescription()
        }

        const location = this.formatLocation(eventData, event)
        if (location) {
            event.setLocation(escapeText(location))
        } else {
            event.removeLocation()
        }
    }

    formatSummary(
        data: TimeEditEventData,
        context?: CalendarEvent
    ): string | null {
        if (data.titel) {
            return data.titel.join(', ')
        }

        const activityPart = data.activity
            ? `${data.activity.join(', ')}${data.kursKod || data.kursNamn ? ':' : ''}`
            : null
        const coursePart = this.formatCourse(data)

        const summary = [activityPart, coursePart]
            .filter(part => part !== null)
            .join(' ')

        return summary === '' ? (context?.getSummary() ?? null) : summary
    }

    formatDescription(
        data: TimeEditEventData,
        context?: CalendarEvent
    ): string | null {
        const activityRow = data.activity
            ? `Aktivitet: ${data.activity[0]}`
            : null
        const course = this.formatCourse(data)
        const courseRow = course ? `Kurs: ${course}` : null
        const classRow = data.klassKod
            ? 'Klass: ' + data.klassKod.join(', ')
            : null

        const url =
            data.kartlänk ??
            (context?.hasProperty('URL')
                ? [context.getProperty('URL')!.value]
                : null)

        const mapRow = url ? 'Karta: ' + url.join(', ') : null

        const knownKeys = [
            'activity',
            'klassNamn',
            'klassKod',
            'kursNamn',
            'kursKod',
            'titel',
            'lokalnamn',
            'kartlänk',
            'campus',
            'antalDatorer',
        ]
        const extraRows: string[] = []
        Object.entries(data).forEach(([key, value]) => {
            if (knownKeys.includes(key)) return
            extraRows.push(`${this.fromCamelCase(key)}: ${value?.join(', ')}`)
        })
        extraRows.sort()

        const description = [
            activityRow,
            courseRow,
            classRow,
            mapRow,
            ...extraRows,
        ]
            .filter(row => row !== null)
            .join('\n')

        return description === ''
            ? (context?.getDescription() ?? null)
            : description
    }

    formatLocation(
        data: TimeEditEventData,
        context?: CalendarEvent
    ): string | null {
        if (data.titel && data.titel[0].includes('utanför Hubben')) {
            return 'Utanför Hubben'
        }

        const rooms = data.lokalnamn
        const campuses = data.campus

        // Edge cases for incomplete data
        if (!rooms || !campuses) {
            if (rooms) return rooms.join(', ')
            if (campuses) return campuses.join(', ')
            return context?.getLocation() ?? null
        }

        if (rooms.length !== campuses.length) {
            // Array lengths are mismatched. Campus of each room cannot be inferred with confidence.
            const uniqueCampuses: string[] = []
            campuses.forEach(campus => {
                if (!uniqueCampuses.includes(campus))
                    uniqueCampuses.push(campus)
            })
            return `${rooms.join(', ')} (${uniqueCampuses.join(', ')})`
        }

        // Group rooms by campus
        const groupedRooms: { [k: string]: string[] } = {}
        const orderedCampuses: string[] = []
        rooms.forEach((room, i) => {
            const campus = campuses[i] ?? campuses[0]
            if (!groupedRooms[campus]) groupedRooms[campus] = []
            groupedRooms[campus].push(room)

            if (!orderedCampuses.includes(campus)) orderedCampuses.push(campus)
        })

        return orderedCampuses
            .map(campus => groupedRooms[campus].join(', ') + ` (${campus})`)
            .join('. ')
    }

    formatCourse(data: TimeEditEventData): string | null {
        const courseNamePart = data.kursNamn ? data.kursNamn[0] : null
        const joinedCourseCodes = data.kursKod
            ?.map(code => shortenCourseCode(code))
            .join(', ')
        const courseCodesPart = joinedCourseCodes
            ? courseNamePart
                ? `(${joinedCourseCodes})`
                : joinedCourseCodes
            : null
        const course = [courseNamePart, courseCodesPart]
            .filter(part => part !== null)
            .join(' ')

        return course === '' ? null : course
    }

    private groupEventData(event: CalendarEvent): TimeEditEventData {
        const escapedSummary = event.getSummary()
        const summary = escapedSummary ? unescapeText(escapedSummary) : null
        const escapedLocation = event.getLocation()
        const location = escapedLocation ? unescapeText(escapedLocation) : null
        const sources = [summary, location].filter(s => s !== null)
        return this.groupEventDataString(...sources)
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
            if (
                !acc[key].includes(value) ||
                key === 'lokalnamn' ||
                key === 'campus'
            ) {
                acc[key].push(value)
            }
            return acc
        }, {})

        // Deduplicate rooms and compuses
        const rooms = groupedData['lokalnamn']
        const campuses = groupedData['campus']
        if (campuses && new Set(campuses).size <= 1) {
            campuses.splice(1)
        } else if (rooms && campuses && rooms.length === campuses.length) {
            const toRemove: number[] = []
            for (let i = rooms.length - 1; i > 0; i--) {
                for (let j = i - 1; j >= 0; j--) {
                    if (rooms[j] === rooms[i] && campuses[j] === campuses[i]) {
                        toRemove.push(i)
                        break
                    }
                }
            }
            toRemove.forEach(i => {
                rooms.splice(i, 1)
                campuses.splice(i, 1)
            })
        }

        return groupedData
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

    private fromCamelCase(text: string): string {
        if (text.length <= 1) return text.toUpperCase()
        const words = text.split(/(?=[A-Z])/g).map((word, i) => {
            if (i === 0) {
                return word.charAt(0).toUpperCase() + word.substring(1)
            } else {
                return word.toLowerCase()
            }
        })

        return words.join(' ')
    }
}

export interface TimeEditEventData {
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

function shortenCourseCode(code: string): string {
    return code.split('_')[0]
}
