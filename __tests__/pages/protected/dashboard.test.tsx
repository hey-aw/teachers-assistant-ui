import { render, screen } from '@testing-library/react';
import Dashboard from '@/app/protected/dashboard/page';

describe('Dashboard Page', () => {
    it('should render the dashboard page', async () => {
        const mockUser = { name: 'Test User' };

        const DashboardComponent = await Dashboard();
        render(DashboardComponent);

        expect(screen.getByText('Protected Dashboard')).toBeInTheDocument();
    });
});
