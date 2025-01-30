import { NextRequest, NextResponse } from "next/server";

export const runtime = "edge";

function getCorsHeaders() {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, PUT, PATCH, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "*",
  };
}

async function handleRequest(req: NextRequest, method: string) {
  try {
    const path = req.nextUrl.pathname.replace(/^\/?api\//, "");
    const url = new URL(req.url);
    const searchParams = new URLSearchParams(url.search);
    searchParams.delete("_path");
    searchParams.delete("nxtP_path");
    const queryString = searchParams.toString()
      ? `?${searchParams.toString()}`
      : "";

    const options: RequestInit = {
      method,
      headers: {
        "x-api-key": process.env["LANGCHAIN_API_KEY"] || "",
      },
    };

    if (["POST", "PUT", "PATCH"].includes(method)) {
      // First check if this is a /runs/stream endpoint and if we have JSON content
      const isRunsStreamEndpoint = path.includes("/runs/stream");
      const contentType = req.headers.get("content-type") || "";
      const isJsonContent = contentType.includes("application/json");

      if (isRunsStreamEndpoint && isJsonContent) {
        let bodyText;
        try {
          bodyText = await req.text();
          const bodyJson = JSON.parse(bodyText);
          // Only inject assistant_id if it's not already present
          if (!bodyJson.assistant_id) {
            bodyJson.assistant_id = process.env.NEXT_PUBLIC_LANGGRAPH_ASSISTANT_ID;
          }
          const jsonString = JSON.stringify(bodyJson);
          options.body = jsonString;
          // Set content-type to ensure the server knows it's JSON
          options.headers = {
            ...options.headers,
            'content-type': 'application/json',
          };
        } catch (e) {
          // Don't proceed with the fetch if JSON parsing fails
          return new NextResponse(
            JSON.stringify({ error: "Invalid JSON in request body" }),
            {
              status: 400,
              headers: {
                'content-type': 'application/json',
                ...getCorsHeaders()
              }
            }
          );
        }
      } else {
        // For non-JSON content or other endpoints, pass through the body as-is
        const formData = await req.formData();
        const file = formData.get("file") as Blob;
        options.body = file;
        // Preserve the original content-type header
        const contentType = req.headers.get("content-type");
        if (contentType) {
          options.headers = {
            ...options.headers,
            'content-type': contentType,
          };
        }
      }
    }

    console.log({ url, path, queryString, options });

    const targetUrl = `${process.env["LANGGRAPH_API_URL"]}/${path}${queryString}`;
    const res = await fetch(targetUrl, options);

    return new NextResponse(res.body, {
      status: res.status,
      statusText: res.statusText,
      headers: {
        ...res.headers,
        ...getCorsHeaders(),
      },
    });
  } catch (e: any) {
    if (e instanceof SyntaxError) {
      return new NextResponse(
        JSON.stringify({ error: "Invalid JSON in request body" }),
        {
          status: 400,
          headers: {
            'content-type': 'application/json',
            ...getCorsHeaders()
          }
        }
      );
    }
    return new NextResponse(
      JSON.stringify({ error: e.message }),
      {
        status: e.status ?? 500,
        headers: {
          'content-type': 'application/json',
          ...getCorsHeaders()
        }
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
