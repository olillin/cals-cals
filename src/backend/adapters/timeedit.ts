import Adapter from '../Adapter'
import { Calendar } from 'iamcal'

class TimeEditAdapter extends Adapter {
    createUrl(id: string): URL {
        const [filename, organization] = id.split('@')
        return new URL(
            `https://cloud.timeedit.net/${organization}/web/public/${filename}.ics`
        )
    }

    getId(url: URL): string {
        const organizationPattern = /(?<=timeedit\.net\/).+?(?=\/)/
        const organization = organizationPattern.exec(url.href)?.[0]
        if (!organization)
            throw new Error(`Unable to find organization in TimeEdit URL: '${url.href}'`)

        const filenamePattern = /[^\/]+?(?=\.ics)/
        const filename = filenamePattern.exec(url.href)?.[0]
        if (!filename)
            throw new Error(`Unable to find filename in TimeEdit URL: '${url.href}'`)

        return `${filename}@${organization}`
    }

    convertCalendar(calendar: Calendar): Calendar {
        throw new Error('Method not implemented.')
    }
}
