import '@testing-library/jest-dom';
import { render, screen, act } from '@testing-library/react';
import AuthButton from '@/components/AuthButton';
import { useUser } from '@auth0/nextjs-auth0/client';
import { useTranslation } from 'react-i18next';

// Mock Auth0
jest.mock('@auth0/nextjs-auth0/client', () => ({
    useUser: jest.fn()
}));

// Mock next/image
jest.mock('next/image', () => ({
    __esModule: true,
    default: (props: any) => <img {...props} />
}));

// Mock react-i18next
jest.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key: string, params?: any) => {
            if (key === 'welcome_user' && params?.name) {
                return `Welcome, ${params.name}`;
            }
            return key;
        }
    })
}));

describe('AuthButton', () => {
    const originalEnv = process.env;

    beforeEach(() => {
        jest.clearAllMocks();
        process.env = { ...originalEnv };
    });

    afterAll(() => {
        process.env = originalEnv;
    });

    describe('Auth State Transitions', () => {
        it('should handle loading -> authenticated transition', async () => {
            // Start with loading state
            (useUser as jest.Mock).mockReturnValue({
                user: null,
                error: null,
                isLoading: true,
                isPreview: false
            });

            const { rerender } = render(<AuthButton />);
            expect(screen.getByText('loading')).toBeInTheDocument();

            // Transition to authenticated
            (useUser as jest.Mock).mockReturnValue({
                user: { name: 'AW', email: 'aw@eddolearning.com' },
                error: null,
                isLoading: false,
                isPreview: true
            });

            rerender(<AuthButton />);
            expect(screen.getByText('Welcome, AW')).toBeInTheDocument();
        });

        it('should handle loading -> error transition', async () => {
            // Start with loading state
            (useUser as jest.Mock).mockReturnValue({
                user: null,
                error: null,
                isLoading: true,
                isPreview: false
            });

            const { rerender } = render(<AuthButton />);
            expect(screen.getByText('loading')).toBeInTheDocument();

            // Transition to error
            const errorMessage = 'Authentication failed';
            (useUser as jest.Mock).mockReturnValue({
                user: null,
                error: new Error(errorMessage),
                isLoading: false,
                isPreview: false
            });

            rerender(<AuthButton />);
            expect(screen.getByText('error')).toBeInTheDocument();
        });

        it('should handle loading -> unauthenticated transition', async () => {
            // Start with loading state
            (useUser as jest.Mock).mockReturnValue({
                user: null,
                error: null,
                isLoading: true,
                isPreview: false
            });

            const { rerender } = render(<AuthButton />);
            expect(screen.getByText('loading')).toBeInTheDocument();

            // Transition to unauthenticated
            (useUser as jest.Mock).mockReturnValue({
                user: null,
                error: null,
                isLoading: false,
                isPreview: false
            });

            rerender(<AuthButton />);
            const loginButton = screen.getByText('login');
            expect(loginButton).toBeInTheDocument();
        });

        it('should handle authenticated -> unauthenticated transition', async () => {
            // Start with authenticated state
            (useUser as jest.Mock).mockReturnValue({
                user: { name: 'AW', email: 'aw@eddolearning.com' },
                error: null,
                isLoading: false,
                isPreview: true
            });

            const { rerender } = render(<AuthButton />);
            expect(screen.getByText('Welcome, AW')).toBeInTheDocument();

            // Transition to unauthenticated
            (useUser as jest.Mock).mockReturnValue({
                user: null,
                error: null,
                isLoading: false,
                isPreview: true
            });

            rerender(<AuthButton />);
            const loginButton = screen.getByText('login');
            expect(loginButton).toBeInTheDocument();
            expect(loginButton.getAttribute('href')).toBe('/api/auth/login');
        });
    });

    describe('Loading State', () => {
        it('should show loading state', () => {
            (useUser as jest.Mock).mockReturnValue({
                user: null,
                error: null,
                isLoading: true
            });

            render(<AuthButton />);
            expect(screen.getByText('loading')).toBeInTheDocument();
        });
    });

    describe('Error State', () => {
        it('should show error message', () => {
            const errorMessage = 'Test error';
            (useUser as jest.Mock).mockReturnValue({
                user: null,
                error: new Error(errorMessage),
                isLoading: false
            });

            render(<AuthButton />);
            expect(screen.getByText('error')).toBeInTheDocument();
        });
    });

    describe('Authenticated State', () => {
        const mockUser = {
            name: 'Test User',
            nickname: 'tester',
            picture: 'https://example.com/avatar.jpg'
        };

        beforeEach(() => {
            (useUser as jest.Mock).mockReturnValue({
                user: mockUser,
                error: null,
                isLoading: false
            });
        });

        it('should render user info and logout button in production', () => {
            process.env.NEXT_PUBLIC_AUTH0_BASE_URL = 'https://example.com';
            render(<AuthButton />);

            expect(screen.getByText('Welcome, tester')).toBeInTheDocument();
            expect(screen.getByAltText('User avatar')).toBeInTheDocument();
            const logoutButton = screen.getByText('logout');
            expect(logoutButton).toBeInTheDocument();
            expect(logoutButton.getAttribute('href')).toBe('/api/auth/logout');
        });

        it('should render user info and home redirect in preview mode', () => {
            process.env.NEXT_PUBLIC_AZURE_STATIC_WEBAPPS_ENVIRONMENT = 'preview';
            render(<AuthButton />);

            expect(screen.getByText('Welcome, tester')).toBeInTheDocument();
            expect(screen.getByAltText('User avatar')).toBeInTheDocument();
            const logoutButton = screen.getByText('logout');
            expect(logoutButton).toBeInTheDocument();
            expect(logoutButton.getAttribute('href')).toBe('/api/auth/logout');
        });

        it('should use name if nickname is not available', () => {
            (useUser as jest.Mock).mockReturnValue({
                user: { ...mockUser, nickname: undefined },
                error: null,
                isLoading: false
            });

            render(<AuthButton />);
            expect(screen.getByText('Welcome, Test User')).toBeInTheDocument();
        });
    });

    describe('Unauthenticated State', () => {
        beforeEach(() => {
            (useUser as jest.Mock).mockReturnValue({
                user: null,
                error: null,
                isLoading: false
            });
        });

        it('should show Auth0 login link', () => {
            process.env.NEXT_PUBLIC_AUTH0_BASE_URL = 'https://example.com';
            render(<AuthButton />);

            const loginButton = screen.getByText('login');
            expect(loginButton).toBeInTheDocument();
            expect(loginButton.getAttribute('href')).toBe('/api/auth/login');
        });

        it('should have the correct href attribute for the login button', () => {
            render(<AuthButton />);
            const loginButton = screen.getByText('login');
            expect(loginButton).toBeInTheDocument();
            expect(loginButton.getAttribute('href')).toBe('/api/auth/login');
        });
    });

    describe('Azure Static Web Apps Deployment', () => {
        it('should verify correct deployment on Azure Static Web Apps', async () => {
            const mockUser = {
                name: 'Test User',
                nickname: 'tester',
                picture: 'https://example.com/avatar.jpg'
            };

            (useUser as jest.Mock).mockReturnValue({
                user: mockUser,
                error: null,
                isLoading: false
            });

            render(<AuthButton />);

            expect(screen.getByText('Welcome, tester')).toBeInTheDocument();
            expect(screen.getByAltText('User avatar')).toBeInTheDocument();
            const logoutButton = screen.getByText('logout');
            expect(logoutButton).toBeInTheDocument();
            expect(logoutButton.getAttribute('href')).toBe('/api/auth/logout');

            // Verify correct deployment on Azure Static Web Apps
            expect(process.env.NEXT_PUBLIC_AZURE_STATIC_WEBAPPS_ENVIRONMENT).toBe('production');
        });
    });
});
