'use client';

import { useUser } from '@auth0/nextjs-auth0/client';
import * as Avatar from '@radix-ui/react-avatar';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { LogOut, User } from 'lucide-react';

export default function ProfileButton() {
    const { user, isLoading } = useUser();

    if (isLoading) return <div className="h-8 w-8 animate-pulse rounded-full bg-gray-200" />;

    if (!user) {
        return (
            // eslint-disable-next-line @next/next/no-html-link-for-pages
            <a
                href="/api/auth/login"
                className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90"
            >
                Sign in
            </a>
        );
    }

    return (
        <DropdownMenu.Root>
            <DropdownMenu.Trigger asChild>
                <button
                    className="rounded-full outline-none ring-offset-2 transition-opacity hover:opacity-80 focus:ring-2 focus:ring-primary"
                    aria-label="User menu"
                >
                    <Avatar.Root className="inline-flex h-8 w-8 select-none items-center justify-center overflow-hidden rounded-full bg-primary align-middle">
                        {user.picture ? (
                            <Avatar.Image
                                className="h-full w-full object-cover"
                                src={user.picture}
                                alt={user.name || 'User avatar'}
                            />
                        ) : (
                            <Avatar.Fallback
                                className="flex h-full w-full items-center justify-center bg-primary text-white"
                                delayMs={600}
                            >
                                <User className="h-4 w-4" />
                            </Avatar.Fallback>
                        )}
                    </Avatar.Root>
                </button>
            </DropdownMenu.Trigger>

            <DropdownMenu.Portal>
                <DropdownMenu.Content
                    className="min-w-[220px] rounded-md bg-white p-1 shadow-md"
                    sideOffset={5}
                    align="end"
                >
                    <div className="border-b px-2 py-1.5">
                        <p className="text-sm font-medium">{user.name}</p>
                        <p className="text-xs text-gray-500">{user.email}</p>
                    </div>

                    <DropdownMenu.Item asChild>
                        {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
                        <a
                            href="/api/auth/logout"
                            className="flex cursor-default select-none items-center rounded-sm px-2 py-2 text-sm outline-none hover:bg-gray-100 focus:bg-gray-100"
                        >
                            <LogOut className="mr-2 h-4 w-4" />
                            Logout
                        </a>
                    </DropdownMenu.Item>
                </DropdownMenu.Content>
            </DropdownMenu.Portal>
        </DropdownMenu.Root>
    );
}
