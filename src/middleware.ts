import type { NextRequest } from "next/server";
import { auth0 } from "./lib/auth0";

export async function middleware(request: NextRequest) {
  // Skip auth for all auth-related routes
  if (request.nextUrl.pathname.startsWith('/api/auth')) {
    return;
  }

  return await auth0.middleware(request);
}

export const config = {
  matcher: [
    // Protected routes
    '/api/:path*',
    '/dashboard/:path*',

    // Exclude public files
    '/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)',
  ],
};