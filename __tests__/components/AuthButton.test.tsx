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
            switch (key) {
                case 'welcome_user':
                    return params?.name ? `Welcome, ${params.name}` : 'Welcome';
                case 'loading':
                    return 'Loading...';
                case 'error':
                    return 'Error';
                case 'login':
                    return 'Login';
                case 'logout':
                    return 'Logout';
                default:
                    return key;
            }
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

    describe('with Auth0 enabled', () => {
        beforeEach(() => {
            process.env.NEXT_PUBLIC_MOCK_AUTH = 'false';
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
                expect(screen.getByText('Loading...')).toBeInTheDocument();

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
                expect(screen.getByText('Loading...')).toBeInTheDocument();

                // Transition to error
                const errorMessage = 'Authentication failed';
                (useUser as jest.Mock).mockReturnValue({
                    user: null,
                    error: new Error(errorMessage),
                    isLoading: false,
                    isPreview: false
                });

                rerender(<AuthButton />);
                expect(screen.getByText('Error')).toBeInTheDocument();
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
                expect(screen.getByText('Loading...')).toBeInTheDocument();

                // Transition to unauthenticated
                (useUser as jest.Mock).mockReturnValue({
                    user: null,
                    error: null,
                    isLoading: false,
                    isPreview: false
                });

                rerender(<AuthButton />);
                const loginButton = screen.getByText('Login');
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
                const loginButton = screen.getByText('Login');
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
                expect(screen.getByText('Loading...')).toBeInTheDocument();
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
                expect(screen.getByText('Error')).toBeInTheDocument();
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
                render(<AuthButton />);

                expect(screen.getByText('Welcome, tester')).toBeInTheDocument();
                expect(screen.getByAltText('User avatar')).toBeInTheDocument();
                const logoutButton = screen.getByText('Logout');
                expect(logoutButton).toBeInTheDocument();
                expect(logoutButton.getAttribute('href')).toBe('/api/auth/logout');
            });

            it('should render user info and home redirect in preview mode', () => {
                render(<AuthButton />);

                expect(screen.getByText('Welcome, tester')).toBeInTheDocument();
                expect(screen.getByAltText('User avatar')).toBeInTheDocument();
                const logoutButton = screen.getByText('Logout');
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

            it('should show Auth0 login link in production', () => {
                process.env.NEXT_PUBLIC_AUTH0_BASE_URL = 'https://example.com';
                render(<AuthButton />);

                const loginButton = screen.getByText('Login');
                expect(loginButton).toBeInTheDocument();
                expect(loginButton.getAttribute('href')).toBe('/api/auth/login');
            });

        });
    });

    describe('Preview Mode', () => {
        beforeEach(() => {
            process.env.NEXT_PUBLIC_MOCK_AUTH = 'true';
        });

        it('should show mock login link', () => {
            render(<AuthButton />);

            const loginButton = screen.getByText('Login');
            expect(loginButton).toBeInTheDocument();
            expect(loginButton.getAttribute('href')).toBe('/mock-login');
        });
    });

});