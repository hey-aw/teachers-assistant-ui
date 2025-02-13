'use client';

import { useUser } from '@auth0/nextjs-auth0/client';
import { MyAssistant } from "@/src/app/components/MyAssistant";

export default function Home() {
  const { user, error, isLoading } = useUser();

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>{error.message}</div>;

  if (!user) {
    return (
      <main className="h-dvh w-full bg-gradient-to-br from-blue-50 to-purple-50 relative overflow-hidden">
        <div className="flex items-center justify-center h-full gap-4">
          {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
          <a href="/api/auth/login?screen_hint=signup" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            Sign up
          </a>
          {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
          <a href="/api/auth/login">Login</a>
        </div>
      </main>
    );
  }

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
