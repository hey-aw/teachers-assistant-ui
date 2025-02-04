'use client';

import { useUser } from '@auth0/nextjs-auth0/client';
import { MyAssistant } from "@/components/MyAssistant";

const { DISABLE_AUTH } = process.env;

export default function Home() {
  // If auth is disabled, render the main content directly
  if (DISABLE_AUTH === 'true') {
    return (
      <main className="h-dvh">
        <MyAssistant />
      </main>
    );
  }

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

  return (
    <main className="h-dvh flex items-center justify-center">
      <div>Please log in to access the assistant.</div>
    </main>
  );
}
