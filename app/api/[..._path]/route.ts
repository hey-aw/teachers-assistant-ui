import { NextRequest, NextResponse } from "next/server";

export const runtime = "edge";

function debugEnvironment() {
  const envVars = {
    LANGGRAPH_API_URL: process.env.LANGGRAPH_API_URL ? 'Set' : 'Missing',
    LANGSMITH_API_KEY: process.env.LANGSMITH_API_KEY ? 'Set' : 'Missing',
    NODE_ENV: process.env.NODE_ENV,
    VERCEL_ENV: process.env.VERCEL_ENV,
  };

  console.log('Environment configuration:', envVars);

  // Log curl command example (without actual API key)
  const baseUrl = process.env.LANGGRAPH_API_URL || '[YOUR_API_URL]';
  console.log('\nDebug curl command:');
  console.log(`curl -v -X GET \\
  -H "X-Api-Key: ${process.env.LANGSMITH_API_KEY || '[YOUR_API_KEY]'}" \\
  -H "Content-Type: application/json" \\
  "${baseUrl}/health"`);
}

function getApiKey() {
  const apiKey = process.env.LANGSMITH_API_KEY || "";
  if (!apiKey) {
    console.warn("LANGSMITH_API_KEY is not set");
  }
  console.log("API Key status:", apiKey ? "Present" : "Missing");
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
    console.log('Request method:', method);

    // Add debug information
    debugEnvironment();

    const apiKey = getApiKey();
    if (!apiKey) {
      console.error('Authentication failed: Missing API key');
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
      console.error('Configuration error: Missing LANGGRAPH_API_URL');
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
    console.log('Full API URL:', apiUrl);

    const options: RequestInit = {
      method,
      headers: {
        "X-Api-Key": apiKey,
        "Content-Type": "application/json",
      },
    };

    let requestBody = null;
    if (["POST", "PUT", "PATCH"].includes(method)) {
      try {
        const body = await req.text();
        requestBody = body || "{}";
        options.body = requestBody;
        console.log('Request body:', {
          path,
          method,
          body: JSON.parse(requestBody)
        });
      } catch (e) {
        console.error('Error parsing request body:', e);
        options.body = JSON.stringify({});
      }
    }

    console.log('Making API request to:', {
      url: apiUrl,
      method,
      headers: options.headers,
      bodyLength: typeof options.body === 'string' ? options.body.length : 'unknown'
    });

    const res = await fetch(apiUrl, options);
    console.log('API Response:', {
      status: res.status,
      ok: res.ok,
      statusText: res.statusText,
      headers: Object.fromEntries(res.headers.entries())
    });

    // Add detailed logging for streaming endpoints
    if (isLangGraphRoute(path)) {
      console.log('LangGraph route detected:', {
        path,
        method,
        status: res.status,
        contentType: res.headers.get('content-type'),
        requestBody: requestBody ? JSON.parse(requestBody) : null
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
      console.error('API Error:', {
        status: res.status,
        statusText: res.statusText,
        url: apiUrl,
        requestBody: requestBody ? JSON.parse(requestBody) : null,
        responseBody,
        headers: Object.fromEntries(res.headers.entries())
      });

      // Handle permission errors (401, 403)
      if (res.status === 401 || res.status === 403) {
        console.error('Permission error:', {
          status: res.status,
          message: errorMessage,
          path
        });
        return NextResponse.json(
          {
            error: "You do not have permission to access this resource",
            details: {
              message: errorMessage,
              path,
              status: res.status
            }
          },
          {
            status: res.status,
            headers: getCorsHeaders(),
          }
        );
      }

      // Handle server errors (500)
      if (res.status === 500) {
        console.error('Server error:', {
          message: errorMessage,
          path,
          responseBody
        });
        return NextResponse.json(
          {
            error: "An internal server error occurred",
            details: {
              message: errorMessage,
              path,
              status: 500
            }
          },
          {
            status: 500,
            headers: getCorsHeaders(),
          }
        );
      }

      // Special handling for 502 errors
      if (res.status === 502) {
        return NextResponse.json(
          {
            error: "Unable to connect to LangGraph API server",
            details: {
              message: errorMessage,
              path,
              status: res.status
            }
          },
          {
            status: 502,
            headers: getCorsHeaders(),
          }
        );
      }

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
    console.error('API request error:', {
      error: e,
      message: e.message,
      stack: e.stack
    });
    let status = 500;
    let message = e.message || 'Internal server error';

    if (e.message?.includes('API key')) {
      status = 401;
      message = 'Invalid or missing API key';
    } else if (e.message?.includes('not found')) {
      status = 404;
    } else if (e.message?.toLowerCase().includes('network')) {
      message = 'Network error connecting to LangGraph API';
    } else if (e.message?.includes('permission')) {
      status = 403;
      message = 'Permission denied';
    }

    return new NextResponse(
      JSON.stringify({
        error: message,
        details: {
          originalError: e.message
        }
      }),
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