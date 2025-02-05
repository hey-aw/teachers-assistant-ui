import { handleAuth } from '@auth0/nextjs-auth0';
import { NextRequest, NextResponse } from 'next/server';
import { getMockUser } from '@/lib/mockAuth';

const isPreviewEnvironment = () => {
    const isPreview = process.env.AZURE_STATIC_WEBAPPS_ENVIRONMENT === 'preview' || !process.env.AUTH0_BASE_URL;
    console.log('[Auth] Environment check:', {
        AZURE_STATIC_WEBAPPS_ENVIRONMENT: process.env.AZURE_STATIC_WEBAPPS_ENVIRONMENT,
        AUTH0_BASE_URL: process.env.AUTH0_BASE_URL,
        isPreview,
        timestamp: new Date().toISOString()
    });
    return isPreview;
}

export const GET = async (req: NextRequest) => {
    const requestId = Math.random().toString(36).substring(7);
    console.log(`[Auth ${requestId}] Request received:`, {
        url: req.nextUrl.toString(),
        pathname: req.nextUrl.pathname,
        method: req.method,
        headers: Object.fromEntries(req.headers.entries()),
        cookies: Object.fromEntries(req.cookies.getAll().map(c => [c.name, c.value])),
        timestamp: new Date().toISOString()
    });

    const isPreview = isPreviewEnvironment();
    console.log(`[Auth ${requestId}] Environment status:`, { isPreview });

    // Handle mock auth in preview environment
    if (isPreview) {
        const url = req.nextUrl;
        // If this is the /me endpoint
        if (url.pathname === '/api/auth/me') {
            const mockEmail = req.cookies.get('mockEmail')?.value;
            console.log(`[Auth ${requestId}] ME endpoint:`, {
                mockEmail,
                hasEmailCookie: !!mockEmail,
                cookieValue: req.cookies.get('mockEmail')
            });

            if (mockEmail) {
                const mockUser = getMockUser(mockEmail);
                console.log(`[Auth ${requestId}] Mock user lookup:`, {
                    mockEmail,
                    userFound: !!mockUser,
                    mockUser
                });

                if (mockUser) {
                    console.log(`[Auth ${requestId}] Returning mock user`);
                    return NextResponse.json({ user: mockUser }, { status: 200 });
                }
            }
            // No mock user found, return null user
            console.log(`[Auth ${requestId}] No valid mock user, returning null`);
            return NextResponse.json({ user: null }, { status: 200 });
        }

        // For login endpoint, redirect to mock-login
        if (url.pathname === '/api/auth/login') {
            console.log('Login endpoint: redirecting to mock-login');
            return NextResponse.redirect('/mock-login', 307);
        }

        // For logout in mock mode, just clear the cookie and redirect to home
        if (url.pathname === '/api/auth/logout') {
            console.log(`[Auth ${requestId}] Logout: clearing cookie and redirecting`);
            const response = NextResponse.redirect('/', 307);
            const expires = new Date(0);
            expires.setUTCHours(0, 0, 0, 0);
            response.cookies.set('mockEmail', '', {
                path: '/',
                expires: new Date(Date.UTC(1970, 0, 1, 0, 0, 0, 0))
            });
            console.log(`[Auth ${requestId}] Logout response:`, {
                status: response.status,
                headers: Object.fromEntries(response.headers.entries()),
                cookies: response.cookies.getAll()
            });
            return response;
        }
    }

    // Use Auth0 handler for non-preview environment
    console.log(`[Auth ${requestId}] Using Auth0 handler`);
    const handler = handleAuth({
        onError(req: Request, error: Error) {
            console.error(`[Auth ${requestId}] Auth0 Error in onError handler:`, {
                error: error.message,
                stack: error.stack,
                timestamp: new Date().toISOString()
            });
            return NextResponse.json({
                error: error.message,
                status: 'error'
            }, { status: 500 });
        },
    });

    try {
        console.log(`[Auth ${requestId}] Calling Auth0 handler`);
        const response = await handler(req);
        console.log(`[Auth ${requestId}] Auth0 response:`, {
            status: response.status,
            ok: response.ok,
            type: response.type,
            headers: Object.fromEntries(response.headers.entries()),
            timestamp: new Date().toISOString()
        });

        // Return the Auth0 response directly
        return response;
    } catch (error) {
        console.error(`[Auth ${requestId}] Auth0 Error in handler:`, {
            error: error instanceof Error ? {
                message: error.message,
                stack: error.stack,
                name: error.name
            } : error,
            timestamp: new Date().toISOString()
        });
        return NextResponse.json({
            error: error instanceof Error ? error.message : 'Internal server error',
            status: 'error'
        }, { status: 500 });
    }
};

// Also support POST method for callbacks
export const POST = handleAuth();