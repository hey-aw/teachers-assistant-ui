'use client';

import { useUser } from '@auth0/nextjs-auth0/client';
import React from 'react';
import Link from 'next/link';

export default function ProfilePage() {
    const { user, error, isLoading } = useUser();

    if (typeof window === 'undefined' || isLoading) {
        return (
            <div className="flex justify-center items-center min-h-[50vh]">
                <div className="text-lg opacity-50">Loading...</div>
            </div>
        );
    }

    if (error) {
        let errorMessage = error.message;
        if (error.message.includes('Unprocessable Entity')) {
            errorMessage = 'The request could not be processed. Please check your input and try again.';
        }
        return (
            <div className="flex justify-center items-center min-h-[50vh]">
                <div className="text-red-500">{errorMessage}</div>
            </div>
        );
    }

    if (!user) return (
        <div className="flex justify-center items-center min-h-[50vh]">
            <div className="text-lg">Please log in to view your profile.</div>
            <Link href="/api/auth/login"
                className="inline-flex items-center justify-center px-12 py-4 text-lg font-medium text-white bg-gradient-to-r from-blue-500 to-purple-500 rounded-full overflow-hidden transition-all duration-300 hover:from-blue-600 hover:to-purple-600 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 transform hover:scale-105 mt-4">
                <span className="relative">Login</span>
            </Link>
        </div>
    );

    return (
        <div className="max-w-md mx-auto mt-8 p-6 bg-white rounded-lg shadow-md">
            <div className="text-center">
                {user.picture && (
                    <img
                        src={user.picture}
                        alt={user.name || 'Profile picture'}
                        className="w-24 h-24 rounded-full mx-auto mb-4 border-2 border-gray-200"
                    />
                )}
                <h1 className="text-2xl font-bold mb-2">{user.name}</h1>
                <p className="text-gray-600 mb-4">{user.email}</p>
            </div>

            <div className="mt-6 border-t pt-4">
                <h2 className="text-lg font-semibold mb-2">Profile Information</h2>
                <dl className="space-y-2">
                    {Object.entries(user).map(([key, value]) => (
                        key !== 'picture' && (
                            <div key={key} className="grid grid-cols-3 gap-2">
                                <dt className="text-gray-600 font-medium">{key}:</dt>
                                <dd className="col-span-2">{String(value)}</dd>
                            </div>
                        )
                    ))}
                </dl>
            </div>

            <div className="mt-6 text-center">
                <a
                    href="/api/auth/logout"
                    className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-red-600 to-red-700 rounded-lg hover:from-red-500 hover:to-red-600 transition-all duration-200 shadow-sm hover:shadow-md active:scale-95"
                >
                    Logout
                </a>
            </div>
        </div>
    );
}
