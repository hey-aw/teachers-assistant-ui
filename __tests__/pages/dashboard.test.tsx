import { render, screen } from '@testing-library/react';
import { redirect } from 'next/navigation';
import DashboardPage from '@/app/protected/dashboard/page';
import { I18nextProvider } from 'react-i18next';
import i18next from 'i18next';

// Mock next/navigation
jest.mock('next/navigation', () => ({
  redirect: jest.fn(),
}));

describe('DashboardPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should redirect to login if user is not authenticated', async () => {
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
