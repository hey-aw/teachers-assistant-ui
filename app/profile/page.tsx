'use client';

import { useUser } from '@auth0/nextjs-auth0/client';
import React, { useState, useEffect } from 'react';

const { DISABLE_AUTH } = process.env;

// Simple hash function for client-side use
function simpleHash(str: string): string {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash).toString(16);
}

export default function ProfilePage() {
    const { user, error, isLoading } = useUser();
    const [selectedUser, setSelectedUser] = useState<string | null>(null);

    useEffect(() => {
        // Initialize from localStorage
        const storedUser = localStorage.getItem('selectedUser');
        if (storedUser) {
            setSelectedUser(storedUser);
        }
    }, []);

    const handleUserChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        const newUser = event.target.value;
        setSelectedUser(newUser);
        localStorage.setItem('selectedUser', newUser);
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
            <div className="flex flex-col justify-center items-center min-h-[50vh] space-y-8">
                <div className="text-lg">Authentication is disabled for this preview build.</div>
                <div className="w-full max-w-md">
                    <label htmlFor="user-select" className="block text-sm font-medium text-gray-700 mb-2">
                        Select a user for testing:
                    </label>
                    <select
                        id="user-select"
                        name="user-select"
                        className="w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                        value={selectedUser || ''}
                        onChange={handleUserChange}
                    >
                        <option value="">Select a user</option>
                        <option value="aw@eddolearning.com">aw@eddolearning.com</option>
                        <option value="aw+test@eddolearning.com">aw+test@eddolearning.com</option>
                        <option value="joel@eddolearning.com">joel@eddolearning.com</option>
                    </select>
                </div>
                {selectedUser && (
                    <div className="max-w-md w-full bg-white p-6 rounded-lg shadow-md">
                        <div className="text-center">
                            <img
                                src={`https://www.gravatar.com/avatar/${simpleHash(selectedUser)}?d=mp`}
                                alt={selectedUser.split('@')[0]}
                                className="w-24 h-24 rounded-full mx-auto mb-4 border-2 border-gray-200"
                            />
                            <h1 className="text-2xl font-bold mb-2">{selectedUser.split('@')[0]}</h1>
                            <p className="text-gray-600 mb-4">{selectedUser}</p>
                        </div>
                    </div>
                )}
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
