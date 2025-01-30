import { getSession } from '@auth0/nextjs-auth0';
import { redirect } from 'next/navigation';
import DashboardContent from './DashboardContent';

export default async function DashboardPage() {
    const session = await getSession();

    if (!session?.user) {
        redirect('/api/auth/login');
    }

    return <DashboardContent user={{ name: session.user.name }} />;
}
