'use client';

import Image from 'next/image';
import { useTranslation } from 'react-i18next';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { getCookie } from 'cookies-next';
import { useAuth } from '@/lib/hooks/useAuth';

const isPreviewEnvironment = () => {
    return process.env.NEXT_PUBLIC_MOCK_AUTH === 'true';
}

interface UserDisplayInfo {
    name: string;
    nickname?: string;
    picture?: string;
}

const getUserDisplayInfo = (user: any): UserDisplayInfo => {
    // For mock users, use name as nickname
    if (process.env.NEXT_PUBLIC_MOCK_AUTH === 'true') {
        return {
            name: user.name,
            nickname: user.name,
            picture: undefined
        };
    }
    // For Auth0 users, use their profile info
    return {
        name: user.name,
        nickname: user.nickname,
        picture: user.picture
    };
};

export default function AuthButton() {
    const { user, error, isLoading } = useAuth();
    const { t } = useTranslation();
    const [isPreview, setIsPreview] = useState(isPreviewEnvironment());

    useEffect(() => {
        const updatePreviewState = () => {
            setIsPreview(isPreviewEnvironment());
        };
        updatePreviewState();

        // Check for cookie changes
        const interval = setInterval(updatePreviewState, 1000);
        return () => clearInterval(interval);
    }, []);

    // Debug user state on every render
    console.log('Auth State:', {
        user,
        error,
        isLoading,
        isPreview,
        welcomeMessage: user ? t('welcome_user', { name: user.name }) : null,
        mockEmailCookie: getCookie('mockUserEmail')
    });

    if (isLoading) return <div>{t('loading')}</div>;
    if (error) return <div>{t('error', { message: error.message })}</div>;

    if (user) {
        const userInfo = getUserDisplayInfo(user);
        return (
            <div className="flex items-center gap-4">
                <span className="block">{t('welcome_user', { name: userInfo.nickname || userInfo.name })}</span>
                {userInfo.picture && (
                    <Link href="/profile" className="hover:opacity-80 transition-opacity">
                        <Image
                            src={userInfo.picture}
                            alt={'User avatar'}
                            width={32}
                            height={32}
                            className="w-8 h-8 rounded-full"
                        />
                    </Link>
                )}
                <a
                    href={isPreview ? "/" : "/api/auth/logout"}
                    className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-500"
                >
                    {t('logout')}
                </a>
            </div>
        );
    }

    const loginUrl = isPreviewEnvironment() ? "/mock-login" : "/api/auth/login";
    console.log('[AuthButton] Login URL:', loginUrl);

    return (
        <a
            href={isPreview ? "/mock-login" : "/api/auth/login"}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-500"
        >
            {t('login')}
        </a>
    );
}
