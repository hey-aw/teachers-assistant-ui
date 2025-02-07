import { renderHook, act } from '@testing-library/react';
import { useAuth } from '@/lib/hooks/useAuth';
import { useUser } from '@auth0/nextjs-auth0/client';
import { getCookie } from 'cookies-next';
import { getMockUser } from '@/lib/mockAuth';

// Mock dependencies
jest.mock('@auth0/nextjs-auth0/client', () => ({
    useUser: jest.fn()
}));

jest.mock('cookies-next', () => ({
    getCookie: jest.fn()
}));

jest.mock('@/lib/mockAuth', () => ({
    getMockUser: jest.fn()
}));

describe('useAuth', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        jest.useFakeTimers();
    });

    afterEach(() => {
        jest.useRealTimers();
    });

    describe('Preview Environment', () => {
        beforeEach(() => {
            process.env.NEXT_PUBLIC_AZURE_STATIC_WEBAPPS_ENVIRONMENT = 'preview';
            delete process.env.NEXT_PUBLIC_AUTH0_BASE_URL;
        });

        it('should return mock user when cookie exists', async () => {
            const mockEmail = 'test@example.com';
            const mockUser = { name: 'Test User', email: mockEmail };
            (getCookie as jest.Mock).mockReturnValue(mockEmail);
            (getMockUser as jest.Mock).mockReturnValue(mockUser);

            let hook: any;
            await act(async () => {
                hook = renderHook(() => useAuth());
            });

            expect(hook.result.current.user).toEqual(mockUser);
            expect(hook.result.current.error).toBeNull();
            expect(hook.result.current.isLoading).toBe(false);
        });

        it('should return null user when no cookie exists', async () => {
            (getCookie as jest.Mock).mockReturnValue(null);

            let hook: any;
            await act(async () => {
                hook = renderHook(() => useAuth());
            });

            expect(hook.result.current.user).toBeNull();
            expect(hook.result.current.error).toBeNull();
            expect(hook.result.current.isLoading).toBe(false);
        });

        it('should update user when cookie changes', async () => {
            const mockEmail = 'test@example.com';
            const mockUser = { name: 'Test User', email: mockEmail };
            (getCookie as jest.Mock).mockReturnValue(null);
            (getMockUser as jest.Mock).mockReturnValue(mockUser);

            let hook: any;
            await act(async () => {
                hook = renderHook(() => useAuth());
            });

            expect(hook.result.current.user).toBeNull();

            // Simulate cookie change
            await act(async () => {
                (getCookie as jest.Mock).mockReturnValue(mockEmail);
                jest.advanceTimersByTime(1000);
            });

            expect(hook.result.current.user).toEqual(mockUser);
        });
    });

    describe('Production Environment', () => {
        beforeEach(() => {
            process.env.NEXT_PUBLIC_AUTH0_BASE_URL = 'https://example.com';
            delete process.env.NEXT_PUBLIC_AZURE_STATIC_WEBAPPS_ENVIRONMENT;
        });

        it('should return Auth0 user state', async () => {
            const auth0User = { name: 'Auth0 User', email: 'auth0@example.com' };
            (useUser as jest.Mock).mockReturnValue({
                user: auth0User,
                error: null,
                isLoading: false
            });

            let hook: any;
            await act(async () => {
                hook = renderHook(() => useAuth());
            });

            expect(hook.result.current.user).toEqual(auth0User);
            expect(hook.result.current.error).toBeNull();
            expect(hook.result.current.isLoading).toBe(false);
        });

        it('should not check for mock cookies', async () => {
            await act(async () => {
                renderHook(() => useAuth());
            });

            expect(getCookie).not.toHaveBeenCalled();
            expect(getMockUser).not.toHaveBeenCalled();
        });
    });

    describe('Azure Static Web Apps Deployment', () => {
        beforeEach(() => {
            process.env.NEXT_PUBLIC_AZURE_STATIC_WEBAPPS_ENVIRONMENT = 'production';
        });

        it('should verify correct deployment on Azure Static Web Apps', async () => {
            const auth0User = { name: 'Auth0 User', email: 'auth0@example.com' };
            (useUser as jest.Mock).mockReturnValue({
                user: auth0User,
                error: null,
                isLoading: false
            });

            let hook: any;
            await act(async () => {
                hook = renderHook(() => useAuth());
            });

            expect(hook.result.current.user).toEqual(auth0User);
            expect(hook.result.current.error).toBeNull();
            expect(hook.result.current.isLoading).toBe(false);
            expect(process.env.NEXT_PUBLIC_AZURE_STATIC_WEBAPPS_ENVIRONMENT).toBe('production');
        });
    });
});
