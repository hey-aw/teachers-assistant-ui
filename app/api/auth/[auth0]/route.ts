import { handleAuth, getSession } from '@auth0/nextjs-auth0';
import { NextRequest } from 'next/server';

export async function GET(req: NextRequest) {
    const auth = handleAuth();
    return auth(req);
}

// Also support POST method for callbacks
export const POST = handleAuth();