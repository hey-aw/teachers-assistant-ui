import { render, screen } from '@testing-library/react';
import Dashboard from '../../../app/protected/dashboard/page';
import { getSession } from '@auth0/nextjs-auth0';

jest.mock('@auth0/nextjs-auth0', () => ({
    getSession: jest.fn()
}));

describe('Dashboard Page', () => {
    it('should render the dashboard page', async () => {
        jest.mocked(getSession).mockResolvedValue({
            user: {
                name: 'Test User',
                email: 'test@example.com',
                sub: 'auth0|123'
            }
        });

        const Component = await Dashboard();
        render(Component);

        expect(screen.getByText('Protected Dashboard')).toBeInTheDocument();
        expect(screen.getByText('Welcome, Test User!')).toBeInTheDocument();
    });
});
