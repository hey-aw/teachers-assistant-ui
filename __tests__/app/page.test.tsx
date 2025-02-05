import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import Home from '@/app/page';
import { useUser } from '@auth0/nextjs-auth0/client';
import { getCookie } from 'cookies-next';

// Mock Auth0
jest.mock('@auth0/nextjs-auth0/client', () => ({
    useUser: jest.fn()
}));

// Mock MyAssistant component
jest.mock('@/components/MyAssistant', () => ({
    MyAssistant: () => <div>Mock Assistant</div>
}));

// Mock cookies-next
jest.mock('cookies-next', () => ({
    getCookie: jest.fn()
}));

describe('Home Page', () => {
    const originalEnv = process.env;

    beforeEach(() => {
        jest.clearAllMocks();
        process.env = { ...originalEnv };
        (getCookie as jest.Mock).mockReturnValue(null);
    });

    afterAll(() => {
        process.env = originalEnv;
    });

    describe.skip('With Auth0 configured', () => {
        beforeEach(() => {
            process.env.AUTH0_BASE_URL = 'https://example.com';
        });

        it('shows loading state when Auth0 is loading', () => {
            (useUser as jest.Mock).mockReturnValue({ isLoading: true });
            render(<Home />);
            expect(screen.getByText('Loading...')).toBeInTheDocument();
        });

        it('shows error message when Auth0 fails', () => {
            (useUser as jest.Mock).mockReturnValue({ error: new Error('Test error') });
            render(<Home />);
            expect(screen.getByText('Test error')).toBeInTheDocument();
        });

        it('shows friendly message for unprocessable entity error', () => {
            (useUser as jest.Mock).mockReturnValue({ error: new Error('Unprocessable Entity') });
            render(<Home />);
            expect(screen.getByText('The request could not be processed. Please check your input and try again.')).toBeInTheDocument();
        });

        it('shows Auth0 login link when not authenticated', () => {
            (useUser as jest.Mock).mockReturnValue({});
            render(<Home />);
            const loginLink = screen.getByText('Login');
            expect(loginLink.getAttribute('href')).toBe('/api/auth/login');
        });

        it('shows assistant when authenticated with Auth0', () => {
            (useUser as jest.Mock).mockReturnValue({ user: { name: 'Test User' } });
            render(<Home />);
            expect(screen.getByText('Mock Assistant')).toBeInTheDocument();
        });
    });

    describe('Without Auth0', () => {
        beforeEach(() => {
            delete process.env.AUTH0_BASE_URL;
        });

        it('skips loading state', () => {
            (useUser as jest.Mock).mockReturnValue({ isLoading: true });
            render(<Home />);
            expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
        });

        it('shows mock login link when not authenticated', () => {
            (useUser as jest.Mock).mockReturnValue({});
            render(<Home />);
            const loginLink = screen.getByText('Login');
            expect(loginLink.getAttribute('href')).toBe('/mock-login');
        });

        it('shows assistant when mock user exists', () => {
            (getCookie as jest.Mock).mockReturnValue('test@example.com');
            (useUser as jest.Mock).mockReturnValue({});
            render(<Home />);
            expect(screen.getByText('Mock Assistant')).toBeInTheDocument();
        });
    });
}); 