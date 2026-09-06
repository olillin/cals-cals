import { defineConfig } from 'vitest/config'
import tsconfigPaths from 'vite-tsconfig-paths'

export default defineConfig({
    test: {
        env: {
            NODE_ENV: 'test',
            SKIP_ENV_VALIDATION: '1',
        },
    },
    plugins: [tsconfigPaths()],
})
