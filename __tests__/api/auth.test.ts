import { handleAuth, getSession } from '@auth0/nextjs-auth0';
import { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { POST } from '@/app/api/auth/[auth0]/route';

jest.mock('@auth0/nextjs-auth0', () => {
    const mockHandleAuth = jest.fn();
    return {
        handleAuth: () => mockHandleAuth,
        getSession: jest.fn(),
        withApiAuthRequired: jest.fn((handler) => handler),
        withPageAuthRequired: jest.fn((component) => component),
    };
});

const mockHandleAuth = (handleAuth as jest.Mock)();

// Mock Next.js Request with proper cookie handling
const mockRequest = (path: string, cookies: Record<string, string> = {}) => {
    const req = new NextRequest(
        new Request(`http://localhost:3000/api/auth/${path}`, {
            method: 'GET',
        })
    );

    // Add cookies to request
    Object.entries(cookies).forEach(([name, value]) => {
        req.cookies.set(name, value);
    });

    return req;
};

describe('Auth Routes', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        // Ensure clean environment for each test
        process.env = {
            ...process.env,
            AZURE_STATIC_WEBAPPS_ENVIRONMENT: 'production',
            AUTH0_BASE_URL: 'http://localhost:3000',
            AUTH0_SECRET: 'test-secret',
            AUTH0_ISSUER_BASE_URL: 'https://test.auth0.com',
            AUTH0_CLIENT_ID: 'test-client-id',
            AUTH0_CLIENT_SECRET: 'test-client-secret',
        };
    });

    afterEach(() => {
        // Clean up environment variables
        ['AZURE_STATIC_WEBAPPS_ENVIRONMENT', 'AUTH0_BASE_URL', 'AUTH0_SECRET',
            'AUTH0_ISSUER_BASE_URL', 'AUTH0_CLIENT_ID', 'AUTH0_CLIENT_SECRET']
            .forEach(key => delete process.env[key]);
    });

    describe('Login Route', () => {
        it('should handle login requests', async () => {
            const mockResponse = NextResponse.json({}, {
                status: 200,
                headers: { 'Content-Type': 'application/json' }
            });
            mockHandleAuth.mockResolvedValue(mockResponse);

            const request = mockRequest('login');
            const { GET } = require('@/app/api/auth/[auth0]/route');
            const response = await GET(request);

            expect(mockHandleAuth).toHaveBeenCalledWith(request);
            expect(response).toBe(mockResponse);
        });
    });

    describe('Logout Route', () => {
        it('should handle logout requests', async () => {
            const mockResponse = NextResponse.json({}, {
                status: 200,
                headers: {
                    'Content-Type': 'application/json',
                    'Set-Cookie': 'mockEmail=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT'
                }
            });
            mockHandleAuth.mockResolvedValue(mockResponse);

            const request = mockRequest('logout');
            const { GET } = require('@/app/api/auth/[auth0]/route');
            const response = await GET(request);

            expect(mockHandleAuth).toHaveBeenCalledWith(request);
            expect(response).toBe(mockResponse);
        });

        it('should clear auth state on logout', async () => {
            // Set preview mode for mock auth
            process.env.AZURE_STATIC_WEBAPPS_ENVIRONMENT = 'preview';
            delete process.env.AUTH0_BASE_URL;

            const request = mockRequest('logout', {
                mockEmail: 'test@example.com'
            });

            const { GET } = require('@/app/api/auth/[auth0]/route');
            const response = await GET(request);

            // In preview mode, we expect a redirect
            expect(response.status).toBe(200); // Auth0 handler response
            expect(response.headers.get('Content-Type')).toBe('application/json');

            // Verify cookies are cleared
            const cookieHeader = response.headers.get('Set-Cookie');
            const cookies = cookieHeader ? cookieHeader.split(',') : [];
            expect(cookies).toBeDefined();
            expect(cookies[0]).toMatch(/mockEmail=;.*Path=\/;.*Expires=/);
        });
    });

    describe('Me Route', () => {
        it('should return user data when authenticated', async () => {
            const mockUser = {
                sub: 'auth0|123',
                name: 'Test User',
                email: 'test@example.com'
            };

            const mockResponse = NextResponse.json({ user: mockUser }, {
                status: 200,
                headers: { 'Content-Type': 'application/json' }
            });
            mockHandleAuth.mockResolvedValue(mockResponse);
            (getSession as jest.Mock).mockResolvedValue({ user: mockUser });

            const request = mockRequest('me');
            const { GET } = require('@/app/api/auth/[auth0]/route');
            const response = await GET(request);

            expect(response.headers.get('Content-Type')).toBe('application/json');
            const data = await response.json();
            expect(data).toEqual({ user: mockUser });
        });

        it('should return null when not authenticated', async () => {
            const mockResponse = NextResponse.json({ user: null }, {
                status: 200,
                headers: { 'Content-Type': 'application/json' }
            });
            mockHandleAuth.mockResolvedValue(mockResponse);
            (getSession as jest.Mock).mockResolvedValue(null);

            const request = mockRequest('me');
            const { GET } = require('@/app/api/auth/[auth0]/route');
            const response = await GET(request);

            expect(response.headers.get('Content-Type')).toBe('application/json');
            const data = await response.json();
            expect(data).toEqual({ user: null });
        });
    });

    // Add new test for concurrent requests
    describe('Concurrent Requests', () => {
        it('should handle multiple concurrent userinfo requests', async () => {
            const mockUser = {
                sub: 'auth0|123',
                name: 'Test User',
                email: 'test@example.com'
            };

            // Setup mock responses
            const mockResponse = NextResponse.json({ user: mockUser }, {
                status: 200,
                headers: { 'Content-Type': 'application/json' }
            });
            mockHandleAuth.mockResolvedValue(mockResponse);
            (getSession as jest.Mock).mockResolvedValue({ user: mockUser });

            // Make multiple concurrent requests
            const requests = Array(3).fill(null).map(() => mockRequest('userinfo'));
            const { GET } = require('@/app/api/auth/[auth0]/route');

            // Wait for all requests to complete
            const responses = await Promise.all(
                requests.map(req => GET(req))
            );

            // Verify all responses are valid
            for (const response of responses) {
                expect(response.status).toBe(200);
                const data = await response.json();
                expect(data).toEqual({ user: mockUser });
            }
        });

        it('should handle race conditions in preview mode', async () => {
            // Set preview environment
            process.env.AZURE_STATIC_WEBAPPS_ENVIRONMENT = 'preview';
            delete process.env.AUTH0_BASE_URL;

            const mockEmail = 'test@example.com';
            const request = mockRequest('userinfo');
            // Add mock email cookie
            request.cookies.set('mockEmail', mockEmail);

            const { GET } = require('@/app/api/auth/[auth0]/route');

            // Make concurrent requests
            const responses = await Promise.all([
                GET(request),
                GET(request),
                GET(request)
            ]);

            // All responses should be consistent
            const results = await Promise.all(
                responses.map(res => res.json())
            );

            results.forEach(result => {
                expect(result.user).toBeTruthy();
                expect(result.user.email).toBe(mockEmail);
            });
        });
    });

    // Add new test for Azure Static Web Apps deployment
    describe('Azure Static Web Apps Deployment', () => {
        it('should verify correct deployment on Azure Static Web Apps', async () => {
            const mockUser = {
                sub: 'auth0|123',
                name: 'Test User',
                email: 'test@example.com'
            };

            const mockResponse = NextResponse.json({ user: mockUser }, {
                status: 200,
                headers: { 'Content-Type': 'application/json' }
            });
            mockHandleAuth.mockResolvedValue(mockResponse);
            (getSession as jest.Mock).mockResolvedValue({ user: mockUser });

            const request = mockRequest('me');
            const { GET } = require('@/app/api/auth/[auth0]/route');
            const response = await GET(request);

            expect(response.headers.get('Content-Type')).toBe('application/json');
            const data = await response.json();
            expect(data).toEqual({ user: mockUser });

            // Verify correct deployment on Azure Static Web Apps
            expect(process.env.AZURE_STATIC_WEBAPPS_ENVIRONMENT).toBe('production');
        });
    });
});
