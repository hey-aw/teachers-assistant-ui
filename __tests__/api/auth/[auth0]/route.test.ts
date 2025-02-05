import { NextRequest } from 'next/server';
import { GET } from '@/app/api/auth/[auth0]/route';
import { getMockUser } from '@/lib/mockAuth';

// Mock Auth0
jest.mock('@auth0/nextjs-auth0', () => ({
    handleAuth: jest.fn(() => async () => {
        console.log('[Test] Mock Auth0 handler called');
        return new Response(JSON.stringify({ user: { name: 'Auth0 User' } }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });
    })
}));

// Mock mockAuth
jest.mock('@/lib/mockAuth', () => ({
    getMockUser: jest.fn((email) => {
        console.log('[Test] getMockUser called with:', email);
        if (email === 'test@example.com') {
            return {
                email: 'test@example.com',
                name: 'Test User',
                email_verified: true
            };
        }
        console.log('[Test] getMockUser returning undefined for:', email);
        return undefined;
    })
}));

describe('Auth Route Handler', () => {
    const originalEnv = process.env;

    beforeEach(() => {
        console.log('\n[Test] ---- Starting new test ----');
        jest.clearAllMocks();
        process.env = { ...originalEnv };
    });

    afterAll(() => {
        process.env = originalEnv;
    });

    describe('Preview Environment', () => {
        beforeEach(() => {
            process.env.AZURE_STATIC_WEBAPPS_ENVIRONMENT = 'preview';
            process.env.AUTH0_BASE_URL = 'http://localhost:3000';
            console.log('[Test] Environment setup:', {
                AZURE_STATIC_WEBAPPS_ENVIRONMENT: process.env.AZURE_STATIC_WEBAPPS_ENVIRONMENT,
                AUTH0_BASE_URL: process.env.AUTH0_BASE_URL
            });
        });

        describe('/me endpoint', () => {
            it('should return mock user when valid mockEmail cookie exists', async () => {
                const headers = new Headers();
                headers.append('Cookie', 'mockEmail=test@example.com');
                const req = new NextRequest(`${process.env.AUTH0_BASE_URL}/api/auth/me`, {
                    headers
                });
                console.log('[Test] Request created with headers:', Object.fromEntries(req.headers.entries()));

                const response = await GET(req);
                const data = await response.json();
                console.log('[Test] Response received:', {
                    status: response.status,
                    data,
                    headers: Object.fromEntries(response.headers.entries())
                });

                expect(response.status).toBe(200);
                expect(data).toEqual({
                    user: {
                        email: 'test@example.com',
                        name: 'Test User',
                        email_verified: true
                    }
                });
                expect(getMockUser).toHaveBeenCalledWith('test@example.com');
            });

            it('should return null user when no mockEmail cookie exists', async () => {
                const req = new NextRequest(`${process.env.AUTH0_BASE_URL}/api/auth/me`);
                console.log('[Test] Request created without cookie');

                const response = await GET(req);
                const data = await response.json();
                console.log('[Test] Response received:', {
                    status: response.status,
                    data
                });

                expect(response.status).toBe(200);
                expect(data).toEqual({ user: null });
            });

            it('should return null user when invalid mockEmail cookie exists', async () => {
                const headers = new Headers();
                headers.append('Cookie', 'mockEmail=invalid@example.com');
                const req = new NextRequest(`${process.env.AUTH0_BASE_URL}/api/auth/me`, {
                    headers
                });
                console.log('[Test] Request created with invalid email:', {
                    headers: Object.fromEntries(req.headers.entries())
                });

                const response = await GET(req);
                const data = await response.json();
                console.log('[Test] Response received:', {
                    status: response.status,
                    data,
                    getMockUserCalls: jest.mocked(getMockUser).mock.calls
                });

                expect(response.status).toBe(200);
                expect(data).toEqual({ user: null });
                expect(getMockUser).toHaveBeenCalledWith('invalid@example.com');
            });
        });

        describe('/login endpoint', () => {
            it('should redirect to mock-login', async () => {
                const req = new NextRequest(`${process.env.AUTH0_BASE_URL}/api/auth/login`);
                const response = await GET(req);

                expect(response.status).toBe(307);
                expect(response.headers.get('Location')).toBe('/mock-login');
            });
        });

        describe('/logout endpoint', () => {
            it('should clear cookie and redirect to home', async () => {
                const req = new NextRequest(`${process.env.AUTH0_BASE_URL}/api/auth/logout`);
                const response = await GET(req);

                expect(response.status).toBe(307);
                expect(response.headers.get('Location')).toBe('/');

                const cookie = response.headers.get('Set-Cookie');
                expect(cookie).toContain('mockEmail=');
                expect(cookie).toContain('path=/');
                const expiresMatch = cookie?.match(/expires=([^;]+)/i);
                expect(expiresMatch).toBeTruthy();
                const expiresDate = new Date(expiresMatch![1]);
                expect(expiresDate.getTime()).toBeLessThan(new Date().getTime());
            });
        });
    });

    describe('Production Environment', () => {
        beforeEach(() => {
            process.env.AUTH0_BASE_URL = 'https://example.com';
            delete process.env.AZURE_STATIC_WEBAPPS_ENVIRONMENT;
            console.log('[Test] Production environment setup:', {
                AZURE_STATIC_WEBAPPS_ENVIRONMENT: process.env.AZURE_STATIC_WEBAPPS_ENVIRONMENT,
                AUTH0_BASE_URL: process.env.AUTH0_BASE_URL
            });
        });

        it('should use Auth0 handler', async () => {
            const req = new NextRequest(`${process.env.AUTH0_BASE_URL}/api/auth/me`);
            console.log('[Test] Production request created');

            const response = await GET(req);
            const data = await response.json();
            console.log('[Test] Production response received:', {
                status: response.status,
                data,
                headers: Object.fromEntries(response.headers.entries())
            });

            expect(response.status).toBe(200);
            expect(data).toEqual({ user: { name: 'Auth0 User' } });
        });

        it('should handle Auth0 errors', async () => {
            const { handleAuth } = require('@auth0/nextjs-auth0');
            handleAuth.mockImplementationOnce(() => async () => {
                throw new Error('Auth0 Error');
            });

            const req = new NextRequest(`${process.env.AUTH0_BASE_URL}/api/auth/me`);
            const response = await GET(req);
            const data = await response.json();

            expect(response.status).toBe(500);
            expect(data).toEqual({
                error: 'Auth0 Error',
                status: 'error'
            });
        });
    });
}); 