import { NextRequest, NextResponse } from 'next/server';
import { GET, POST, PUT, PATCH, DELETE, OPTIONS } from '@/app/api/[..._path]/route';
import { getAccessToken } from '@auth0/nextjs-auth0/edge';

// Mock Auth0
jest.mock('@auth0/nextjs-auth0/edge', () => ({
    getAccessToken: jest.fn()
}));

// Mock environment variables
const MOCK_API_KEY = 'test-api-key';
const MOCK_API_URL = 'https://api.example.com';

beforeEach(() => {
    process.env.LANGSMITH_API_KEY = MOCK_API_KEY;
    process.env.LANGGRAPH_API_URL = MOCK_API_URL;
    process.env.AZURE_STATIC_WEBAPPS_ENVIRONMENT = 'preview';

    // Reset fetch mock
    global.fetch = jest.fn();

    // Setup default Auth0 mock
    (getAccessToken as jest.Mock).mockResolvedValue({ accessToken: 'mock-token' });
});

afterEach(() => {
    jest.resetAllMocks();
    delete process.env.LANGSMITH_API_KEY;
    delete process.env.LANGGRAPH_API_URL;
    delete process.env.AZURE_STATIC_WEBAPPS_ENVIRONMENT;
});

describe('API Route Handler', () => {
    describe('CORS Headers', () => {
        it('should include CORS headers in successful responses', async () => {
            const mockResponse = NextResponse.json({ test: true }, {
                status: 200,
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            (global.fetch as jest.Mock).mockResolvedValueOnce(mockResponse);

            const req = new NextRequest(new URL('http://localhost:3000/api/test'));
            const response = await GET(req);

            expect(response.headers.get('Access-Control-Allow-Origin')).toBe('*');
            expect(response.headers.get('Access-Control-Allow-Methods')).toBe('GET, POST, PUT, PATCH, DELETE, OPTIONS');
            expect(response.headers.get('Access-Control-Allow-Headers')).toBe('*');
        });

        it('should handle OPTIONS requests correctly', async () => {
            const response = await OPTIONS();

            expect(response.status).toBe(204);
            expect(response.headers.get('Access-Control-Allow-Origin')).toBe('*');
        });
    });

    describe('LangGraph Endpoints', () => {
        it('should create a thread correctly', async () => {
            console.log('Test environment variables:', {
                LANGSMITH_API_KEY: process.env.LANGSMITH_API_KEY,
                LANGGRAPH_API_URL: process.env.LANGGRAPH_API_URL,
                AZURE_STATIC_WEBAPPS_ENVIRONMENT: process.env.AZURE_STATIC_WEBAPPS_ENVIRONMENT
            });

            const mockResponse = NextResponse.json({ thread_id: 'test-thread' }, {
                status: 200,
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            (global.fetch as jest.Mock).mockResolvedValueOnce(mockResponse);

            const url = new URL('http://localhost:3000/api/threads');
            console.log('Test request URL:', url.toString());
            console.log('Test request pathname:', url.pathname);

            const req = new NextRequest(url);
            const response = await POST(req);
            const data = await response.json();
            console.log('Response data:', data);

            expect(response.status).toBe(200);
            expect(data.thread_id).toBe('test-thread');
            expect(global.fetch).toHaveBeenCalledWith(
                `${MOCK_API_URL}/threads`,
                expect.objectContaining({
                    method: 'POST',
                    headers: {
                        'X-Api-Key': MOCK_API_KEY,
                        'Content-Type': 'application/json'
                    }
                })
            );
        });

        it('should stream runs correctly', async () => {
            const mockResponse = new NextResponse('test-stream', {
                status: 200,
                headers: {
                    'Content-Type': 'text/event-stream'
                }
            });
            (global.fetch as jest.Mock).mockResolvedValueOnce(mockResponse);

            const req = new NextRequest(new URL('http://localhost:3000/api/runs/stream'));
            const response = await POST(req);

            expect(response.status).toBe(200);
            expect(global.fetch).toHaveBeenCalledWith(
                `${MOCK_API_URL}/runs/stream`,
                expect.objectContaining({
                    method: 'POST',
                    headers: {
                        'X-Api-Key': MOCK_API_KEY,
                        'Content-Type': 'application/json'
                    }
                })
            );
        });
    });

    describe('Error Handling', () => {
        it('should handle API errors with status codes', async () => {
            const mockResponse = NextResponse.json({ message: 'Resource not found' }, {
                status: 404,
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            (global.fetch as jest.Mock).mockResolvedValueOnce(mockResponse);

            const req = new NextRequest(new URL('http://localhost:3000/api/test'));
            const response = await GET(req);
            const data = await response.json();

            expect(response.status).toBe(404);
            expect(data.error).toBe('Resource not found');
        });

        it('should handle API errors without specific message', async () => {
            const mockResponse = NextResponse.json({}, {
                status: 400,
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            (global.fetch as jest.Mock).mockResolvedValueOnce(mockResponse);

            const req = new NextRequest(new URL('http://localhost:3000/api/test'));
            const response = await GET(req);
            const data = await response.json();

            expect(response.status).toBe(400);
            expect(data.error).toBe('API request failed');
        });

        it('should handle network errors', async () => {
            (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

            const req = new NextRequest(new URL('http://localhost:3000/api/test'));
            const response = await GET(req);
            const data = await response.json();

            expect(response.status).toBe(500);
            expect(data.error).toBe('Network error');
        });

        it('should handle missing API key', async () => {
            delete process.env.LANGSMITH_API_KEY;

            const req = new NextRequest(new URL('http://localhost:3000/api/test'));
            const response = await GET(req);

            expect(response.status).toBe(401);
            expect(await response.json()).toEqual(expect.objectContaining({
                error: expect.stringContaining('API key')
            }));
        });
    });

    describe('Query Parameter Handling', () => {
        it('should properly handle and forward query parameters', async () => {
            const mockResponse = NextResponse.json({ test: true }, {
                status: 200,
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            (global.fetch as jest.Mock).mockResolvedValueOnce(mockResponse);

            const testUrl = 'http://localhost:3000/api/test?a=1&b=2';
            const req = new NextRequest(new URL(testUrl));
            await GET(req);

            expect(global.fetch).toHaveBeenCalledWith(
                `${MOCK_API_URL}/test?a=1&b=2`,
                expect.any(Object)
            );
        });
    });

    describe('URL Handling', () => {
        it('should properly handle the request URL', async () => {
            const mockResponse = NextResponse.json({ test: true }, {
                status: 200,
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            (global.fetch as jest.Mock).mockResolvedValueOnce(mockResponse);

            // Create request with explicit URL string
            const testUrl = 'http://localhost:3000/api/test';
            const req = new NextRequest(new URL(testUrl));

            const response = await GET(req);
            expect(response.status).toBe(200);
            expect(global.fetch).toHaveBeenCalledWith(
                `${MOCK_API_URL}/test`,
                expect.any(Object)
            );
        });
    });
});
