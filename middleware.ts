import { withMiddlewareAuthRequired } from '@auth0/nextjs-auth0/edge';
import { NextRequest, NextResponse } from 'next/server';

const { DISABLE_AUTH } = process.env;

const middleware = DISABLE_AUTH
  ? (req: NextRequest, _res: NextResponse, next: () => void) => next()
  : withMiddlewareAuthRequired();

export default middleware;

export const config = {
  matcher: [
    // Add routes that require authentication
    '/protected/:path*',
    '/api/protected/:path*',
  ],
};
