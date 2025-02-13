import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import Home from '@/src/app/page';
import { useAuth } from '@/lib/hooks/useAuth';

// Mock useAuth hook
jest.mock('@/lib/hooks/useAuth', () => ({
    useAuth: jest.fn()
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
            (useAuth as jest.Mock).mockReturnValue({
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
            const errorMessage = 'Test error';
            (useAuth as jest.Mock).mockReturnValue({
                user: null,
                error: new Error(errorMessage),
                isLoading: false
            });
            render(<Home />);
            expect(screen.getByText(errorMessage)).toBeInTheDocument();
        });

        it('should show friendly message for unprocessable entity error', () => {
            (useAuth as jest.Mock).mockReturnValue({
                user: null,
                error: new Error('Unprocessable Entity'),
                isLoading: false
            });
            render(<Home />);
            expect(screen.getByText(/the request could not be processed/i)).toBeInTheDocument();
        });
    });
}); 