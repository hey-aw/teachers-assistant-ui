import { getSession } from '@auth0/nextjs-auth0';
import { redirect } from 'next/navigation';
import { useTranslation } from 'react-i18next';

export default async function DashboardPage() {
    const session = await getSession();

    if (!session?.user) {
        redirect('/api/auth/login');
    }

    return (
        <div>
            <h1>Protected Dashboard</h1>
            <p>Welcome, {session.user.name}!</p>
        </div>
    );
}
