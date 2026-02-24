/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
    preset: 'ts-jest',
    testEnvironment: 'node',
    roots: ['<rootDir>/src'],
    testMatch: ['**/__tests__/**/*.test.ts'],
    coverageDirectory: 'coverage',
    collectCoverageFrom: [
        'src/services/**/*.ts',
        'src/controllers/**/*.ts',
    ],
    setupFilesAfterEnv: ['<rootDir>/src/__tests__/setup.ts']
};
