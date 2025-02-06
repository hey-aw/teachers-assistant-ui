import '@testing-library/jest-dom';
import { render, screen, fireEvent, act, waitFor } from '@testing-library/react';
import MockLoginPage from '@/app/mock-login/page';
import { getAllMockUsers } from '@/lib/mockAuth';
import { jest } from '@jest/globals';
import { AppRouterContext } from 'next/dist/shared/lib/app-router-context.shared-runtime';
import * as cookiesNext from 'cookies-next';

// Mock router
const mockRouter = {
    push: jest.fn(),
    refresh: jest.fn(),
    back: jest.fn(),
    forward: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn()
};

jest.mock('next/navigation', () => ({
    useRouter: () => mockRouter
}));

const createTestWrapper = (children: React.ReactNode) => (
    <AppRouterContext.Provider value={mockRouter}>
        {children}
    </AppRouterContext.Provider>
);

// Mock cookies-next using spyOn
const mockSetCookie = jest.spyOn(cookiesNext, 'setCookie').mockImplementation((key: string, value: any, options?: any) => { });
const mockGetCookie = jest.spyOn(cookiesNext, 'getCookie').mockImplementation((key: string) => '');

// Mock timers using spyOn
jest.spyOn(global, 'setTimeout');

describe('MockLoginPage', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        jest.useFakeTimers();
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

    it('sets cookie and redirects when user is selected', async () => {
        const user = getAllMockUsers()[0];
        render(createTestWrapper(<MockLoginPage />));

        // Find and click the button
        const button = screen.getByRole('button', { name: new RegExp(user.name) });
        expect(button).not.toBeNull();

        await act(async () => {
            fireEvent.click(button);
        });

        expect(mockSetCookie).toHaveBeenCalledWith('mockEmail', user.email, {
            path: '/',
            sameSite: 'lax'
        });

        act(() => {
            jest.advanceTimersByTime(100);
        });

        expect(mockRouter.refresh).toHaveBeenCalled();
        expect(mockRouter.push).toHaveBeenCalledWith('/');
    });
}); 

