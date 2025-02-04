import '@testing-library/jest-dom';
import { render, screen, fireEvent } from '@testing-library/react';
import { useRouter } from 'next/navigation';
import MockLoginPage from '@/app/mock-login/page';

// Mock next/navigation
jest.mock('next/navigation', () => ({
    useRouter: jest.fn(() => ({
        push: jest.fn(),
    })),
}));

// Mock cookies-next
jest.mock('cookies-next', () => ({
    setCookie: jest.fn(),
}));

describe('MockLoginPage', () => {
    const mockPush = jest.fn();

    beforeEach(() => {
        (useRouter as jest.Mock).mockReturnValue({
            push: mockPush,
        });
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('renders mock users', () => {
        render(<MockLoginPage />);

        expect(screen.getByText('Login as aw@eddolearning.com')).toBeInTheDocument();
        expect(screen.getByText('Login as joel@eddolearning.com')).toBeInTheDocument();
    });

    it('handles login click correctly', async () => {
        const { setCookie } = require('cookies-next');
        render(<MockLoginPage />);

        const loginButton = screen.getByText('Login as aw@eddolearning.com');
        fireEvent.click(loginButton);

        expect(setCookie).toHaveBeenCalledWith('mockEmail', 'aw@eddolearning.com', {
            path: '/',
            secure: true,
            sameSite: 'strict'
        });
        expect(mockPush).toHaveBeenCalledWith('/');
    });

    it('displays the preview environment header', () => {
        render(<MockLoginPage />);

        expect(screen.getByText('Mock Login (Preview Environment)')).toBeInTheDocument();
    });
}); 