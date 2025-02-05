import { useUser } from '@auth0/nextjs-auth0/client';
import { useEffect, useState } from 'react';
import { getCookie } from 'cookies-next';
import { getMockUser } from '@/lib/mockAuth';
import type { MockUser } from '@/lib/mockAuth';

const isPreviewEnvironment = () => {
  return process.env.NEXT_PUBLIC_MOCK_AUTH === 'true';
};

export function useAuth() {
  const auth0 = useUser();
  const [mockUser, setMockUser] = useState<MockUser | null>(null);

  useEffect(() => {
    if (!isPreviewEnvironment()) return;

    const checkCookie = () => {
      const email = getCookie('mockUserEmail') as string;
      if (email) {
        const user = getMockUser(email);
        if (user) setMockUser(user);
      } else {
        setMockUser(null);
      }
    };

    checkCookie();
    const interval = setInterval(checkCookie, 1000);
    return () => clearInterval(interval);
  }, []);

  if (isPreviewEnvironment()) {
    return {
      user: mockUser,
      error: null,
      isLoading: false,
    };
  }

  return auth0;
} 