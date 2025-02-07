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


}); 