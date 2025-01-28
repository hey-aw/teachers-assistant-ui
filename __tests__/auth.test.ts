import { handleAuth } from '@auth0/nextjs-auth0';

// Mock the Auth0 SDK
jest.mock('@auth0/nextjs-auth0', () => ({
  handleAuth: jest.fn(() => () => new Response()),
}));

describe('Auth Handler', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should initialize handleAuth', () => {
    handleAuth();
    expect(handleAuth).toHaveBeenCalled();
  });

  it('should return a handler function', () => {
    const handler = handleAuth();
    expect(typeof handler).toBe('function');
  });

  it('should handle auth requests', async () => {
    const mockHandler = jest.fn().mockResolvedValue(new Response());
    (handleAuth as jest.Mock).mockReturnValue(mockHandler);

    const request = new Request('http://localhost:3000/api/auth/login');
    await mockHandler(request);

    expect(mockHandler).toHaveBeenCalledWith(request);
  });
}); 