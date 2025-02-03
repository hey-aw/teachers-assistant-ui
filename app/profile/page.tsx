'use client';

import { useUser } from '@auth0/nextjs-auth0/client';
import React, { useState } from 'react';

const { DISABLE_AUTH } = process.env;

export default function ProfilePage() {
    const { user, error, isLoading } = useUser();
    const [selectedUser, setSelectedUser] = useState<string | null>(null);

    const handleUserChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        setSelectedUser(event.target.value);
    };

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

    if (!user && !DISABLE_AUTH) return (
        <div className="flex justify-center items-center min-h-[50vh]">
            <div className="text-lg">Please log in to view your profile.</div>
        </div>
    );

    if (DISABLE_AUTH) {
        return (
            <div className="flex justify-center items-center min-h-[50vh]">
                <div className="text-lg">Authentication is disabled for this preview build.</div>
                <div className="mt-4">
                    <label htmlFor="user-select" className="block text-sm font-medium text-gray-700">
                        Select a user for testing:
                    </label>
                    <select
                        id="user-select"
                        name="user-select"
                        className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                        value={selectedUser || ''}
                        onChange={handleUserChange}
                    >
                        <option value="">Select a user</option>
                        <option value="aw@eddolearning.com">aw@eddolearning.com</option>
                        <option value="aw+test@eddolearning.com">aw+test@eddolearning.com</option>
                        <option value="joel@eddolearning.com">joel@eddolearning.com</option>
                    </select>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-md mx-auto mt-8 p-6 bg-white rounded-lg shadow-md">
            <div className="text-center">
                {user && user.picture && (
                    <img
                        src={user.picture}
                        alt={user.name || 'Profile picture'}
                        className="w-24 h-24 rounded-full mx-auto mb-4 border-2 border-gray-200"
                    />
                )}
                <h1 className="text-2xl font-bold mb-2">{user?.name}</h1>
                <p className="text-gray-600 mb-4">{user?.email}</p>
            </div>

            <div className="mt-6 border-t pt-4">
                <h2 className="text-lg font-semibold mb-2">Profile Information</h2>
                <dl className="space-y-2">
                    {user && Object.entries(user).map(([key, value]) => (
                        key !== 'picture' && (
                            <div key={key} className="grid grid-cols-3 gap-2">
                                <dt className="text-gray-600 font-medium">{key}:</dt>
                                <dd className="col-span-2">{String(value)}</dd>
                            </div>
                        )
                    ))}
                </dl>
            </div>
        </div>
    );
}
