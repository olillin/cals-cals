import { NextRequest, NextResponse } from 'next/server'
import { readRedirects } from '@/app/lib/redirects'

// eslint-disable-next-line jsdoc/require-jsdoc
export async function middleware(request: NextRequest): Promise<NextResponse> {
    const redirects = await readRedirects()

    if (request.url in redirects) {
        const newUrl = redirects[request.url]
        NextResponse.redirect(newUrl, { status: 301 })
    }
    return NextResponse.next()
}
