import { Response } from 'node-fetch';

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

            const request = mockRequest('login');
            const { GET } = require('@/app/api/auth/[auth0]/route');
            const response = await GET(request);

            expect(response).toBe(mockResponse);
        });
    });

    describe('Logout Route', () => {
        it('should handle logout requests', async () => {
            const mockResponse = new Response('', {
                headers: { 'Content-Type': 'application/json' }
            });

            const request = mockRequest('logout');
            const { GET } = require('@/app/api/auth/[auth0]/route');
            const response = await GET(request);

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

            const request = mockRequest('me');
            const { GET } = require('@/app/api/auth/[auth0]/route');
            const response = await GET(request);

            expect(response.headers.get('Content-Type')).toBe('application/json');
            const data = await response.clone().json();
            expect(data).toEqual({ user: null });
        });

    });
});
