'use client';

import Image from 'next/image';
import { useTranslation } from 'react-i18next';
import Link from 'next/link';
import { useAuth } from '@/lib/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { deleteCookie } from 'cookies-next';
import { useEffect, useState } from 'react';

export default function AuthButton() {
    const { user, error, isLoading } = useAuth();
    const { t } = useTranslation();
    const router = useRouter();
    const [isPreview, setIsPreview] = useState(false);

    useEffect(() => {
        setIsPreview(process.env.NEXT_PUBLIC_SWA_APP_ENV_IS_PREVIEW === 'true');
    }, []);

    const handleLogout = () => {
        if (isPreview) {
            deleteCookie('mockEmail');
            router.refresh();
            router.push('/');
            return;
        }
        window.location.href = '/api/auth/logout';
    };

    if (isLoading) return <div className="animate-pulse text-gray-500">{t('loading')}</div>;
    if (error) return <div className="text-red-500">{t('error', { message: error.message })}</div>;

    if (user) {
        return (
            <div className="flex items-center gap-4">
                <span className="block font-medium text-gray-700">{t('welcome_user', { name: user.nickname || user.name })}</span>
                {user.picture && (
                    <Link href="/profile" className="relative group">
                        <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full opacity-0 group-hover:opacity-100 transition duration-200"></div>
                        <Image
                            src={user.picture}
                            alt={'User avatar'}
                            width={32}
                            height={32}
                            className="relative w-8 h-8 rounded-full object-cover ring-2 ring-white"
                        />
                    </Link>
                )}
                <button
                    onClick={handleLogout}
                    className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-red-600 to-red-700 rounded-lg hover:from-red-500 hover:to-red-600 transition-all duration-200 shadow-sm hover:shadow-md active:scale-95"
                >
                    {t('logout')}
                </button>
            </div>
        );
    }

    const loginUrl = isPreview ? "/mock-login" : "/api/auth/login";

    return (
        <Link
            href={loginUrl}
            className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg hover:from-blue-500 hover:to-indigo-500 transition-all duration-200 shadow-sm hover:shadow-md active:scale-95"
        >
            {t('login')}
        </Link>
    );
}
