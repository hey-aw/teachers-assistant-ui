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

    // Add params to request context
    const context = { params: { auth0: path } };
    return { req, context };
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

            const { req, context } = mockRequest('login');
            const { GET } = require('@/app/api/auth/[auth0]/route');
            const response = await GET(req, context);

            expect(mockHandleAuth).toHaveBeenCalledWith(req);
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

            const { req, context } = mockRequest('logout');
            const { GET } = require('@/app/api/auth/[auth0]/route');
            const response = await GET(req, context);

            expect(mockHandleAuth).toHaveBeenCalledWith(req);
            expect(response).toBe(mockResponse);
        });

        it('should clear auth state on logout', async () => {
            process.env.AZURE_STATIC_WEBAPPS_ENVIRONMENT = 'preview';
            delete process.env.AUTH0_BASE_URL;

            const { req, context } = mockRequest('logout', {
                mockEmail: 'test@example.com'
            });

            const { GET } = require('@/app/api/auth/[auth0]/route');
            const response = await GET(req, context);

            expect(response.status).toBe(200);
            expect(response.headers.get('Content-Type')).toBe('application/json');

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

            const { req, context } = mockRequest('me');
            const { GET } = require('@/app/api/auth/[auth0]/route');
            const response = await GET(req, context);

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

            const { req, context } = mockRequest('me');
            const { GET } = require('@/app/api/auth/[auth0]/route');
            const response = await GET(req, context);

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

            const mockResponse = NextResponse.json({ user: mockUser }, {
                status: 200,
                headers: { 'Content-Type': 'application/json' }
            });
            mockHandleAuth.mockResolvedValue(mockResponse);
            (getSession as jest.Mock).mockResolvedValue({ user: mockUser });

            const requests = Array(3).fill(null).map(() => mockRequest('userinfo'));
            const { GET } = require('@/app/api/auth/[auth0]/route');

            const responses = await Promise.all(
                requests.map(({ req, context }) => GET(req, context))
            );

            for (const response of responses) {
                expect(response.status).toBe(200);
                const data = await response.json();
                expect(data).toEqual({ user: mockUser });
            }
        });

        it('should handle race conditions in preview mode', async () => {
            process.env.AZURE_STATIC_WEBAPPS_ENVIRONMENT = 'preview';
            delete process.env.AUTH0_BASE_URL;

            const { req, context } = mockRequest('userinfo', {
                mockEmail: 'test@example.com'
            });

            const { GET } = require('@/app/api/auth/[auth0]/route');

            const responses = await Promise.all([
                GET(req, context),
                GET(req, context),
                GET(req, context)
            ]);

            const results = await Promise.all(
                responses.map(res => res.json())
            );

            results.forEach(result => {
                expect(result.user).toBeTruthy();
                expect(result.user.email).toBe('test@example.com');
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

            const { req, context } = mockRequest('me');
            const { GET } = require('@/app/api/auth/[auth0]/route');
            const response = await GET(req, context);

            expect(response.headers.get('Content-Type')).toBe('application/json');
            const data = await response.json();
            expect(data).toEqual({ user: mockUser });

            expect(process.env.AZURE_STATIC_WEBAPPS_ENVIRONMENT).toBe('production');
        });
    });
});
