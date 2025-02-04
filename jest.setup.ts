import '@testing-library/jest-dom';
import { Response, Request, Headers } from 'node-fetch';
import { ReadableStream, WritableStream, TransformStream } from 'stream/web';
import i18next from 'i18next';
import { initReactI18next } from 'react-i18next';

// Initialize i18next
i18next.use(initReactI18next).init({
  lng: 'en',
  fallbackLng: 'en',
  ns: ['common'],
  defaultNS: 'common',
  resources: {
    en: {
      common: {},
    },
  },
});

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
