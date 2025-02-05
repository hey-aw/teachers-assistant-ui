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

export default function AuthButton() {
    const { user, error, isLoading } = useAuth();
    const { t } = useTranslation();
    const [isPreview, setIsPreview] = useState(false);

    useEffect(() => {
        setIsPreview(isPreviewEnvironment());
    }, []);

    // Debug user state on every render
    console.log('Auth State:', {
        user,
        error,
        isLoading,
        isPreview,
        welcomeMessage: user ? t('welcome_user', { name: user.nickname || user.name }) : null,
        mockEmailCookie: getCookie('mockEmail')
    });

    if (isLoading) return <div>{t('loading')}</div>;
    if (error) return <div>{t('error', { message: error.message })}</div>;

    if (user) {
        return (
            <div className="flex items-center gap-4">
                <span className="block">{t('welcome_user', { name: user.nickname || user.name })}</span>
                {user.picture && (
                    <Link href="/profile" className="hover:opacity-80 transition-opacity">
                        <Image
                            src={user.picture}
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
