import { handleAuth } from '@auth0/nextjs-auth0';

export const GET = handleAuth({
    onError(req: Request, error: Error) {
        console.error('Auth0 Error:', error);
        return new Response(JSON.stringify({
            error: error.message,
            status: 'error'
        }), {
            status: 500,
            headers: {
                'Content-Type': 'application/json'
            }
        });
    },
});

// Also support POST method for callbacks
export const POST = handleAuth();