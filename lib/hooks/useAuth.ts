import { useUser } from '@auth0/nextjs-auth0/client';
import { useEffect, useState } from 'react';
import { getCookie } from 'cookies-next';

const isPreviewEnvironment = () => {
  return process.env.NEXT_PUBLIC_AZURE_STATIC_WEBAPPS_ENVIRONMENT === 'preview' || !process.env.NEXT_PUBLIC_AUTH0_BASE_URL;
};

export function useAuth() {
  const auth0 = useUser();
  const [mockUser, setMockUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkMockAuth = async () => {
      if (!isPreviewEnvironment()) {
        setLoading(false);
        return;
      }

      try {
        const response = await fetch('/api/auth/userinfo');
        const data = await response.json();
        setMockUser(data.user);
      } catch (e) {
        console.error('Error checking mock auth:', e);
      } finally {
        setLoading(false);
      }
    };

    checkMockAuth();
  }, []);

  if (isPreviewEnvironment()) {
    return {
      user: mockUser,
      error: null,
      isLoading: loading,
    };
  }

  return auth0;
} 