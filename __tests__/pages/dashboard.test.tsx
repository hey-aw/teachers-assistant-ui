import { render, screen } from '@testing-library/react';
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

  it('should render dashboard page', async () => {
    const Component = await DashboardPage();
    render(
      <I18nextProvider i18n={i18next}>
        {Component}
      </I18nextProvider>
    );

    expect(screen.getByText('Protected Dashboard')).toBeInTheDocument();
  });
});
