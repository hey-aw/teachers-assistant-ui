import { render, screen } from '@testing-library/react';
import Dashboard from '@/app/protected/dashboard/page';
import { getSession } from '@auth0/nextjs-auth0';

jest.mock('@auth0/nextjs-auth0', () => ({
    getSession: jest.fn()
}));

describe('Dashboard Page', () => {
    it('should render the dashboard page', async () => {
        (getSession as jest.Mock).mockResolvedValue({
            user: { name: 'Test User' }
        });

        const DashboardComponent = await Dashboard();
        render(DashboardComponent);

        expect(screen.getByText('Protected Dashboard')).toBeInTheDocument();
    });

    it('should verify correct deployment on Azure Static Web Apps', async () => {
        const mockUser = {
            name: 'Test User',
            email: 'test@example.com',
            sub: 'auth0|123',
        };

        (getSession as jest.Mock).mockResolvedValue({ user: mockUser });

        const DashboardComponent = await Dashboard();
        render(DashboardComponent);

        expect(screen.getByText('Protected Dashboard')).toBeInTheDocument();
        expect(screen.getByText(`Welcome, ${mockUser.name}!`)).toBeInTheDocument();

        // Verify correct deployment on Azure Static Web Apps
        expect(process.env.NEXT_PUBLIC_SWA_APP_ENV_IS_PREVIEW).toBe('false');
    });
});
