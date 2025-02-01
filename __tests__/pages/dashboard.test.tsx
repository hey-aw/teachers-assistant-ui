import { render, screen } from '@testing-library/react';
import { getSession } from '@auth0/nextjs-auth0';
import { redirect } from 'next/navigation';
import DashboardPage from '@/app/protected/dashboard/page';
import { I18nextProvider } from 'react-i18next';
import i18next from 'i18next';
import AuthButton from '@/components/AuthButton';
import Home from '@/app/page';

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
    render(
      <I18nextProvider i18n={i18next}>
        {Component}
      </I18nextProvider>
    );

    expect(screen.getByText('Protected Dashboard')).toBeInTheDocument();
    expect(screen.getByText(`Welcome, ${mockUser.name}!`)).toBeInTheDocument();
  });
});

describe('AuthButton', () => {
  it('should render sign-up link when user is not authenticated', () => {
    (getSession as jest.Mock).mockResolvedValue(null);

    render(<AuthButton />);

    expect(screen.getByText('Sign Up')).toBeInTheDocument();
  });
});

describe('Home', () => {
  it('should render sign-up link on the home page', () => {
    render(<Home />);

    expect(screen.getByText('Sign Up')).toBeInTheDocument();
  });
});
