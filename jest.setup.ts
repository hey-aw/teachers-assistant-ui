import '@testing-library/jest-dom';
import { ReadableStream, WritableStream, TransformStream } from 'stream/web';
import i18next from 'i18next';
import { initReactI18next } from 'react-i18next';
import type { NextRequest, NextResponse } from 'next/server';
import type { RequestCookies, ResponseCookies } from 'next/dist/server/web/spec-extension/cookies';

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

// Add Web Streams API to global
Object.assign(global, {
  ReadableStream,
  WritableStream,
  TransformStream,
  Request: globalThis.Request || class Request { },
  Response: globalThis.Response || class Response { }
});

if (typeof window === 'undefined') {
  const { TextEncoder, TextDecoder } = require('util');
  global.TextEncoder = TextEncoder;
  global.TextDecoder = TextDecoder;
}

// Mock window.fetch
global.fetch = jest.fn(() =>
  Promise.resolve(new Response(JSON.stringify({}), {
    status: 200,
    headers: new Headers(),
  }))
);

// Mock Next.js Request and Response
const mockHeaders = new Headers();

class MockNextResponse extends Response {
  static json(data: any, init?: ResponseInit) {
    const headers = new Headers(init?.headers);
    headers.set('Content-Type', 'application/json');
    return new MockNextResponse(JSON.stringify(data), {
      ...init,
      headers
    });
  }

  static next() {
    const response = new MockNextResponse(null, { status: 200 });
    response._headers = new Headers();
    return response;
  }

  static redirect(url: string | URL, status = 307) {
    const response = new MockNextResponse(null, { status });
    response._headers = new Headers();
    response._headers.set('location', url.toString());
    return response;
  }

  private _headers: Headers;
  private _status: number;
  private _body: string | null;

  constructor(body?: BodyInit | null, init?: ResponseInit) {
    super(body || null, init);
    Object.setPrototypeOf(this, MockNextResponse.prototype);
    this._headers = new Headers(init?.headers);
    this._status = init?.status || 200;
    this._body = body?.toString() || null;
  }

  get headers() {
    return this._headers;
  }

  get status() {
    return this._status;
  }

  async text() {
    return this._body || '';
  }

  async json() {
    const text = await this.text();
    return text ? JSON.parse(text) : null;
  }
}

class MockNextRequest extends Request {
  readonly nextUrl: URL;
  readonly headers: Headers;
  readonly cookies: {
    get: (name: string) => { value: string | null } | undefined;
    getAll: () => Array<{ name: string; value: string }>;
    has: (name: string) => boolean;
    set: (name: string, value: string) => void;
    delete: (name: string) => void;
  };

  constructor(input: RequestInfo | URL, init?: RequestInit) {
    const url = typeof input === 'string' ? input : input instanceof URL ? input.href : input.url || 'http://localhost:3000';
    super(url, init);
    Object.setPrototypeOf(this, MockNextRequest.prototype);

    this.nextUrl = new URL(url);
    this.headers = new Headers(init?.headers);

    const cookieStore = new Map<string, string>();
    this.cookies = {
      get: (name) => {
        const value = cookieStore.get(name);
        return value ? { value } : undefined;
      },
      getAll: () => Array.from(cookieStore.entries()).map(([name, value]) => ({ name, value })),
      has: (name) => cookieStore.has(name),
      set: (name, value) => cookieStore.set(name, value),
      delete: (name) => cookieStore.delete(name)
    };
  }
}

// Mock Next.js
jest.mock('next/server', () => ({
  NextResponse: MockNextResponse,
  NextRequest: MockNextRequest
}));

// Mock environment variables
process.env = {
  ...process.env,
  LANGGRAPH_API_URL: 'https://api.example.com',
  LANGSMITH_API_KEY: 'test-api-key',
  AUTH0_SECRET: 'test-secret',
  AUTH0_BASE_URL: 'http://localhost:3000',
  AUTH0_ISSUER_BASE_URL: 'https://test.auth0.com',
  AUTH0_CLIENT_ID: 'test-client-id',
  AUTH0_CLIENT_SECRET: 'test-client-secret',
  NEXT_PUBLIC_MOCK_AUTH: 'true'
}; 
