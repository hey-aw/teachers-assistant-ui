'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserProfile, UserContext } from '@auth0/nextjs-auth0/client';

const MockUserContext = createContext<UserContext>({
    user: undefined,
    error: undefined,
    isLoading: false,
    checkSession: () => Promise.resolve(),
});

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

export const MockUserProvider = ({ children }: { children: React.ReactNode }) => {
    const [selectedUser, setSelectedUser] = useState<string | null>(null);
    const [user, setUser] = useState<UserProfile | undefined>(undefined);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        // Listen for changes to the selected user in localStorage
        const handleStorageChange = (e: StorageEvent) => {
            if (e.key === 'selectedUser') {
                const newUser = e.newValue;
                if (newUser) {
                    setSelectedUser(newUser);
                }
            }
        };

        // Initialize from localStorage
        const storedUser = localStorage.getItem('selectedUser');
        if (storedUser) {
            setSelectedUser(storedUser);
        }

        window.addEventListener('storage', handleStorageChange);
        return () => window.removeEventListener('storage', handleStorageChange);
    }, []);

    useEffect(() => {
        if (selectedUser) {
            const hash = simpleHash(selectedUser);
            // Create a mock user profile based on the selected email
            setUser({
                email: selectedUser,
                email_verified: true,
                name: selectedUser.split('@')[0],
                nickname: selectedUser.split('@')[0],
                picture: `https://www.gravatar.com/avatar/${hash}?d=mp`,
                sub: `mock|${hash}`,
                updated_at: new Date().toISOString(),
            });
        } else {
            setUser(undefined);
        }
    }, [selectedUser]);

    const value = {
        user,
        error: undefined,
        isLoading,
        checkSession: () => Promise.resolve(),
    };

    return (
        <MockUserContext.Provider value={value}>
            {children}
        </MockUserContext.Provider>
    );
}; 