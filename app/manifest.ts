import type { MetadataRoute } from 'next'

// eslint-disable-next-line jsdoc/require-jsdoc
export default function manifest(): MetadataRoute.Manifest {
    return {
        name: "Cal's cals",
        description: 'Locally produced calendars at Chalmers',
        start_url: '/',
        display: 'browser',
        background_color: '#111111',
        theme_color: '#5ac1a2',
        icons: [
            {
                src: '/icons/shortcut-icon-500x500.png',
                sizes: '500x500',
                type: 'image/png',
            },
            {
                src: '/icons/shortcut-icon-192x192.png',
                sizes: '192x192',
                type: 'image/png',
            },
        ],
        shortcuts: [
            {
                name: 'Calendar Builder',
                short_name: 'Builder',
                description: 'Build a new calendar',
                url: '/builder',
            },
        ],
    }
}
