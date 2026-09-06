import PageNavivgation from '@/app/ui/PageNavigation'
import PageFooter from '@/app/ui/PageFooter'
import UpdateNotice from '@/app/ui/UpdateNotice'
import type { Metadata, Viewport } from 'next'
import './globals.css'
import { readLatestChanges } from '../lib/changes'
import { env } from '@/app/lib/env'
import { connection } from 'next/server'

export async function generateMetadata(): Promise<Metadata> {
    // Do not inline BASE_URL
    await connection()

    return {
        metadataBase: new URL(env.BASE_URL),
        title: "Cal's cals",
        description: 'Locally produced calendars at Chalmers!',
        applicationName: "Cal's cals",
        openGraph: {
            title: "Cal's cals",
            description: 'Locally produced calendars at Chalmers!',
            siteName: 'Olillin',
            images: [
                {
                    url: '/media.png',
                    alt: "Cal's cals banner",
                },
            ],
        },
        twitter: {
            title: "Cal's cals",
            description: 'Locally produced calendars at Chalmers!',
            card: 'summary_large_image',
            images: [
                {
                    url: '/media.png',
                    alt: "Cal's cals banner",
                },
            ],
        },
        icons: {
            icon: '/favicon.ico',
        },
    }
}

export const viewport: Viewport = {
    themeColor: '#5ac1a2',
    colorScheme: 'dark',
}

export default async function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode
}>) {
    const changes = await readLatestChanges()

    return (
        <html lang="en">
            <body className="antialiased">
                <div className="center-column">
                    {changes && <UpdateNotice changes={changes} />}
                    <main>
                        <section className="introduction">
                            <h1>Welcome to Cal&apos;s cals!</h1>
                            <p>
                                A better calendar experience at Chalmers,
                                created and maintained by&nbsp;
                                <a href="https://wiki.chalmers.it/Cal">Cal</a>.
                            </p>
                        </section>

                        <PageNavivgation />

                        {children}
                    </main>

                    <PageFooter />
                </div>
            </body>
        </html>
    )
}
