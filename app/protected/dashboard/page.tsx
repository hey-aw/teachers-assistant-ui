import { getSession } from '@auth0/nextjs-auth0';
import { redirect } from 'next/navigation';

export default async function DashboardPage() {
    const session = await getSession();

    if (!session?.user) {
        redirect('/api/auth/login');
    }

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold">Protected Dashboard</h1>
            <div className="bg-white shadow sm:rounded-lg">
                <div className="px-4 py-5 sm:p-6">
                    <h2 className="text-lg font-medium">Welcome, {session.user.name}!</h2>
                    <div className="mt-3 text-sm text-gray-600">
                        <p>This is a protected page. You can only see this if you're logged in.</p>
                        <div className="mt-4">
                            <h3 className="font-medium">Your Profile:</h3>
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