'use client';

import { getSession } from '@auth0/nextjs-auth0';
import { redirect } from 'next/navigation';
import { useTranslation } from 'react-i18next';

function DashboardContent({ user }) {
    const { t } = useTranslation(undefined, {
        useSuspense: false
    });

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold">{t('protected_dashboard')}</h1>
            <div>
                <p>{t('welcome')}, {user.name}!</p>
            </div>
        </div>
    );
}

export default async function DashboardPage() {
    const session = await getSession();

    if (!session?.user) {
        redirect('/api/auth/login');
    }

    return <DashboardContent user={session.user} />;
}
