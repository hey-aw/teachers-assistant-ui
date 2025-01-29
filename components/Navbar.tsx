'use client';

import Link from 'next/link';
import AuthButton from './AuthButton';

export default function Navbar() {
    return (
        <nav className="fixed top-0 left-0 right-0 h-[60px] bg-white border-b border-gray-200 z-10 flex items-center px-4">
            <div className="flex items-center justify-between w-full max-w-7xl mx-auto">
                <div className="flex items-center gap-4">
                    <Link href="/" className="text-xl font-semibold">
                    🦔 Teacher's Assistant
                    </Link>
                </div>
                <div className="flex items-center gap-4">
                    <AuthButton />
                </div>
            </div>
        </nav>
    );
} 
