import type { Config } from 'jest';

const config: Config = {
    setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
    testEnvironment: 'jsdom',
    moduleNameMapper: {
        '^@/lib/(.*)$': '<rootDir>/lib/$1',
        '^@/app/(.*)$': '<rootDir>/app/$1',
        '^@/(.*)$': '<rootDir>/$1'
    },
    transform: {
        '^.+\\.(t|j)sx?$': ['ts-jest', {
            tsconfig: {
                jsx: 'react-jsx'
            }
        }]
    },
    transformIgnorePatterns: [
        'node_modules/(?!(@auth0/nextjs-auth0|jose)/)'
    ],
    testMatch: ['**/__tests__/**/*.ts?(x)', '**/?(*.)+(spec|test).ts?(x)'],
    moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
    testEnvironmentOptions: {
        url: 'http://localhost'
    }
};

export default config;
