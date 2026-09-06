import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
    output: 'standalone',
    cacheComponents: true,
    transpilePackages: ['@t3-oss/env-nextjs', '@t3-oss/env-core'],
}

export default nextConfig
