import { defineConfig, globalIgnores } from 'eslint/config'
import eslint from '@eslint/js'
import tseslint from 'typescript-eslint'
import jsdoc from 'eslint-plugin-jsdoc'
import nextVitals from 'eslint-config-next/core-web-vitals'
import nextTs from 'eslint-config-next/typescript'
import { fileURLToPath } from 'node:url'
import { includeIgnoreFile } from '@eslint/compat'

const gitignorePath = fileURLToPath(new URL('.gitignore', import.meta.url))

const eslintConfig = defineConfig([
    ...nextVitals,
    ...nextTs,
    // Override default ignores of eslint-config-next.
    globalIgnores([
        // Default ignores of eslint-config-next:
        '.next/**',
        'out/**',
        'build/**',
        'next-env.d.ts',
    ]),
    // Ignore files in gitignore
    includeIgnoreFile(gitignorePath, 'Imported .gitignore patterns'),
    // Rules
    {
        files: ['**/*.ts'],
        languageOptions: {
            parserOptions: {
                project: ['./tsconfig.json', './tsconfig.test.json'],
                tsconfigRootDir: import.meta.dirname,
            },
        },
        extends: [
            eslint.configs.recommended,
            ...tseslint.configs.recommended,
            ...tseslint.configs.recommendedTypeChecked,
            jsdoc.configs['flat/contents-typescript'],
            jsdoc.configs['flat/logical-typescript'],
            jsdoc.configs['flat/requirements-typescript'],
            jsdoc.configs['flat/stylistic-typescript'],
        ],
        rules: {
            'max-depth': ['error', { max: 3 }],
            '@typescript-eslint/explicit-function-return-type': 'error',
            '@typescript-eslint/no-deprecated': 'warn',
            '@typescript-eslint/no-base-to-string': 'off',
            'jsdoc/require-throws': 'error',
            'jsdoc/require-description-complete-sentence': 'warn',
            'jsdoc/sort-tags': 'warn',
            'jsdoc/require-example': 'off',
            'jsdoc/match-description': 'off',
            'jsdoc/require-param': [
                'error',
                { checkGetters: true, checkSetters: true },
            ],
            'jsdoc/require-returns': ['error', { checkGetters: false }],
        },
    },
])

export default eslintConfig
