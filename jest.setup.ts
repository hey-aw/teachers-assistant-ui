require('@testing-library/jest-dom');
const { Response, Request, Headers } = require('node-fetch');
const { ReadableStream, WritableStream, TransformStream } = require('stream/web');
const i18next = require('i18next');
const { initReactI18next } = require('react-i18next');

// Initialize i18next for tests
i18next
  .use(initReactI18next)
  .init({
    lng: 'en',
    resources: {
      en: {
        translation: {
          'protected_dashboard': 'Protected Dashboard',
          'welcome': 'Welcome'
        }
      }
    },
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false,
    },
  });

// Mock Auth0 environment variables
process.env = {
  ...process.env,
  AUTH0_SECRET: 'test-secret',
  AUTH0_BASE_URL: 'http://localhost:3000',
  AUTH0_ISSUER_BASE_URL: 'https://test.auth0.com',
  AUTH0_CLIENT_ID: 'test-client-id',
  AUTH0_CLIENT_SECRET: 'test-client-secret',
};

// Mock Auth0 SDK
jest.mock('@auth0/nextjs-auth0', () => ({
  getSession: jest.fn(),
  withApiAuthRequired: jest.fn((handler) => handler),
  withPageAuthRequired: jest.fn((component) => component),
  handleAuth: jest.fn(() => async () => ({
    status: 200,
    headers: {},
    json: () => Promise.resolve({}),
    text: () => Promise.resolve(''),
  })),
}));

// Mock Web API globals
Object.assign(global, {
  Response,
  Request,
  Headers,
  ReadableStream,
  WritableStream,
  TransformStream,
});

// Mock TextEncoder/TextDecoder if not in browser environment
if (typeof window === 'undefined') {
  const { TextEncoder, TextDecoder } = require('util');
  Object.assign(global, {
    TextEncoder,
    TextDecoder
  });
} 
