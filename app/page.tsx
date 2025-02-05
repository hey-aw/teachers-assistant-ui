'use client';

import { useUser } from '@auth0/nextjs-auth0/client';
import Link from 'next/link';
import { MyAssistant } from "@/components/MyAssistant";

const isPreviewEnvironment = () => {
  return process.env.AZURE_STATIC_WEBAPPS_ENVIRONMENT === 'preview' || !process.env.AUTH0_BASE_URL;
};

export default function Home() {
  const { user, error, isLoading } = useUser();

  if (isLoading) return (
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
