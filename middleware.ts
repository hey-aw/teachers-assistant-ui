import { withMiddlewareAuthRequired } from '@auth0/nextjs-auth0/edge';

export default withMiddlewareAuthRequired();

export const config = {
  matcher: [
    // Add routes that require authentication
    '/protected/:path*',
    '/api/protected/:path*',
  ],
}; 