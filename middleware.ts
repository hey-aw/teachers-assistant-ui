import { withMiddlewareAuthRequired } from '@auth0/nextjs-auth0/edge';

const { DISABLE_AUTH } = process.env;

const middleware = DISABLE_AUTH ? (req, res, next) => next() : withMiddlewareAuthRequired();

export default middleware;

export const config = {
  matcher: [
    // Add routes that require authentication
    '/protected/:path*',
    '/api/protected/:path*',
  ],
};
