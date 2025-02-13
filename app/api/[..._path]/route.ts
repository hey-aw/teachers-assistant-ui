import { NextRequest, NextResponse } from "next/server";
import { Client } from "@langchain/langgraph-sdk";

export const runtime = "edge";

function debugEnvironment() {
  const envVars = {
    LANGGRAPH_API_URL: process.env.LANGGRAPH_API_URL ? 'Set' : 'Missing',
    LANGSMITH_API_KEY: process.env.LANGSMITH_API_KEY ? 'Set' : 'Missing',
    NODE_ENV: process.env.NODE_ENV
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

function createClient() {
  const apiUrl = process.env.LANGGRAPH_API_URL;
  const apiKey = process.env.LANGSMITH_API_KEY;

  if (!apiKey) {
    throw new Error("LANGSMITH_API_KEY is not configured");
  }

  if (!apiUrl) {
    throw new Error("LANGGRAPH_API_URL is not configured");
  }

  return new Client({
    apiUrl,
    apiKey,
  });
}

async function handleRequest(req: NextRequest, method: string) {
  try {
    console.log('Request URL:', req.url);
    console.log('Request pathname:', req.nextUrl.pathname);
    console.log('Request method:', method);

    // Add debug information
    debugEnvironment();

    const client = createClient();
    const path = req.nextUrl.pathname.replace(/^\/?api\//, "");
    console.log('Extracted path:', path);
    const searchParams = new URLSearchParams(req.nextUrl.search);
    searchParams.delete("_path");
    searchParams.delete("nxtP_path");
    const queryString = searchParams.toString()
      ? `?${searchParams.toString()}`
      : "";
    console.log('Query string:', queryString);

    let requestBody = null;
    if (["POST", "PUT", "PATCH"].includes(method)) {
      try {
        const body = await req.text();
        requestBody = body ? JSON.parse(body) : {};
        console.log('Request body:', {
          path,
          method,
          body: requestBody
        });
      } catch (e) {
        console.error('Error parsing request body:', e);
        return NextResponse.json(
          { error: "Invalid JSON in request body" },
          { status: 400, headers: getCorsHeaders() }
        );
      }
    }

    let response;
    const pathParts = path.split('/');

    // Handle different API endpoints using the SDK
    if (path.startsWith('threads')) {
      if (method === 'POST') {
        response = await client.threads.create(requestBody || {});
      } else if (method === 'GET' && pathParts.length > 1) {
        response = await client.threads.get(pathParts[1]);
      } else if (method === 'GET') {
        response = await client.threads.search(requestBody || {});
      }
    } else if (path.startsWith('runs/stream')) {
      if (method === 'POST') {
        const { threadId, assistantId, input, config, streamMode } = requestBody || {};

        if (!threadId || !assistantId) {
          return NextResponse.json(
            { error: "threadId and assistantId are required" },
            { status: 400, headers: getCorsHeaders() }
          );
        }

        const stream = await client.runs.stream(threadId, assistantId, {
          input,
          config,
          streamMode: streamMode || ["updates", "messages"],
        });

        // Convert AsyncGenerator to ReadableStream
        const readableStream = new ReadableStream({
          async start(controller) {
            try {
              for await (const chunk of stream) {
                controller.enqueue(new TextEncoder().encode(JSON.stringify(chunk) + '\n'));
              }
              controller.close();
            } catch (e) {
              controller.error(e);
            }
          }
        });

        return new NextResponse(readableStream, {
          headers: {
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache',
            'Connection': 'keep-alive',
            ...getCorsHeaders(),
          },
        });
      }
    }

    if (!response) {
      return NextResponse.json(
        { error: "Endpoint not found" },
        { status: 404, headers: getCorsHeaders() }
      );
    }

    return NextResponse.json(response, {
      status: 200,
      headers: getCorsHeaders(),
    });

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