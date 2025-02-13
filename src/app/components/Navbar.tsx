'use client';

import Link from 'next/link';

export default function Navbar() {

    return (
        <nav className="fixed top-0 left-0 right-0 h-[60px] bg-white/80 backdrop-blur-sm border-b border-gray-200/50 z-50 flex items-center px-4">
            <div className="flex items-center justify-between w-full max-w-7xl mx-auto">
                <div className="flex items-center gap-4">
                    <Link href="/" className="text-xl font-semibold">
                        🦔 Teacher&apos;s Assistant
                    </Link>
                </div>
                <div className="flex items-center gap-4">
                    <div>
                        {/* TODO: Add language selection */}
                    </div>
                </div>
            </div>
        </nav>
    );
}
