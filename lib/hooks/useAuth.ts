import { useUser } from '@auth0/nextjs-auth0/client';
import { getCookie } from 'cookies-next';
import { getMockUser } from '@/lib/mockAuth';

export function useAuth() {
  const { user, error, isLoading } = useUser();

  if (process.env.NEXT_PUBLIC_AZURE_STATIC_WEBAPPS_ENVIRONMENT === 'preview') {
    const mockEmail = getCookie('mockEmail');
    const mockUser = mockEmail ? getMockUser(mockEmail) : null;
    return {
      user: mockUser,
      error: null,
      isLoading: false,
    };
  }

  return { user, error, isLoading };
}
