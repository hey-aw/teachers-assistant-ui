'use client';

import { useUser } from '@auth0/nextjs-auth0/client';
import Link from 'next/link';
import { MyAssistant } from "@/components/MyAssistant";
import { useEffect, useState } from 'react';
import { getCookie } from 'cookies-next';

const isPreviewEnvironment = () => {
  return process.env.NEXT_PUBLIC_MOCK_AUTH === 'true';
};

export default function Home() {
  const { user: auth0User, error, isLoading } = useUser();
  const [mockUser, setMockUser] = useState<any>(null);

  useEffect(() => {
    const mockEmail = getCookie('mockEmail');
    if (mockEmail) {
      setMockUser({ email: mockEmail });
    }
  }, []);

  if (isLoading && !isPreviewEnvironment()) return (
    <main className="h-dvh flex items-center justify-center">
      <div>Loading...</div>
    </main>
  );

  if (error) {
    let errorMessage = error.message;
    if (error.message.includes('Unprocessable Entity')) {
      errorMessage = 'The request could not be processed. Please check your input and try again.';
    }
    return (
      <main className="h-dvh flex items-center justify-center">
        <div>{errorMessage}</div>
      </main>
    );
  }

  const user = isPreviewEnvironment() ? mockUser : auth0User;

  if (user) {
    return (
      <main className="h-dvh">
        <MyAssistant />
      </main>
    );
  }

  const loginUrl = isPreviewEnvironment() ? '/mock-login' : '/api/auth/login';

  return (
    <main className="h-dvh flex items-center justify-center">
      <Link href={loginUrl} className="text-blue-600 hover:text-blue-800 underline">
        Login
      </Link>
    </main>
  );
}
