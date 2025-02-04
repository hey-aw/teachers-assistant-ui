import { redirect } from 'next/navigation';
import DashboardContent from './DashboardContent';

export default async function DashboardPage() {
    const session = null; // Simulate no session

    if (!session?.user) {
        redirect('/api/auth/login');
    }

    return <DashboardContent user={{ name: 'Guest' }} />;
}
