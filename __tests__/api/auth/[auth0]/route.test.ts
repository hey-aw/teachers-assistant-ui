import { MockNextRequest } from '@/__tests__/lib/mockRequest';
import { GET } from '@/app/api/auth/[auth0]/route';
import { getMockUser } from '@/lib/mockAuth';
import { NextRequest } from 'next/server';

jest.mock('@/lib/mockAuth');

describe.skip('Auth Route Handler', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('Preview Environment', () => {
        beforeEach(() => {
            process.env.NEXT_PUBLIC_MOCK_AUTH = 'true';
        });

        describe('Performance', () => {
            it('should respond quickly without auth', async () => {
                const request = new NextRequest('http://localhost:3000/api/auth/userinfo');
                const start = Date.now();
                await GET(request);
                const duration = Date.now() - start;
                expect(duration).toBeLessThan(100);
            });

            it('should respond reasonably fast with auth', async () => {
                const request = new NextRequest('http://localhost:3000/api/auth/userinfo');
                const cookies = new Map([['mockEmail', 'aw@eddolearning.com']]);
                Object.defineProperty(request, 'cookies', {
                    get: () => cookies
                });
                const mockUser = { email: 'aw@eddolearning.com', email_verified: true, name: 'AW' };
                (getMockUser as jest.Mock).mockReturnValue(mockUser);
                const start = Date.now();
                const response = await GET(request);
                const duration = Date.now() - start;
                expect(duration).toBeLessThan(300);
            });
        });

        describe('Header Handling', () => {
            it('should handle browser headers', async () => {
                const request = new NextRequest('http://localhost:3000/api/auth/userinfo');
                request.headers.set('accept', '*/*');
                request.headers.set('accept-encoding', 'gzip, deflate, br, zstd');
                request.headers.set('accept-language', 'en-US,en;q=0.5');
                request.headers.set('connection', 'keep-alive');
                request.headers.set('dnt', '1');
                request.headers.set('sec-fetch-dest', 'empty');
                request.headers.set('sec-fetch-mode', 'cors');
                request.headers.set('sec-fetch-site', 'same-origin');
                request.headers.set('sec-gpc', '1');
                request.headers.set('user-agent', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:134.0) Gecko/20100101 Firefox/134.0');

                const response = await GET(request);
                expect(response.status).toBe(200);
            });

            it('should handle curl headers', async () => {
                const request = new NextRequest('http://localhost:3000/api/auth/userinfo');
                request.headers.set('accept', 'application/json');
                request.headers.set('user-agent', 'curl/8.7.1');
                request.headers.set('host', 'localhost:3000');

                const response = await GET(request);
                expect(response.status).toBe(200);
            });
        });

        describe('Cookie Handling', () => {
            it('should handle multiple cookies', async () => {
                const request = new NextRequest('http://localhost:3000/api/auth/userinfo');
                const cookies = {
                    getAll: () => [
                        { name: 'wp-settings-time-1', value: '1737998052' },
                        { name: 'mockEmail', value: 'aw@eddolearning.com' }
                    ],
                    get: (name: string) => cookies.getAll().find(c => c.name === name)?.value
                };
                Object.defineProperty(request, 'cookies', {
                    get: () => cookies
                });

                const mockUser = { email: 'aw@eddolearning.com', email_verified: true, name: 'AW' };
                (getMockUser as jest.Mock).mockReturnValue(mockUser);

                const response = await GET(request);
                const data = await response.json();

                expect(response.status).toBe(200);
                expect(data.user).toEqual(mockUser);
            });

            it('should handle URL encoded email addresses', async () => {
                const request = new NextRequest('http://localhost:3000/api/auth/userinfo');
                const cookies = {
                    getAll: () => [{ name: 'mockEmail', value: 'aw%40eddolearning.com' }],
                    get: (name: string) => cookies.getAll().find(c => c.name === name)?.value
                };
                Object.defineProperty(request, 'cookies', {
                    get: () => cookies
                });

                const mockUser = { email: 'aw@eddolearning.com', email_verified: true, name: 'AW' };
                (getMockUser as jest.Mock).mockReturnValue(mockUser);

                const response = await GET(request);
                const data = await response.json();

                expect(response.status).toBe(200);
                expect(data.user.email).toBe('aw@eddolearning.com');
            });
        });

        describe('Debug Logging', () => {
            let consoleLog: jest.SpyInstance;

            beforeEach(() => {
                consoleLog = jest.spyOn(console, 'log');
            });

            afterEach(() => {
                consoleLog.mockRestore();
            });

            it('should log environment checks', async () => {
                const request = new MockNextRequest('http://localhost:3000/api/auth/userinfo');
                await GET(request as unknown as NextRequest);

                expect(consoleLog).toHaveBeenCalledWith(
                    '[Auth] Environment check:',
                    expect.objectContaining({
                        NEXT_PUBLIC_MOCK_AUTH: 'true',
                        AUTH0_BASE_URL: expect.any(String),
                        isPreview: true,
                        timestamp: expect.any(String)
                    })
                );
            });

            it('should log debug info for authenticated requests', async () => {
                const request = new MockNextRequest('http://localhost:3000/api/auth/userinfo');
                request.cookies.set('mockEmail', 'aw@eddolearning.com');

                const mockUser = { email: 'aw@eddolearning.com', email_verified: true, name: 'AW' };
                (getMockUser as jest.Mock).mockReturnValue(mockUser);

                await GET(request as unknown as NextRequest);

                expect(consoleLog).toHaveBeenCalledWith(
                    expect.stringMatching(/\[Auth .*\] Mock auth debug:/),
                    expect.objectContaining({
                        pathname: '/api/auth/userinfo',
                        mockEmail: 'aw@eddolearning.com',
                        hasEmailCookie: true,
                        cookieValue: expect.any(Object),
                        allCookies: expect.any(Object)
                    })
                );
            });
        });

        describe('/login endpoint', () => {
            it('should set cookie and redirect to dashboard', async () => {
                const request = new MockNextRequest('http://localhost:3000/api/auth/login');
                const response = await GET(request as unknown as NextRequest);

                expect(response.status).toBe(302);
                expect(response.headers.get('Location')).toBe('/protected/dashboard');
                const cookie = response.cookies.get('mockEmail');
                expect(cookie).toBeDefined();
            });
        });

        describe('/logout endpoint', () => {
            it('should clear cookie and redirect to home', async () => {
                const request = new MockNextRequest('http://localhost:3000/api/auth/logout');
                request.cookies.set('mockEmail', 'test@example.com');

                const response = await GET(request as unknown as NextRequest);

                expect(response.status).toBe(302);
                expect(response.headers.get('Location')).toBe('/');
                const cookie = response.cookies.get('mockEmail');
                expect(cookie?.value).toBe('');
                expect(cookie?.options?.expires.getTime()).toBeLessThan(Date.now());
            });
        });

        describe('/userinfo endpoint', () => {
            it('should return user info from cookie', async () => {
                const request = new MockNextRequest('http://localhost:3000/api/auth/userinfo');
                request.cookies.set('mockEmail', 'test@example.com');

                const mockUser = { name: 'Test User', email: 'test@example.com' };
                (getMockUser as jest.Mock).mockReturnValue(mockUser);

                const response = await GET(request as unknown as NextRequest);
                const data = await response.json();

                expect(response.status).toBe(200);
                expect(data).toEqual({ user: mockUser });
                expect(getMockUser).toHaveBeenCalledWith('test@example.com');
            });

            it('should return null when no cookie is set', async () => {
                const request = new MockNextRequest('http://localhost:3000/api/auth/userinfo');

                const response = await GET(request as unknown as NextRequest);
                const data = await response.json();

                expect(response.status).toBe(200);
                expect(data).toEqual({ user: null });
            });
        });
    });

    describe('Production Environment', () => {
        beforeEach(() => {
            process.env.NEXT_PUBLIC_MOCK_AUTH = 'false';
            process.env.AUTH0_BASE_URL = 'https://example.com';
        });

        it('should use Auth0 handler', async () => {
            const request = new MockNextRequest('http://localhost:3000/api/auth/login');

            const response = await GET(request as unknown as NextRequest);

            expect(response.status).toBe(200);
            expect(response.headers.get('Location')).toBe('https://example.com/api/auth/login');
        });
    });
}); 