import { getSession } from '@auth0/nextjs-auth0';
import { redirect } from 'next/navigation';
import { useTranslation } from 'react-i18next';

export default async function DashboardPage() {
    const session = await getSession();
    const { t } = useTranslation();

    if (!session?.user) {
        redirect('/api/auth/login');
    }

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold">{t('protected_dashboard')}</h1>
            <div className="bg-white shadow sm:rounded-lg">
                <div className="px-4 py-5 sm:p-6">
                    <h2 className="text-lg font-medium">{t('welcome_user', { name: session.user.name })}</h2>
                    <div className="mt-3 text-sm text-gray-600">
                        <p>{t('protected_page_message')}</p>
                        <div className="mt-4">
                            <h3 className="font-medium">{t('your_profile')}</h3>
                            <pre className="mt-2 p-4 bg-gray-50 rounded-md overflow-auto">
                                {JSON.stringify(session.user, null, 2)}
                            </pre>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
