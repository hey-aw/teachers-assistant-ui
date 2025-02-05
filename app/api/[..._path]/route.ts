import { NextRequest, NextResponse } from "next/server";
import { getAccessToken } from '@auth0/nextjs-auth0/edge';

export const runtime = "edge";

function isPreviewEnvironment() {
  return process.env.AZURE_STATIC_WEBAPPS_ENVIRONMENT === 'preview' || !process.env.AUTH0_BASE_URL;
}

function getApiKey() {
  const apiKey = process.env.LANGSMITH_API_KEY || "";
  if (!apiKey) {
    console.warn("LANGSMITH_API_KEY is not set");
  }
  return apiKey;
}

function getCorsHeaders() {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, PUT, PATCH, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "*",
  };
}

function buildApiUrl(baseUrl: string, path: string, queryString: string) {
  try {
    console.log('buildApiUrl inputs:', { baseUrl, path, queryString });

    if (!baseUrl) throw new Error('baseUrl is required');
    if (!path) throw new Error('path is required');

    const cleanBaseUrl = baseUrl.replace(/\/$/, "");
    const cleanPath = path.replace(/^\//, "");
    console.log('Cleaned URLs:', { cleanBaseUrl, cleanPath });

    const url = new URL(`${cleanBaseUrl}/${cleanPath}`);
    if (queryString) {
      url.search = queryString;
    }
    console.log('Final URL:', url.toString());
    return url.toString();
  } catch (e) {
    console.error('buildApiUrl error:', e);
    throw e;
  }
}

async function handleRequest(req: NextRequest, method: string) {
  try {
    console.log('Request URL:', req.url);
    console.log('Request pathname:', req.nextUrl.pathname);

    // Skip auth check in preview mode
    if (!isPreviewEnvironment()) {
      // Get the access token using Edge-compatible method
      const authResult = await getAccessToken(req, NextResponse.next(), undefined);
      const accessToken = authResult?.accessToken;

      if (!accessToken) {
        return new NextResponse(
          JSON.stringify({ error: "Unauthorized - No valid session" }),
          {
            status: 401,
            headers: {
              'Content-Type': 'application/json',
              ...getCorsHeaders(),
            },
          }
        );
      }
    }

    const apiKey = getApiKey();
    if (!apiKey) {
      return new NextResponse(
        JSON.stringify({ error: "API key is not configured" }),
        {
          status: 401,
          headers: {
            'Content-Type': 'application/json',
            ...getCorsHeaders(),
          },
        }
      );
    }

    const baseUrl = process.env.LANGGRAPH_API_URL;
    if (!baseUrl) {
      throw new Error("LANGGRAPH_API_URL is not configured");
    }

    const path = req.nextUrl.pathname.replace(/^\/?api\//, "");
    console.log('Extracted path:', path);
    const searchParams = new URLSearchParams(req.nextUrl.search);
    searchParams.delete("_path");
    searchParams.delete("nxtP_path");
    const queryString = searchParams.toString()
      ? `?${searchParams.toString()}`
      : "";
    console.log('Query string:', queryString);

    const apiUrl = buildApiUrl(baseUrl, path, queryString);
    console.log('Final API URL:', apiUrl);

    const options: RequestInit = {
      method,
      headers: {
        "X-Api-Key": apiKey,
        "Content-Type": "application/json",
      },
    };

    if (["POST", "PUT", "PATCH"].includes(method)) {
      // Get the request body if available
      try {
        const body = await req.text();
        options.body = body || JSON.stringify({});
      } catch {
        options.body = JSON.stringify({});
      }
    }

    const res = await fetch(apiUrl, options);
    console.log('Response status:', res.status, 'ok:', res.ok);

    // Check if this is a streaming response
    const contentType = res.headers.get('content-type');
    if (contentType?.includes('text/event-stream')) {
      console.log('Handling streaming response');
      return new NextResponse(res.body, {
        status: res.status,
        headers: {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          'Connection': 'keep-alive',
          ...getCorsHeaders(),
        },
      });
    }

    // For non-streaming responses, continue with JSON handling
    // Safely get headers
    const headers: Record<string, string> = {};
    try {
      for (const [key, value] of res.headers.entries()) {
        headers[key.toLowerCase()] = value;
      }
    } catch (e) {
      console.warn('Failed to read response headers:', e);
    }
    console.log('Response headers:', headers);

    let responseBody;
    try {
      const text = await res.text();
      console.log('Raw response text:', text);
      try {
        responseBody = JSON.parse(text);
        console.log('Parsed response body:', responseBody);
      } catch (e) {
        console.log('Failed to parse response as JSON, using raw text');
        responseBody = text;
      }
    } catch (e) {
      console.error('Failed to read response:', e);
      responseBody = null;
    }

    // For non-2xx responses, treat as error
    if (res.status >= 400) {
      console.log('Response not OK, creating error response');
      const errorMessage = responseBody?.message || responseBody?.error || "API request failed";
      console.log('Error message:', errorMessage);
      return NextResponse.json(
        { error: errorMessage },
        {
          status: res.status || 500,
          statusText: res.statusText || '',
          headers: getCorsHeaders(),
        }
      );
    }

    // For successful responses, pass through the response as-is
    console.log('Creating success response');
    console.log('Final response data:', responseBody);

    return NextResponse.json(
      responseBody,
      {
        status: res.status || 200,
        statusText: res.statusText || '',
        headers: getCorsHeaders(),
      }
    );
  } catch (e: any) {
    console.error('API request error:', e);
    let status = 500;
    let message = e.message || 'Internal server error';

    if (e.message?.includes('API key')) {
      status = 401;
    } else if (e.message?.includes('not found')) {
      status = 404;
    } else if (e.message?.toLowerCase().includes('network')) {
      message = 'Network error';
    }

    return new NextResponse(
      JSON.stringify({ error: message }),
      {
        status,
        headers: {
          'Content-Type': 'application/json',
          ...getCorsHeaders(),
        },
      }
    );
  }
}

export const GET = (req: NextRequest) => handleRequest(req, "GET");
export const POST = (req: NextRequest) => handleRequest(req, "POST");
export const PUT = (req: NextRequest) => handleRequest(req, "PUT");
export const PATCH = (req: NextRequest) => handleRequest(req, "PATCH");
export const DELETE = (req: NextRequest) => handleRequest(req, "DELETE");

// Add a new OPTIONS handler
export const OPTIONS = () => {
  return new NextResponse(null, {
    status: 204,
    headers: {
      ...getCorsHeaders(),
    },
  });
};