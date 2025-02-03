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

    // Reset fetch mock
    global.fetch = jest.fn();

    // Setup default Auth0 mock
    (getAccessToken as jest.Mock).mockResolvedValue({ accessToken: 'mock-token' });
});

afterEach(() => {
    jest.resetAllMocks();
    delete process.env.LANGSMITH_API_KEY;
    delete process.env.LANGGRAPH_API_URL;
});

describe('API Route Handler', () => {
    describe('CORS Headers', () => {
        it('should include CORS headers in successful responses', async () => {
            const mockResponse = new Response('test', {
                status: 200,
                headers: new Headers({
                    'Content-Type': 'application/json'
                })
            });
            (global.fetch as jest.Mock).mockResolvedValueOnce(mockResponse);

            const req = new NextRequest('http://localhost:3000/api/test');
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
            const mockResponse = new Response(JSON.stringify({ thread_id: 'test-thread' }), {
                status: 200,
                headers: new Headers({
                    'Content-Type': 'application/json'
                })
            });
            (global.fetch as jest.Mock).mockResolvedValueOnce(mockResponse);

            const req = new NextRequest('http://localhost:3000/api/threads', {
                method: 'POST',
                body: JSON.stringify({}),
            });
            const response = await POST(req);
            const data = await response.json();

            expect(response.status).toBe(200);
            expect(data.thread_id).toBe('test-thread');
            expect(global.fetch).toHaveBeenCalledWith(
                `${MOCK_API_URL}/threads`,
                expect.objectContaining({
                    method: 'POST',
                    headers: expect.objectContaining({
                        'X-Api-Key': MOCK_API_KEY
                    })
                })
            );
        });

        it('should stream runs correctly', async () => {
            const mockResponse = new Response('test-stream', {
                status: 200,
                headers: new Headers({
                    'Content-Type': 'text/event-stream'
                })
            });
            (global.fetch as jest.Mock).mockResolvedValueOnce(mockResponse);

            const req = new NextRequest('http://localhost:3000/api/runs/stream', {
                method: 'POST',
                body: JSON.stringify({}),
            });
            const response = await POST(req);

            expect(response.status).toBe(200);
            expect(global.fetch).toHaveBeenCalledWith(
                `${MOCK_API_URL}/runs/stream`,
                expect.objectContaining({
                    method: 'POST',
                    headers: expect.objectContaining({
                        'X-Api-Key': MOCK_API_KEY
                    })
                })
            );
        });

        it('should handle validation errors from stream runs', async () => {
            const mockResponse = new Response(
                JSON.stringify({
                    message: 'Invalid request parameters',
                    detail: 'Required field missing or invalid'
                }),
                {
                    status: 422,
                    headers: new Headers({
                        'Content-Type': 'application/json'
                    })
                }
            );
            (global.fetch as jest.Mock).mockResolvedValueOnce(mockResponse);

            const req = new NextRequest('http://localhost:3000/api/threads/123/runs/stream', {
                method: 'POST',
                body: JSON.stringify({}),
            });
            const response = await POST(req);
            const data = await response.json();

            expect(response.status).toBe(422);
            expect(data.error).toBe('Invalid request parameters');
        });
    });

    describe('Error Handling', () => {
        it('should handle API errors with status codes', async () => {
            const mockResponse = new Response(JSON.stringify({ message: 'Resource not found' }), {
                status: 404,
                headers: new Headers({
                    'Content-Type': 'application/json'
                })
            });
            (global.fetch as jest.Mock).mockResolvedValueOnce(mockResponse);

            const req = new NextRequest('http://localhost:3000/api/test');
            const response = await GET(req);
            const data = await response.json();

            expect(response.status).toBe(404);
            expect(data.error).toBe('Resource not found');
        });

        it('should handle API errors without specific message', async () => {
            const mockResponse = new Response(JSON.stringify({}), {
                status: 400,
                headers: new Headers({
                    'Content-Type': 'application/json'
                })
            });
            (global.fetch as jest.Mock).mockResolvedValueOnce(mockResponse);

            const req = new NextRequest('http://localhost:3000/api/test');
            const response = await GET(req);
            const data = await response.json();

            expect(response.status).toBe(400);
            expect(data.error).toBe('API request failed');
        });

        it('should handle network errors', async () => {
            (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

            const req = new NextRequest('http://localhost:3000/api/test');
            const response = await GET(req);
            const data = await response.json();

            expect(response.status).toBe(500);
            expect(data.error).toBe('Network error');
        });

        it('should handle missing API key', async () => {
            delete process.env.LANGSMITH_API_KEY;

            const req = new NextRequest('http://localhost:3000/api/test');
            const response = await GET(req);

            expect(response.status).toBe(401);
            expect(await response.json()).toEqual(expect.objectContaining({
                error: expect.stringContaining('API key')
            }));
        });

        it('should handle missing auth token', async () => {
            (getAccessToken as jest.Mock).mockResolvedValueOnce({ accessToken: null });

            const req = new NextRequest('http://localhost:3000/api/test');
            const response = await GET(req);

            expect(response.status).toBe(401);
            expect(await response.json()).toEqual(expect.objectContaining({
                error: expect.stringContaining('Unauthorized')
            }));
        });
    });

    describe('Query Parameter Handling', () => {
        it('should properly handle and forward query parameters', async () => {
            const mockResponse = new Response('test', {
                status: 200,
                headers: new Headers({
                    'Content-Type': 'application/json'
                })
            });
            (global.fetch as jest.Mock).mockResolvedValueOnce(mockResponse);

            const req = new NextRequest('http://localhost:3000/api/test?a=1&b=2');
            await GET(req);

            expect(global.fetch).toHaveBeenCalledWith(
                `${MOCK_API_URL}/test?a=1&b=2`,
                expect.any(Object)
            );
        });
    });
});
