import { NextRequest, NextResponse } from "next/server";
import { getAccessToken } from '@auth0/nextjs-auth0/edge';

export const runtime = "edge";

function getApiKey() {
  const apiKey = process.env["LANGSMITH_API_KEY"] || "";
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

async function handleRequest(req: NextRequest, method: string) {
  try {
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

    const path = req.nextUrl.pathname.replace(/^\/?api\//, "");
    const url = new URL(req.url);
    const searchParams = new URLSearchParams(url.search);
    searchParams.delete("_path");
    searchParams.delete("nxtP_path");
    const queryString = searchParams.toString()
      ? `?${searchParams.toString()}`
      : "";

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

    const options: RequestInit = {
      method,
      headers: {
        "X-Api-Key": apiKey,
        "Content-Type": "application/json",
      },
    };

    if (["POST", "PUT", "PATCH"].includes(method)) {
      try {
        const bodyText = await req.text();
        // Validate that the body is valid JSON if present
        if (bodyText) {
          JSON.parse(bodyText);
        }
        options.body = bodyText;
        console.log(`Request body for ${path}:`, options.body);
      } catch (e) {
        return new NextResponse(
          JSON.stringify({
            error: "Invalid JSON in request body",
            details: (e as Error).message
          }),
          {
            status: 422,
            headers: {
              'Content-Type': 'application/json',
              ...getCorsHeaders(),
            },
          }
        );
      }
    }

    const res = await fetch(
      `${process.env["LANGGRAPH_API_URL"]}/${path}${queryString}`,
      options,
    );

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({ message: res.statusText }));
      console.log(`Error response for ${path}:`, {
        status: res.status,
        error: errorData
      });
      return new NextResponse(
        JSON.stringify({ error: errorData.message || 'API request failed' }),
        {
          status: res.status,
          headers: {
            'Content-Type': 'application/json',
            ...getCorsHeaders(),
          },
        }
      );
    }

    return new NextResponse(res.body, {
      status: res.status,
      statusText: res.statusText,
      headers: {
        ...Object.fromEntries(res.headers.entries()),
        ...getCorsHeaders(),
      },
    });
  } catch (e: any) {
    console.error('API request error:', e);
    const status = e.status ?? (e.message?.includes('API key') ? 401 : 500);
    return new NextResponse(
      JSON.stringify({ error: e.message || 'Internal server error' }),
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