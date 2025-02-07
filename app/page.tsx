'use client';

import Link from 'next/link';
import { MyAssistant } from "@/components/MyAssistant";
import { useAuth } from '@/lib/hooks/useAuth';
import { useEffect } from 'react';
import { useState } from 'react';

export default function Home() {
  const { user, error, isLoading } = useAuth();
  const [loginUrl, setLoginUrl] = useState('/api/auth/login');

  useEffect(() => {
    console.log(`
      NEXT_PUBLIC_AZURE_STATIC_WEBAPPS_ENVIRONMENT: ${process.env.NEXT_PUBLIC_AZURE_STATIC_WEBAPPS_ENVIRONMENT}
      NEXT_PUBLIC_APP_ENV: ${process.env.NEXT_PUBLIC_APP_ENV}
      NODE_ENV: ${process.env.NODE_ENV}
      IS_PREVIEW: ${process.env.IS_PREVIEW}
    `)
    setLoginUrl(process.env.NEXT_PUBLIC_AZURE_STATIC_WEBAPPS_ENVIRONMENT != 'Production'
      ? '/mock-login'
      : '/api/auth/login');
  }, []);

  if (isLoading) return (
    <main className="h-dvh flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50 relative overflow-hidden">
      <div className="absolute inset-0">
        <div className="absolute -top-[400px] -left-[400px] w-[1200px] h-[1200px] bg-purple-300 rounded-full mix-blend-multiply filter blur-xl animate-blob opacity-30"></div>
        <div className="absolute -top-[200px] -right-[400px] w-[1200px] h-[1200px] bg-yellow-300 rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-2000 opacity-30"></div>
        <div className="absolute -bottom-[400px] left-1/4 w-[1200px] h-[1200px] bg-pink-300 rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-4000 opacity-30"></div>
      </div>
      <div className="relative z-10">Loading...</div>
    </main>
  );

  if (error) {
    let errorMessage = error.message;
    if (error.message.includes('Unprocessable Entity')) {
      errorMessage = 'The request could not be processed. Please check your input and try again.';
    }
    return (
      <main className="h-dvh flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50 relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute -top-[400px] -left-[400px] w-[1200px] h-[1200px] bg-purple-300 rounded-full mix-blend-multiply filter blur-xl animate-blob opacity-30"></div>
          <div className="absolute -top-[200px] -right-[400px] w-[1200px] h-[1200px] bg-yellow-300 rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-2000 opacity-30"></div>
          <div className="absolute -bottom-[400px] left-1/4 w-[1200px] h-[1200px] bg-pink-300 rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-4000 opacity-30"></div>
        </div>
        <div className="relative z-10">{errorMessage}</div>
      </main>
    );
  }

  if (user) {
    return (
      <main className="h-dvh w-full bg-gradient-to-br from-blue-50 to-purple-50 relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute -top-[400px] -left-[400px] w-[1200px] h-[1200px] bg-purple-300 rounded-full mix-blend-multiply filter blur-xl animate-blob opacity-30"></div>
          <div className="absolute -top-[200px] -right-[400px] w-[1200px] h-[1200px] bg-yellow-300 rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-2000 opacity-30"></div>
          <div className="absolute -bottom-[400px] left-1/4 w-[1200px] h-[1200px] bg-pink-300 rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-4000 opacity-30"></div>
        </div>
        <div className="relative z-10 h-[calc(100%-60px)] w-full pt-[60px]">
          <div className="h-full max-w-5xl mx-auto px-4">
            <div className="bg-white/80 backdrop-blur-sm shadow-lg h-full overflow-hidden rounded-xl border border-gray-200">
              <MyAssistant />
            </div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="h-dvh flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50 relative overflow-hidden">
      <div className="absolute inset-0">
        <div className="absolute -top-[400px] -left-[400px] w-[1200px] h-[1200px] bg-purple-300 rounded-full mix-blend-multiply filter blur-xl animate-blob opacity-30"></div>
        <div className="absolute -top-[200px] -right-[400px] w-[1200px] h-[1200px] bg-yellow-300 rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-2000 opacity-30"></div>
        <div className="absolute -bottom-[400px] left-1/4 w-[1200px] h-[1200px] bg-pink-300 rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-4000 opacity-30"></div>
      </div>
      <div className="relative z-10 text-center space-y-8 max-w-2xl w-full px-6">
        <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Ready to Begin?
        </h1>
        <p className="text-gray-600 text-xl">Connect with your AI assistant and start exploring</p>
        <a href={loginUrl}
          className="inline-flex items-center justify-center px-12 py-4 text-lg font-medium text-white bg-gradient-to-r from-blue-500 to-purple-500 rounded-full overflow-hidden transition-all duration-300 hover:from-blue-600 hover:to-purple-600 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 transform hover:scale-105">
          <span className="relative">Login to Continue</span>
        </a>
      </div>
    </main>
  );
}
