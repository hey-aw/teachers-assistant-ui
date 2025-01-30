import { NextRequest, NextResponse } from 'next/server';
import { GET, POST, PUT, PATCH, DELETE, OPTIONS } from '@/app/api/[..._path]/route';

// Mock environment variables
const MOCK_API_KEY = 'test-api-key';
const MOCK_API_URL = 'https://api.example.com';

beforeEach(() => {
    process.env.LANGCHAIN_API_KEY = MOCK_API_KEY;
    process.env.LANGGRAPH_API_URL = MOCK_API_URL;

    // Reset fetch mock
    global.fetch = jest.fn();
});

afterEach(() => {
    jest.resetAllMocks();
});

describe('API Route Handler', () => {
    describe('CORS Headers', () => {
        it('should include CORS headers in successful responses', async () => {
            const mockResponse = new Response('test', { status: 200 });
            (global.fetch as jest.Mock).mockResolvedValueOnce(mockResponse);

            const req = new NextRequest('http://localhost:3000/api/test');
            const response = await GET(req);

            expect(response.headers.get('Access-Control-Allow-Origin')).toBe('*');
            expect(response.headers.get('Access-Control-Allow-Methods')).toBe('GET, POST, PUT, PATCH, DELETE, OPTIONS');
            expect(response.headers.get('Access-Control-Allow-Headers')).toBe('*');
        });

        it('should handle OPTIONS requests correctly', async () => {
            const req = new NextRequest('http://localhost:3000/api/test');
            const response = await OPTIONS(req);

            expect(response.status).toBe(204);
            expect(response.headers.get('Access-Control-Allow-Origin')).toBe('*');
        });
    });

    describe('Request Handling', () => {
        it('should forward GET requests with correct headers and path', async () => {
            const mockResponse = new Response('test data', { status: 200 });
            (global.fetch as jest.Mock).mockResolvedValueOnce(mockResponse);

            const req = new NextRequest('http://localhost:3000/api/test?param=value');
            await GET(req);

            expect(global.fetch).toHaveBeenCalledWith(
                `${MOCK_API_URL}/test?param=value`,
                expect.objectContaining({
                    method: 'GET',
                    headers: expect.objectContaining({
                        'x-api-key': MOCK_API_KEY,
                    }),
                })
            );
        });

        it('should forward POST requests with body', async () => {
            const mockResponse = new Response('test data', { status: 201 });
            (global.fetch as jest.Mock).mockResolvedValueOnce(mockResponse);
            const requestBody = JSON.stringify({ test: 'data' });

            const req = new NextRequest('http://localhost:3000/api/test', {
                method: 'POST',
                body: requestBody,
            });
            await POST(req);

            expect(global.fetch).toHaveBeenCalledWith(
                `${MOCK_API_URL}/test`,
                expect.objectContaining({
                    method: 'POST',
                    body: requestBody,
                    headers: expect.objectContaining({
                        'x-api-key': MOCK_API_KEY,
                    }),
                })
            );
        });
    });

    describe('Error Handling', () => {
        it('should handle API errors with status codes', async () => {
            const errorResponse = new Response('Not Found', { status: 404 });
            (global.fetch as jest.Mock).mockResolvedValueOnce(errorResponse);

            const req = new NextRequest('http://localhost:3000/api/test');
            const response = await GET(req);

            expect(response.status).toBe(404);
        });

        it('should handle network errors', async () => {
            (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

            const req = new NextRequest('http://localhost:3000/api/test');
            const response = await GET(req);
            const data = await response.json();

            expect(response.status).toBe(500);
            expect(data.error).toBe('Network error');
        });
    });

    describe('Query Parameter Handling', () => {
        it('should properly handle and forward query parameters', async () => {
            const mockResponse = new Response('test data', { status: 200 });
            (global.fetch as jest.Mock).mockResolvedValueOnce(mockResponse);

            const req = new NextRequest('http://localhost:3000/api/test?a=1&b=2&_path=test&nxtP_path=test');
            await GET(req);

            expect(global.fetch).toHaveBeenCalledWith(
                `${MOCK_API_URL}/test?a=1&b=2`,
                expect.any(Object)
            );
        });
    });
}); 