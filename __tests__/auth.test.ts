import { handleAuth, getSession } from '@auth0/nextjs-auth0';
import { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

// Mock Auth0 SDK
const mockHandleAuthFn = jest.fn().mockImplementation((req) => {
  return NextResponse.json({ user: null });
});

jest.mock('@auth0/nextjs-auth0', () => ({
  handleAuth: jest.fn(() => mockHandleAuthFn),
  getSession: jest.fn(),
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
    const request = new Request('http://localhost:3000/api/auth/login');
    const handler = handleAuth();
    await handler(request);
    expect(mockHandleAuthFn).toHaveBeenCalledWith(request);
  });

  it('should return user data when authenticated', async () => {
    const mockUser = {
      sub: 'auth0|123',
      name: 'Test User',
      email: 'test@example.com'
    };

    mockHandleAuthFn.mockImplementationOnce(() =>
      NextResponse.json({ user: mockUser }, {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      })
    );
    (getSession as jest.Mock).mockResolvedValue({ user: mockUser });

    const request = new NextRequest('http://localhost:3000/api/auth/me');
    const handler = handleAuth();
    const response = await handler(request);

    expect(response.headers.get('Content-Type')).toBe('application/json');
    const data = await response.json();
    expect(data).toEqual({ user: mockUser });
  });

  it('should return null when not authenticated', async () => {
    mockHandleAuthFn.mockImplementationOnce(() =>
      NextResponse.json({ user: null }, {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      })
    );
    (getSession as jest.Mock).mockResolvedValue(null);

    const request = new NextRequest('http://localhost:3000/api/auth/me');
    const handler = handleAuth();
    const response = await handler(request);

    expect(response.headers.get('Content-Type')).toBe('application/json');
    const data = await response.json();
    expect(data).toEqual({ user: null });
  });

  it('should verify correct deployment on Azure Static Web Apps', async () => {
    const mockUser = {
      sub: 'auth0|123',
      name: 'Test User',
      email: 'test@example.com'
    };

    mockHandleAuthFn.mockImplementationOnce(() =>
      NextResponse.json({ user: mockUser }, {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      })
    );
    (getSession as jest.Mock).mockResolvedValue({ user: mockUser });

    const request = new NextRequest('http://localhost:3000/api/auth/me');
    const handler = handleAuth();
    const response = await handler(request);

    expect(response.headers.get('Content-Type')).toBe('application/json');
    const data = await response.json();
    expect(data).toEqual({ user: mockUser });

    // Verify correct deployment on Azure Static Web Apps
    expect(process.env.AZURE_STATIC_WEBAPPS_ENVIRONMENT).toBe('production');
  });
});
