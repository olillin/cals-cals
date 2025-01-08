const config = {
    transform: {
        '^.+\\.ts?$': [
            'ts-jest',
            {
                tsconfig: 'tsconfig.backend.json',
            },
        ],
    },
    testEnvironment: 'node',
    testRegex: '/tests/.*\\.(test|spec)?\\.(ts|tsx)$',
    moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
}

module.exports = config
