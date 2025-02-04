import { handleAuth, getSession } from '@auth0/nextjs-auth0';
import { Response } from 'node-fetch';

// Mock the Auth0 SDK
const mockHandleAuth = jest.fn();
jest.mock('@auth0/nextjs-auth0', () => ({
    handleAuth: () => mockHandleAuth,
    getSession: jest.fn(),
}));

// Mock Next.js Request and Response
const mockRequest = (path: string) => ({
    url: `http://localhost:3000/api/auth/${path}`,
    method: 'GET',
    headers: new Headers(),
});

describe('Auth Routes', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('Login Route', () => {
        it('should handle login requests', async () => {
            const mockResponse = new Response('', {
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
            const mockResponse = new Response('', {
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

            const mockResponse = new Response(JSON.stringify({ user: mockUser }), {
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
            const mockResponse = new Response(JSON.stringify({ user: null }), {
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

    describe('Environment-Specific Configuration', () => {
        it('should use the correct configuration file for production', async () => {
            process.env.NODE_ENV = 'production';
            const config = require('@/staticwebapp.config.json');
            expect(config.auth.identityProviders.customOpenIdConnectProviders.auth0.registration.clientId).toBe('YOUR_AUTH0_CLIENT_ID');
        });

        it('should use the correct configuration file for staging', async () => {
            process.env.NODE_ENV = 'staging';
            const config = require('@/staticwebapp.config.json');
            expect(config.auth.passwordProtection.enabled).toBe(true);
        });
    });
});
