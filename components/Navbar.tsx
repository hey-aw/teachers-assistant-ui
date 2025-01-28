'use client';

import Link from 'next/link';
import AuthButton from './AuthButton';

export default function Navbar() {
    return (
        <nav className="h-full flex flex-col">
            <div className="p-4">
                <Link href="/" className="text-xl font-bold text-gray-800">
                    Assistant UI
                </Link>
            </div>
            <div className="flex flex-col space-y-4 p-4">
                <Link href="/" className="text-gray-600 hover:text-gray-900">
                    Home
                </Link>
                <Link href="/protected/dashboard" className="text-gray-600 hover:text-gray-900">
                    Dashboard
                </Link>
            </div>
            <div className="mt-auto p-4">
                <AuthButton />
            </div>
        </nav>
    );
} 
