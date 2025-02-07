import { withMiddlewareAuthRequired } from '@auth0/nextjs-auth0/edge';
import { NextResponse } from 'next/server';
import type { NextRequest, NextFetchEvent } from 'next/server';

function isPreviewEnvironment() {
  return process.env.AZURE_STATIC_WEBAPPS_ENVIRONMENT === 'preview' || !process.env.AUTH0_BASE_URL;
}

// Base middleware function for handling CORS and API keys
async function handleCorsAndApiKey(request: NextRequest) {
  // Handle preflight requests
  if (request.method === 'OPTIONS') {
    const response = new NextResponse(null, { status: 200 });
    response.headers.set('Access-Control-Allow-Credentials', 'true');
    response.headers.set('Access-Control-Allow-Origin', 'http://localhost:3000');
    response.headers.set('Access-Control-Allow-Methods', 'GET,DELETE,PATCH,POST,PUT');
    response.headers.set(
      'Access-Control-Allow-Headers',
      'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization'
    );
    return response;
  }

  const response = NextResponse.next();

  // Add CORS headers to all responses
  response.headers.set('Access-Control-Allow-Credentials', 'true');
  response.headers.set('Access-Control-Allow-Origin', 'http://localhost:3000');
  response.headers.set('Access-Control-Allow-Methods', 'GET,DELETE,PATCH,POST,PUT');
  response.headers.set(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization'
  );

  // Add API key for LangGraph endpoints
  const path = request.nextUrl.pathname;
  if (path.includes('/threads') || path.includes('/stream')) {
    const apiKey = process.env.LANGGRAPH_API_KEY;
    if (apiKey) {
      request.headers.set('Authorization', `Bearer ${apiKey}`);
    }
  }

  return response;
}

// Main middleware function
async function middleware(request: NextRequest, event: NextFetchEvent) {
  const path = request.nextUrl.pathname;

  // For LangGraph API routes (need API key but not auth)
  if (path.includes('/threads') || path.includes('/stream') ||
    path.startsWith('/api/threads') || path.startsWith('/api/runs/stream')) {
    return handleCorsAndApiKey(request);
  }

  // For protected routes that need Auth0 auth
  if (path.startsWith('/protected')) {
    const handler = withMiddlewareAuthRequired();
    return handler(request, event);
  }

  // For API routes
  if (path.startsWith('/api')) {
    // Skip auth in preview mode
    if (isPreviewEnvironment()) {
      return handleCorsAndApiKey(request);
    }
    const handler = withMiddlewareAuthRequired();
    return handler(request, event);
  }

  return NextResponse.next();
}

export default middleware;

export const config = {
  matcher: [
    '/api/:path*',
    '/protected/:path*',
    '/threads/:path*',
    '/stream/:path*'
  ],
};
