'use client';

import React from 'react';

export default function ProfilePage() {
    if (typeof window === 'undefined') {
        return (
            <div className="flex justify-center items-center min-h-[50vh]">
                <div className="text-lg opacity-50">Loading...</div>
            </div>
        );
    }

    return (
        <div className="max-w-md mx-auto mt-8 p-6 bg-white rounded-lg shadow-md">
            <div className="text-center">
                <h1 className="text-2xl font-bold mb-2">Profile Page</h1>
                <p className="text-gray-600 mb-4">This is a placeholder for the profile page content.</p>
            </div>
        </div>
    );
}
