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
            process.env.NEXT_PUBLIC_MOCK_AUTH = 'true';
        });

        it('should return mock user when cookie exists', () => {
            const mockEmail = 'test@example.com';
            const mockUser = { name: 'Test User', email: mockEmail };
            (getCookie as jest.Mock).mockReturnValue(mockEmail);
            (getMockUser as jest.Mock).mockReturnValue(mockUser);

            const { result } = renderHook(() => useAuth());

            expect(result.current.user).toEqual(mockUser);
            expect(result.current.error).toBeNull();
            expect(result.current.isLoading).toBe(false);
        });

        it('should return null user when no cookie exists', () => {
            (getCookie as jest.Mock).mockReturnValue(null);

            const { result } = renderHook(() => useAuth());

            expect(result.current.user).toBeNull();
            expect(result.current.error).toBeNull();
            expect(result.current.isLoading).toBe(false);
        });

        it('should update user when cookie changes', () => {
            const mockEmail = 'test@example.com';
            const mockUser = { name: 'Test User', email: mockEmail };
            (getCookie as jest.Mock).mockReturnValue(null);
            (getMockUser as jest.Mock).mockReturnValue(mockUser);

            const { result } = renderHook(() => useAuth());

            expect(result.current.user).toBeNull();

            // Simulate cookie change
            act(() => {
                (getCookie as jest.Mock).mockReturnValue(mockEmail);
                jest.advanceTimersByTime(1000);
            });

            expect(result.current.user).toEqual(mockUser);
        });
    });

    describe('Production Environment', () => {
        beforeEach(() => {
            process.env.NEXT_PUBLIC_MOCK_AUTH = 'false';
        });

        it('should return Auth0 user state', () => {
            const auth0User = { name: 'Auth0 User', email: 'auth0@example.com' };
            (useUser as jest.Mock).mockReturnValue({
                user: auth0User,
                error: null,
                isLoading: false
            });

            const { result } = renderHook(() => useAuth());

            expect(result.current.user).toEqual(auth0User);
            expect(result.current.error).toBeNull();
            expect(result.current.isLoading).toBe(false);
        });

        it('should not check for mock cookies', () => {
            renderHook(() => useAuth());

            expect(getCookie).not.toHaveBeenCalled();
            expect(getMockUser).not.toHaveBeenCalled();
        });
    });
}); 