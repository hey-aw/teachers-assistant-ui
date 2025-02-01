import type { Config } from 'jest';
import nextJest from 'next/jest';

const createJestConfig = nextJest({
    dir: './',
});

const config: Config = {
    setupFilesAfterEnv: [
        '<rootDir>/jest.env.js',
        '<rootDir>/jest.setup.ts'
    ],
    moduleNameMapper: {
        '^@/(.*)$': '<rootDir>/$1',
        '^@/app/(.*)$': '<rootDir>/app/$1',
        '^@/components/(.*)$': '<rootDir>/components/$1',
        '^@/lib/(.*)$': '<rootDir>/lib/$1',
        '^react$': '<rootDir>/node_modules/react',
        '^react-dom$': '<rootDir>/node_modules/react-dom',
        '^@testing-library/jest-dom$': '<rootDir>/node_modules/@testing-library/jest-dom',
    },
    testEnvironment: 'jest-environment-jsdom',
    testMatch: ['**/__tests__/**/*.test.ts?(x)'],
    collectCoverage: true,
    coverageDirectory: 'coverage',
    coveragePathIgnorePatterns: ['/node_modules/', '/.next/'],
    transform: {
        '^.+\\.(t|j)sx?$': ['babel-jest', {
            presets: [
                ['@babel/preset-env', {
                    targets: { node: 'current' },
                    modules: 'commonjs'
                }],
                '@babel/preset-typescript',
                ['@babel/preset-react', { runtime: 'automatic' }],
            ],
            plugins: [
                '@babel/plugin-transform-runtime',
                '@babel/plugin-transform-modules-commonjs'
            ]
        }]
    },
    transformIgnorePatterns: [
        '/node_modules/(?!(@auth0/nextjs-auth0|oauth4webapi|next/dist/client/components|next/dist/client|next/dist/shared|@swc/helpers|@babel/runtime/helpers/esm)/)'
    ],
    extensionsToTreatAsEsm: ['.ts', '.tsx'],
    moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
    testEnvironmentOptions: {
        customExportConditions: ['node', 'node-addons'],
    },
    projects: [
        {
            displayName: 'components',
            testEnvironment: 'jest-environment-jsdom',
            testMatch: ['**/__tests__/pages/**/*.test.ts?(x)', '**/__tests__/components/**/*.test.ts?(x)'],
            setupFilesAfterEnv: [
                '<rootDir>/jest.env.js',
                '<rootDir>/jest.setup.ts'
            ],
        },
        {
            displayName: 'api',
            testEnvironment: 'node',
            testMatch: ['**/__tests__/api/**/*.test.ts?(x)'],
            setupFilesAfterEnv: [
                '<rootDir>/jest.env.js',
                '<rootDir>/jest.setup.ts'
            ],
        },
    ],
};

export default createJestConfig(config);
