import { NextRequest, NextResponse } from "next/server";

export const runtime = "edge";

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

    const url = new URL(`${cleanBaseUrl}/${cleanPath}`);
    if (queryString) {
      url.search = queryString;
    }
    return url.toString();
  } catch (e) {
    console.error('buildApiUrl error:', e);
    throw e;
  }
}

function isLangGraphRoute(pathname: string) {
  return pathname.includes('/threads') || pathname.includes('/stream');
}

async function handleRequest(req: NextRequest, method: string) {
  try {
    console.log('Request URL:', req.url);
    console.log('Request pathname:', req.nextUrl.pathname);

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

    // Add detailed logging for streaming endpoints
    if (isLangGraphRoute(path)) {
      console.log('LangGraph route detected:', {
        path,
        method,
        status: res.status,
        contentType: res.headers.get('content-type'),
        requestBody: options.body ? JSON.parse(options.body as string) : null
      });
    }

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
    }

    let responseBody;
    try {
      const text = await res.text();
      try {
        responseBody = JSON.parse(text);
      } catch (e) {
        responseBody = text;
      }
    } catch (e) {
      console.error('Failed to read response:', e);
      responseBody = null;
    }

    // For non-2xx responses, treat as error
    if (res.status >= 400) {
      const errorMessage = responseBody?.message || responseBody?.error || "API request failed";
      console.error('Error response:', {
        status: res.status,
        body: responseBody,
        headers: Object.fromEntries(res.headers.entries())
      });

      // Special handling for 422 errors
      if (res.status === 422) {
        console.error('Validation error details:', responseBody);
        return NextResponse.json(
          {
            error: errorMessage,
            details: responseBody,
            path: path
          },
          {
            status: 422,
            headers: getCorsHeaders(),
          }
        );
      }

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