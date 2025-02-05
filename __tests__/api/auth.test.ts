import { handleAuth, getSession } from '@auth0/nextjs-auth0';
import { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

// Mock the Auth0 SDK
const mockHandleAuth = jest.fn();
jest.mock('@auth0/nextjs-auth0', () => ({
    handleAuth: () => mockHandleAuth,
    getSession: jest.fn(),
}));

// Mock Next.js Request
const mockRequest = (path: string) => new NextRequest(
    new Request(`http://localhost:3000/api/auth/${path}`, {
        method: 'GET',
    })
);

describe('Auth Routes', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        // Set environment variables to ensure we're not in preview mode
        process.env.AZURE_STATIC_WEBAPPS_ENVIRONMENT = 'production';
        process.env.AUTH0_BASE_URL = 'http://localhost:3000';
    });

    afterEach(() => {
        // Clean up environment variables
        delete process.env.AZURE_STATIC_WEBAPPS_ENVIRONMENT;
        delete process.env.AUTH0_BASE_URL;
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
                headers: { 'Content-Type': 'application/json' }
            });
            mockHandleAuth.mockResolvedValue(mockResponse);

            const request = mockRequest('logout');
            const { GET } = require('@/app/api/auth/[auth0]/route');
            const response = await GET(request);

            expect(mockHandleAuth).toHaveBeenCalledWith(request);
            expect(response).toBe(mockResponse);
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
            const data = await response.clone().json();
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
            const data = await response.clone().json();
            expect(data).toEqual({ user: null });
        });
    });
});
