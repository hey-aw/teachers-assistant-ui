'use client';

import React from 'react';

// Mock user context that mimics Auth0's UserProvider
export const MockUserProvider = ({ children }: { children: React.ReactNode }) => {
    return <>{children}</>;
}; 