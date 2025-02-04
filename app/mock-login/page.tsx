'use client';

import { getAllMockUsers } from '@/lib/mockAuth';
import { useRouter } from 'next/navigation';
import { setCookie } from 'cookies-next';

export default function MockLoginPage() {
    const router = useRouter();
    const mockUsers = getAllMockUsers();

    const login = async (email: string) => {
        setCookie('mockEmail', email, {
            path: '/',
            secure: true,
            sameSite: 'strict'
        });
        router.push('/');
    };

    return (
        <div className="p-4">
            <h1 className="text-2xl mb-4">Mock Login (Preview Environment)</h1>
            <div className="space-y-2">
                {mockUsers.map(user => (
                    <button
                        key={user.email}
                        onClick={() => login(user.email)}
                        className="block w-full p-2 text-left border rounded hover:bg-gray-100"
                    >
                        Login as {user.email}
                    </button>
                ))}
            </div>
        </div>
    );
} 