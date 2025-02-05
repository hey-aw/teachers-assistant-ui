import '@testing-library/jest-dom';
import { render, screen, fireEvent, act } from '@testing-library/react';
import MockLoginPage from '@/app/mock-login/page';
import { getAllMockUsers } from '@/lib/mockAuth';
import { jest } from '@jest/globals';
import { AppRouterContext } from 'next/dist/shared/lib/app-router-context.shared-runtime';

// Mock next/navigation
const mockRouter = {
    push: jest.fn(),
    refresh: jest.fn()
};

jest.mock('next/navigation', () => ({
    useRouter: () => mockRouter
}));

const createTestWrapper = (children: React.ReactNode) => (
    <AppRouterContext.Provider value={{
        push: mockRouter.push,
        refresh: mockRouter.refresh,
        back: jest.fn(),
        forward: jest.fn(),
        replace: jest.fn(),
        prefetch: jest.fn()
    }}>
        {children}
    </AppRouterContext.Provider>
);

// Mock cookies-next
const mockSetCookie = jest.fn();
jest.mock('cookies-next', () => {
    return {
        setCookie: mockSetCookie,
        getCookie: () => null
    };
});

// Mock timers
jest.useFakeTimers();

describe('MockLoginPage', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    afterEach(() => {
        jest.runOnlyPendingTimers();
        jest.useRealTimers();
    });

    it('displays the preview environment header', () => {
        render(createTestWrapper(<MockLoginPage />));
        expect(screen.getByText('Preview Environment Login')).toBeInTheDocument();
    });

    it('displays user avatars with correct initials', () => {
        render(createTestWrapper(<MockLoginPage />));
        getAllMockUsers().forEach(user => {
            expect(screen.getByText(user.name.charAt(0))).toBeInTheDocument();
        });
    });

    it('displays user information correctly', () => {
        render(createTestWrapper(<MockLoginPage />));
        getAllMockUsers().forEach(user => {
            expect(screen.getByText(user.name)).toBeInTheDocument();
            expect(screen.getByText(user.email)).toBeInTheDocument();
        });
    });

    it('sets cookie and redirects when user is selected', () => {
        render(createTestWrapper(<MockLoginPage />));
        const user = getAllMockUsers()[0];
        const firstUserButton = screen.getByText(user.name).closest('button');
        expect(firstUserButton).not.toBeNull();

        // Click and advance timers in one act to handle all state updates
        act(() => {
            fireEvent.click(firstUserButton!);
            // Let the cookie set and refresh happen
            jest.advanceTimersByTime(50);
            // Let the redirect happen
            jest.advanceTimersByTime(100);
        });

        expect(mockSetCookie).toHaveBeenCalledWith('mockEmail', user.email, {
            path: '/',
            sameSite: 'lax'
        });
        expect(mockRouter.refresh).toHaveBeenCalled();
        expect(mockRouter.push).toHaveBeenCalledWith('/');
    });
}); 
