import { NextRequest, NextResponse } from 'next/server';
import middleware from '../middleware';
import { withMiddlewareAuthRequired } from '@auth0/nextjs-auth0/edge';

// Mock the auth0 middleware
jest.mock('@auth0/nextjs-auth0/edge', () => ({
    withMiddlewareAuthRequired: jest.fn(() => (req: NextRequest) => {
        return NextResponse.next();
    }),
}));

describe('Middleware', () => {
    const originalEnv = process.env;

    beforeEach(() => {
        jest.clearAllMocks();
        process.env = { ...originalEnv };
    });

    afterAll(() => {
        process.env = originalEnv;
    });

    const createMockRequest = (path: string) => {
        return new NextRequest(new URL(`http://localhost:3000${path}`));
    };

    describe('API routes in preview mode', () => {
        beforeEach(() => {
            process.env.AZURE_STATIC_WEBAPPS_ENVIRONMENT = 'preview';
            delete process.env.AUTH0_BASE_URL;
        });

        it('should skip auth for API routes in preview mode', async () => {
            const request = createMockRequest('/api/test');
            await middleware(request, {} as any);
            expect(withMiddlewareAuthRequired).not.toHaveBeenCalled();
        });

        it('should still protect /protected routes in preview mode', async () => {
            const request = createMockRequest('/protected/dashboard');
            await middleware(request, {} as any);
            expect(withMiddlewareAuthRequired).toHaveBeenCalled();
        });
    });

    describe('API routes in production mode', () => {
        beforeEach(() => {
            process.env.AZURE_STATIC_WEBAPPS_ENVIRONMENT = 'production';
            process.env.AUTH0_BASE_URL = 'http://example.com';
        });

        it('should require auth for API routes in production mode', async () => {
            const request = createMockRequest('/api/test');
            await middleware(request, {} as any);
            expect(withMiddlewareAuthRequired).toHaveBeenCalled();
        });

        it('should protect /protected routes in production mode', async () => {
            const request = createMockRequest('/protected/dashboard');
            await middleware(request, {} as any);
            expect(withMiddlewareAuthRequired).toHaveBeenCalled();
        });
    });

    describe('LangGraph routes', () => {
        it('should skip auth for /threads routes', async () => {
            const request = createMockRequest('/threads/123');
            await middleware(request, {} as any);
            expect(withMiddlewareAuthRequired).not.toHaveBeenCalled();
        });

        it('should skip auth for /stream routes', async () => {
            const request = createMockRequest('/stream/123');
            await middleware(request, {} as any);
            expect(withMiddlewareAuthRequired).not.toHaveBeenCalled();
        });

        it('should skip auth for /api/threads routes', async () => {
            const request = createMockRequest('/api/threads');
            await middleware(request, {} as any);
            expect(withMiddlewareAuthRequired).not.toHaveBeenCalled();
        });

        it('should skip auth for /api/runs/stream routes', async () => {
            const request = createMockRequest('/api/runs/stream');
            await middleware(request, {} as any);
            expect(withMiddlewareAuthRequired).not.toHaveBeenCalled();
        });
    });
});
