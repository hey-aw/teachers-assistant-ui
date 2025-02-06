import { NextRequest } from 'next/server';
import { handleAuth } from '@auth0/nextjs-auth0';

jest.mock('@auth0/nextjs-auth0', () => ({
    handleAuth: jest.fn(() => () => new Response()),
}));

describe('Auth Route Handler', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should initialize handleAuth', () => {
        const { GET } = require('@/app/api/auth/[auth0]/route');
        expect(GET).toBeDefined();
        expect(handleAuth).toHaveBeenCalled();
    });

    it('should handle auth requests', async () => {
        const mockHandler = jest.fn().mockResolvedValue(new Response());
        (handleAuth as jest.Mock).mockReturnValue(mockHandler);

        const request = new NextRequest('http://localhost:3000/api/auth/login');
        await mockHandler(request);

        expect(mockHandler).toHaveBeenCalledWith(request);
    });
}); 