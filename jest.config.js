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
    testRegex: '/tests/.*\\.spec\\.(ts|tsx)$',
    moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
}

module.exports = config
