import redirectsConfig from '@/data/redirects.json'
import { NextRequest, NextResponse } from 'next/server'
import type { Redirects } from '@/app/lib/types'

// Redirects
const redirects: Redirects = redirectsConfig.redirects

export function middleware(request: NextRequest) {
    if (request.url in redirects) {
        const newUrl = redirects[request.url]
        NextResponse.redirect(newUrl, { status: 301 })
    }
    return NextResponse.next()
}
