import { NextRequest, NextResponse } from 'next/server';
import { middleware } from '@/middleware';
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

    beforeEach(() => {
        jest.resetModules();
        process.env = { ...originalEnv };
    });

    afterAll(() => {
        process.env = originalEnv;
    });

    describe('Preview Environment', () => {
        beforeEach(() => {
            process.env.AZURE_STATIC_WEBAPPS_ENVIRONMENT = 'preview';
        });

        it('should redirect to mock-login when no cookie present', () => {
            const request = new NextRequest(new URL('http://localhost/protected/test'));
            const response = middleware(request);

            expect(response.status).toBe(307); // Temporary redirect
            expect(response.headers.get('location')).toBe('http://localhost/mock-login');
        });

        it('should allow access with valid mock user cookie', () => {
            const mockEmail = 'aw@eddolearning.com';
            const request = new NextRequest(new URL('http://localhost/protected/test'));

            // Set mock cookie
            request.cookies.set('mockEmail', mockEmail);

            const response = middleware(request);

            expect(response.status).toBe(200);
            expect(response.headers.get('x-auth-user')).toBe(
                JSON.stringify(getMockUser(mockEmail))
            );
        });

        it('should redirect to mock-login with invalid mock user', () => {
            const request = new NextRequest(new URL('http://localhost/protected/test'));

            // Set invalid mock cookie
            request.cookies.set('mockEmail', 'invalid@email.com');

            const response = middleware(request);

            expect(response.status).toBe(307);
            expect(response.headers.get('location')).toBe('http://localhost/mock-login');
        });
    });

    describe('Production Environment', () => {
        beforeEach(() => {
            process.env.AZURE_STATIC_WEBAPPS_ENVIRONMENT = 'production';
            process.env.AUTH0_BASE_URL = 'https://example.com';
        });

        it('should use Auth0 middleware in production', () => {
            const request = new NextRequest(new URL('http://localhost/protected/test'));
            const response = middleware(request);

            expect(response).toBe(mockAuth0Response);
            expect(response.status).toBe(200);
        });
    });
}); 