import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

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
async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;

  // For LangGraph API routes (need API key but not auth)
  if (path.includes('/threads') || path.includes('/stream') ||
    path.startsWith('/api/threads') || path.startsWith('/api/runs/stream')) {
    return handleCorsAndApiKey(request);
  }

  // For API routes
  return NextResponse.next();
}

export default middleware;

export const config = {
  matcher: [
    '/api/:path*',
    '/threads/:path*',
    '/stream/:path*'
  ],
};
