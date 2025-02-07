import { useUser } from '@auth0/nextjs-auth0/client';
import { getCookie } from 'cookies-next';
import { useState, useEffect } from 'react';
import { getMockUser } from '@/lib/mockAuth';

interface AuthState {
  user: any | null;
  error: Error | null;
  isLoading: boolean;
}

export const useAuth = () => {
  const [authState, setAuthState] = useState<AuthState>({ user: null, error: null, isLoading: true });
  const auth0 = useUser();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        console.log(`NEXT_PUBLIC_SWA_APP_ENV_IS_PREVIEW: ${process.env.NEXT_PUBLIC_SWA_APP_ENV_IS_PREVIEW}\nSWA_APP_ENV_IS_PREVIEW: ${process.env.SWA_APP_ENV_IS_PREVIEW}`);
        if (process.env.NEXT_PUBLIC_SWA_APP_ENV_IS_PREVIEW === 'true') {
          const mockEmail = await getCookie('mockEmail');
          const mockUser = mockEmail ? getMockUser(mockEmail.toString()) : null;
          setAuthState({ user: mockUser, error: null, isLoading: false });
          return;
        }

        // Use Auth0 state for production environments
        setAuthState({
          user: auth0.user,
          error: auth0.error || null,
          isLoading: auth0.isLoading
        });
      } catch (error) {
        setAuthState({ user: null, error: error as Error, isLoading: false });
      }
    };

    // Initial check
    checkAuth();

    // Set up interval for checking cookie changes in preview mode
    let interval: NodeJS.Timeout | null = null;
    if (process.env.NEXT_PUBLIC_SWA_APP_ENV_IS_PREVIEW === 'true') {
      interval = setInterval(checkAuth, 1000);
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [auth0]);

  return authState;
};
