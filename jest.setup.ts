import '@testing-library/jest-dom';
import { Response, Request, Headers } from 'node-fetch';

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

// Mock Web API globals
global.Response = Response as unknown as typeof globalThis.Response;
global.Request = Request as unknown as typeof globalThis.Request;
global.Headers = Headers as unknown as typeof globalThis.Headers;

if (typeof window === 'undefined') {
  const { TextEncoder, TextDecoder } = require('util');
  global.TextEncoder = TextEncoder;
  global.TextDecoder = TextDecoder;
} 