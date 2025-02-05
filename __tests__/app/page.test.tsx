import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import Home from '@/app/page';
import { useUser } from '@auth0/nextjs-auth0/client';

// Mock Auth0
jest.mock('@auth0/nextjs-auth0/client', () => ({
    useUser: jest.fn()
}));

// Mock MyAssistant component
jest.mock('@/components/MyAssistant', () => ({
    MyAssistant: () => <div>Mock Assistant</div>
}));

describe('Home Page', () => {
    const originalEnv = process.env;

    beforeEach(() => {
        jest.clearAllMocks();
        process.env = { ...originalEnv };
    });

    afterAll(() => {
        process.env = originalEnv;
    });

    describe('Loading State', () => {
        it('should show loading state', () => {
            (useUser as jest.Mock).mockReturnValue({
                user: null,
                error: null,
                isLoading: true
            });

            render(<Home />);
            expect(screen.getByText('Loading...')).toBeInTheDocument();
        });
    });

    describe('Error State', () => {
        it('should show error message', () => {
            (useUser as jest.Mock).mockReturnValue({
                user: null,
                error: new Error('Test error'),
                isLoading: false
            });

            render(<Home />);
            expect(screen.getByText('Test error')).toBeInTheDocument();
        });

        it('should show friendly message for unprocessable entity error', () => {
            (useUser as jest.Mock).mockReturnValue({
                user: null,
                error: new Error('Unprocessable Entity'),
                isLoading: false
            });

            render(<Home />);
            expect(screen.getByText('The request could not be processed. Please check your input and try again.')).toBeInTheDocument();
        });
    });

    describe('Authenticated State', () => {
        it('should render MyAssistant when user is authenticated', () => {
            (useUser as jest.Mock).mockReturnValue({
                user: { name: 'Test User' },
                error: null,
                isLoading: false
            });

            render(<Home />);
            expect(screen.getByText('Mock Assistant')).toBeInTheDocument();
        });
    });

    describe('Unauthenticated State', () => {
        it('should show Auth0 login link in production', () => {
            process.env.NEXT_PUBLIC_AUTH0_BASE_URL = 'https://example.com';
            (useUser as jest.Mock).mockReturnValue({
                user: null,
                error: null,
                isLoading: false
            });

            render(<Home />);
            const loginLink = screen.getByText('Login');
            expect(loginLink).toBeInTheDocument();
            expect(loginLink.getAttribute('href')).toBe('/api/auth/login');
        });

        it('should show mock login link when AUTH0_BASE_URL is missing', () => {
            delete process.env.NEXT_PUBLIC_AUTH0_BASE_URL;
            (useUser as jest.Mock).mockReturnValue({
                user: null,
                error: null,
                isLoading: false
            });

            render(<Home />);
            const loginLink = screen.getByText('Login');
            expect(loginLink).toBeInTheDocument();
            expect(loginLink.getAttribute('href')).toBe('/mock-login');
        });

        it('should show mock login link in preview environment', () => {
            process.env.NEXT_PUBLIC_AZURE_STATIC_WEBAPPS_ENVIRONMENT = 'preview';
            process.env.NEXT_PUBLIC_AUTH0_BASE_URL = 'https://example.com';
            (useUser as jest.Mock).mockReturnValue({
                user: null,
                error: null,
                isLoading: false
            });

            render(<Home />);
            const loginLink = screen.getByText('Login');
            expect(loginLink).toBeInTheDocument();
            expect(loginLink.getAttribute('href')).toBe('/mock-login');
        });
    });
}); 