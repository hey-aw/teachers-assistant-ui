import { useUser } from '@auth0/nextjs-auth0/client';

export function useAuth() {
  return useUser();
} 