'use client';

import { useTranslation } from 'react-i18next';

interface DashboardContentProps {
    user: {
        name: string;
    };
}

export default function DashboardContent({ user }: DashboardContentProps) {
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