'use client';

import { useRouter } from 'next/navigation';
import { getAllMockUsers } from '@/lib/mockAuth';
import { setCookie } from 'cookies-next';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';

export default function MockLoginPage() {
    const router = useRouter();
    const mockUsers = getAllMockUsers();

    const handleLogin = (email: string) => {
        setCookie('mockEmail', email, {
            path: '/',
            sameSite: 'lax'
        });

        setTimeout(() => {
            router.refresh();
            router.push('/');
        }, 100);
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen py-12 bg-gray-50">
            <div className="w-full max-w-md space-y-8">
                <div className="text-center">
                    <h2 className="mt-6 text-3xl font-bold tracking-tight text-gray-900">
                        Preview Environment Login
                    </h2>
                    <p className="mt-2 text-sm text-gray-600">
                        Select a user to login as
                    </p>
                </div>

                <div className="mt-8 space-y-4">
                    {mockUsers.map((user) => (
                        <Button
                            key={user.email}
                            onClick={() => handleLogin(user.email)}
                            className="w-full flex items-center space-x-3 py-6"
                            variant="outline"
                        >
                            <Avatar>
                                {user.picture ? (
                                    // eslint-disable-next-line @next/next/no-img-element
                                    <img src={user.picture} alt={user.name} />
                                ) : (
                                    <AvatarFallback>
                                        {user.name.charAt(0)}
                                    </AvatarFallback>
                                )}
                            </Avatar>
                            <div className="flex-1 text-left">
                                <div className="font-medium">{user.name}</div>
                                <div className="text-sm text-gray-500">{user.email}</div>
                            </div>
                        </Button>
                    ))}
                </div>
            </div>
        </div>
    );
} 