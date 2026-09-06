import { createEnv } from '@t3-oss/env-nextjs'
import * as z from 'zod'

export const defaultBaseUrl = 'http://localhost:3000'

export const env = createEnv({
    server: {
        NODE_ENV: z.enum(['production', 'development', 'test']),
        BASE_URL: z
            .url({ normalize: true, protocol: /^https?$/ })
            .regex(/\/$/)
            .default(defaultBaseUrl),
    },
    shared: {
        NEXT_PUBLIC_WEB_VERSION: z.string().optional(),
    },
    emptyStringAsUndefined: true,
    experimental__runtimeEnv: {
        NEXT_PUBLIC_WEB_VERSION: process.env.NEXT_PUBLIC_WEB_VERSION,
    },
    // Skip validation with environment variable
    skipValidation: process.env.SKIP_ENV_VALIDATION === '1',
})
