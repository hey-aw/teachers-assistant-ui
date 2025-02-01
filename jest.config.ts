import type { Config } from 'jest';
import nextJest from 'next/jest';

const createJestConfig = nextJest({
    dir: './',
});

const config: Config = {
    setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
    globalSetup: '<rootDir>/jest-environment-setup.js',
    testEnvironment: 'jest-environment-jsdom',
    transform: {
        '^.+\\.(js|jsx|ts|tsx)$': ['babel-jest', { configFile: './.babelrc.test.js' }],
    },
};

export default createJestConfig(config);
