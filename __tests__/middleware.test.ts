import { NextRequest, NextResponse, NextFetchEvent } from 'next/server';
import middleware from '@/middleware';
import { getMockUser } from '@/lib/mockAuth';

const mockAuth0Response = new NextResponse(null, { status: 200 });

// Mock the auth0 middleware
jest.mock('@auth0/nextjs-auth0/edge', () => ({
    withMiddlewareAuthRequired: () => {
        return () => mockAuth0Response;
    },
}));

describe('Middleware', () => {
    const originalEnv = process.env;
    const mockEvent = {} as NextFetchEvent;

    beforeEach(() => {
        jest.resetModules();
        process.env = { ...originalEnv };
    });

    afterAll(() => {
        process.env = originalEnv;
    });

    describe('Production Environment', () => {
        beforeEach(() => {
            process.env.AUTH0_BASE_URL = 'https://example.com';
        });

        it('should use Auth0 middleware in production', async () => {
            const request = new NextRequest(new URL('http://localhost/protected/test'));
            const response = await middleware(request);
            expect(response).toBe(mockAuth0Response);
            expect((response as NextResponse).status).toBe(200);
        });
    });

    describe('Azure Static Web Apps Preview Deployment', () => {
        beforeEach(() => {
            process.env.NEXT_PUBLIC_SWA_APP_ENV_IS_PREVIEW = 'true';
        });

        it('should have correct deployment for Azure Static Web Apps', async () => {
            const request = new NextRequest(new URL('http://localhost/protected/test'));
            const response = await middleware(request);
            expect(response).toBe(mockAuth0Response);
            expect((response as NextResponse).status).toBe(200);
            expect(process.env.NEXT_PUBLIC_SWA_APP_ENV_IS_PREVIEW).toBe('true');
        });
    });
});
