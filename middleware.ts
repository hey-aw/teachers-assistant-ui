import { withMiddlewareAuthRequired } from '@auth0/nextjs-auth0/edge';

export default withMiddlewareAuthRequired();

export const config = {
  matcher: [
    '/protected/:path*',  // Protect all routes under /protected
    '/api/protected/:path*',  // Protect API routes under /api/protected
  ]
};
