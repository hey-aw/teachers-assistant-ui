import { getSession } from '@auth0/nextjs-auth0';
import { redirect } from 'next/navigation';
import DashboardContent from './DashboardContent';
import Link from 'next/link';

export default async function DashboardPage() {
    const session = await getSession();

    if (!session?.user) {
        redirect('/api/auth/login');
    }

    return (
        <>
            <DashboardContent user={{ name: session.user.name }} />
            <div className="mt-6 text-center">
                <Link
                    href="/api/auth/logout"
                    className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-red-600 to-red-700 rounded-lg hover:from-red-500 hover:to-red-600 transition-all duration-200 shadow-sm hover:shadow-md active:scale-95"
                >
                    Logout
                </Link>
            </div>
        </>
    );
}
