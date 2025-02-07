import { handleAuth } from '@auth0/nextjs-auth0';

const handler = handleAuth();

export async function GET(request: Request, { params }: { params: { auth0: string } }) {
    return handler(request);
}

export async function POST(request: Request, { params }: { params: { auth0: string } }) {
    return handler(request);
}
