import '@testing-library/jest-dom';
import { Response, Request, Headers } from 'node-fetch';
import { ReadableStream, WritableStream, TransformStream } from 'stream/web';
import i18next from 'i18next';
import { initReactI18next } from 'react-i18next';

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
  handleAuth: jest.fn(() => async () => new Response()),
}));

// Mock LangGraph SDK
jest.mock('@langchain/langgraph-sdk', () => ({
  Client: jest.fn().mockImplementation(() => ({
    threads: {
      create: jest.fn().mockResolvedValue({ thread_id: 'mock-thread-id' }),
      getState: jest.fn().mockResolvedValue({ values: { messages: [] } }),
    },
    runs: {
      stream: jest.fn().mockResolvedValue({}),
    },
  })),
}));

// Mock Web API globals
global.Response = Response as unknown as typeof globalThis.Response;
global.Request = Request as unknown as typeof globalThis.Request;
global.Headers = Headers as unknown as typeof globalThis.Headers;

// Add Web Streams API to global
Object.assign(global, {
  ReadableStream,
  WritableStream,
  TransformStream
});

if (typeof window === 'undefined') {
  const { TextEncoder, TextDecoder } = require('util');
  global.TextEncoder = TextEncoder;
  global.TextDecoder = TextDecoder;
} 
