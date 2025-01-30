import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const apiKey = process.env.LANGSMITH_API_KEY;
const apiUrl = process.env.LANGGRAPH_API_URL;
const assistantId = process.env.NEXT_PUBLIC_LANGGRAPH_ASSISTANT_ID;

const requestSchema = z.object({
  method: z.string(),
  headers: z.record(z.string(), z.string()),
  body: z.string().optional(),
});

export async function POST(req: NextRequest) {
  const { pathname } = new URL(req.url);
  const isStreamEndpoint = pathname.endsWith("/runs/stream");

  let requestBody;
  try {
    requestBody = await req.json();
  } catch (error) {
    return NextResponse.json(
      { error: "Invalid JSON in request body" },
      { status: 400 }
    );
  }

  if (isStreamEndpoint) {
    requestBody.assistant_id = assistantId;
  }

  const modifiedBody = JSON.stringify(requestBody);

  const response = await fetch(`${apiUrl}${pathname}`, {
    method: req.method,
    headers: {
      ...Object.fromEntries(req.headers),
      "x-api-key": apiKey,
      "content-type": "application/json",
    },
    body: modifiedBody,
  });

  return new NextResponse(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers: response.headers,
  });
}
