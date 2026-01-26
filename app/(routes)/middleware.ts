import { NextRequest, NextResponse } from 'next/server'
import { type Redirects, readRedirects} from '@/app/lib/redirects'

// Redirects
export function middleware(request: NextRequest) {
    const redirects = readRedirects()

    if (request.url in redirects) {
        const newUrl = redirects[request.url]
        NextResponse.redirect(newUrl, { status: 301 })
    }
    return NextResponse.next()
}
