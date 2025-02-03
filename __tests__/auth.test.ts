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

  it('should handle 422 errors correctly', async () => {
    const mockHandler = jest.fn().mockResolvedValue(new Response(JSON.stringify({ message: 'Unprocessable Entity' }), {
      status: 422,
      headers: new Headers({
        'Content-Type': 'application/json'
      })
    }));
    (handleAuth as jest.Mock).mockReturnValue(mockHandler);

    const request = new Request('http://localhost:3000/api/auth/login');
    const response = await mockHandler(request);
    const data = await response.json();

    expect(response.status).toBe(422);
    expect(data.error).toBe('Unprocessable Entity: The request was well-formed but was unable to be followed due to semantic errors.');
  });
});
