'use client';

import { useUser } from '@auth0/nextjs-auth0/client';
import Image from 'next/image';

export default function AuthButton() {
    const { user, error, isLoading } = useUser();

    if (isLoading) return <div>Loading...</div>;
    if (error) return <div>Error: {error.message}</div>;

    if (user) {
        return (
            <div className="flex items-center gap-4">
                <span className="hidden sm:block">Welcome, {user.nickname || user.name}!</span>
                {user.picture && (
                    <Image
                        src={user.picture}
                        alt={'User avatar'}
                        width={32}
                        height={32}
                        className="w-8 h-8 rounded-full"
                    />
                )}
                <a
                    href="/api/auth/logout"
                    className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-500"
                >
                    Logout
                </a>
            </div>
        );
    }

    return (
        <a
            href="/api/auth/login"
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-500"
        >
            Login
        </a>
    );
} 