import { withMiddlewareAuthRequired } from '@auth0/nextjs-auth0/edge';
import { NextRequest, NextResponse } from 'next/server';

const { DISABLE_AUTH } = process.env;

// If auth is disabled, use a pass-through middleware
const middleware = DISABLE_AUTH === 'true'
  ? async (req: NextRequest) => NextResponse.next()
  : withMiddlewareAuthRequired();

export default middleware;

// Configure which paths require authentication
export const config = {
  matcher: [
    // Add routes that should be protected when auth is enabled
    '/api/((?!auth).*)',
    '/protected/:path*'
  ]
};
