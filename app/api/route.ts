import { NextRequest, NextResponse } from 'next/server';
import { getAccessToken } from '@auth0/nextjs-auth0';

export async function GET(req: NextRequest) {
    try {
        const { accessToken } = await getAccessToken(req, new NextResponse());
        return NextResponse.json({ accessToken });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to get access token' }, { status: 500 });
    }
} 