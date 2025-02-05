'use client';

import { getAllMockUsers } from '@/lib/mockAuth';
import { useRouter } from 'next/navigation';
import { setCookie, getCookie } from 'cookies-next';

export default function MockLoginPage() {
    const router = useRouter();
    const mockUsers = getAllMockUsers();

    const login = (email: string) => {
        console.log('[MockLogin] Setting cookie for:', email);
        setCookie('mockEmail', email, {
            path: '/',
            sameSite: 'lax'
        });
        console.log('[MockLogin] Cookie after setting:', getCookie('mockEmail'));
        router.refresh();
        setTimeout(() => router.push('/'), 100);
    };

    console.log('[MockLogin] Available users:', mockUsers);
    console.log('[MockLogin] Current cookie:', getCookie('mockEmail'));

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
            <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6">
                <h1 className="text-2xl font-bold text-gray-900 mb-6 text-center">Preview Environment Login</h1>
                <p className="text-gray-600 mb-6 text-center">Select a test user to continue:</p>
                <div className="space-y-3">
                    {mockUsers.map(user => (
                        <button
                            key={user.email}
                            onClick={() => login(user.email)}
                            className="block w-full p-4 text-left border rounded-lg hover:bg-gray-50 transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <div className="flex items-center space-x-3">
                                <div className="flex-shrink-0">
                                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                                        <span className="text-blue-600 font-semibold text-lg">
                                            {user.name.charAt(0)}
                                        </span>
                                    </div>
                                </div>
                                <div>
                                    <div className="font-medium text-gray-900">{user.name}</div>
                                    <div className="text-sm text-gray-500">{user.email}</div>
                                </div>
                            </div>
                        </button>
                    ))}
                </div>
                <div className="mt-6 pt-6 border-t border-gray-200">
                    <p className="text-sm text-gray-500 text-center">
                        This is a preview environment mock login.
                        <br />
                        No real authentication is performed.
                    </p>
                </div>
            </div>
        </div>
    );
} 
