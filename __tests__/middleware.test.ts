import { NextRequest, NextResponse, NextFetchEvent } from 'next/server';
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
    const mockEvent = {} as NextFetchEvent;

    beforeEach(() => {
        jest.resetModules();
        process.env = { ...originalEnv };
    });

    afterAll(() => {
        process.env = originalEnv;
    });

    describe('Preview Environment', () => {
        beforeEach(() => {
            process.env.NEXT_PUBLIC_MOCK_AUTH = 'true';
        });

        it('should redirect to mock-login when no cookie present', () => {
            const request = new NextRequest(new URL('http://localhost/protected/test'));
            const response = middleware(request, mockEvent);

            expect((response as NextResponse).status).toBe(307);
            expect((response as NextResponse).headers.get('location')).toBe('http://localhost/mock-login');
        });

        it('should allow access with valid mock user cookie', () => {
            const mockEmail = 'aw@eddolearning.com';
            const request = new NextRequest(new URL('http://localhost/protected/test'));

            // Set mock cookie
            request.cookies.set('mockEmail', mockEmail);

            const response = middleware(request, mockEvent);

            expect((response as NextResponse).status).toBe(200);
            expect((response as NextResponse).headers.get('x-auth-user')).toBe(
                JSON.stringify(getMockUser(mockEmail))
            );
        });

        it('should redirect to mock-login with invalid mock user', () => {
            const request = new NextRequest(new URL('http://localhost/protected/test'));

            // Set invalid mock cookie
            request.cookies.set('mockEmail', 'invalid@email.com');

            const response = middleware(request, mockEvent);

            expect((response as NextResponse).status).toBe(307);
            expect((response as NextResponse).headers.get('location')).toBe('http://localhost/mock-login');
        });
    });

    describe('Production Environment', () => {
        beforeEach(() => {
            process.env.NEXT_PUBLIC_MOCK_AUTH = 'false';
        });

        it('should use Auth0 middleware in production', () => {
            const request = new NextRequest(new URL('http://localhost/protected/test'));
            const response = middleware(request, mockEvent);

            expect(response).toBe(mockAuth0Response);
            expect((response as NextResponse).status).toBe(200);
        });
    });
}); 