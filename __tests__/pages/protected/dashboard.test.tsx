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
});
