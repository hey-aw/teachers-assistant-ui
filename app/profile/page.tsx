'use client';

import React from 'react';

export default function ProfilePage() {
    // Simulate user data
    const user = {
        name: 'Test User',
        email: 'test@example.com',
        picture: 'https://example.com/profile.jpg',
    };

    if (typeof window === 'undefined') {
        return (
            <div className="flex justify-center items-center min-h-[50vh]">
                <div className="text-lg opacity-50">Loading...</div>
            </div>
        );
    }

    if (!user) return (
        <div className="flex justify-center items-center min-h-[50vh]">
            <div className="text-lg">Please log in to view your profile.</div>
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
        </div>
    );
}
