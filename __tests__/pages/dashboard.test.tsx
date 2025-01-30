import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import { render, screen } from '@testing-library/react';
import { getSession } from '@auth0/nextjs-auth0';
import { redirect } from 'next/navigation';
import DashboardPage from '@/app/protected/dashboard/page';

// Mock next/navigation
jest.mock('next/navigation', () => ({
  redirect: jest.fn(),
}));

// Mock Auth0
jest.mock('@auth0/nextjs-auth0', () => ({
  getSession: jest.fn(),
}));

describe('DashboardPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should redirect to login if user is not authenticated', async () => {
    (getSession as jest.Mock).mockResolvedValue(null);
    
    try {
      await DashboardPage();
    } catch (error) {
      // Redirect throws an error in tests
      expect(redirect).toHaveBeenCalledWith('/api/auth/login');
    }
  });

  it('should render dashboard with user information when authenticated', async () => {
    const mockUser = {
      name: 'Test User',
      email: 'test@example.com',
      sub: 'auth0|123',
    };

    (getSession as jest.Mock).mockResolvedValue({ user: mockUser });

    const Component = await DashboardPage();
    const { container } = render(Component);

    expect(screen.getByText('Protected Dashboard')).toBeInTheDocument();
    expect(screen.getByText(`Welcome, ${mockUser.name}!`)).toBeInTheDocument();
    expect(container.textContent).toContain(JSON.stringify(mockUser, null, 2));
  });
});
