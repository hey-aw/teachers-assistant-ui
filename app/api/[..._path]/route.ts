import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    let body: any;
    try {
        body = await req.json();
    } catch (error) {
        return new Response(JSON.stringify({ error: "Invalid JSON in request body" }), { status: 400 });
    }

    if (req.nextUrl.pathname === "/runs/stream") {
        if (!body.assistant_id) {
            body.assistant_id = process.env.NEXT_PUBLIC_LANGGRAPH_ASSISTANT_ID;
        }
    }

    const apiUrl = process.env.LANGGRAPH_API_URL + req.nextUrl.pathname.replace("/api", "");
    const apiKey = process.env.LANGCHAIN_API_KEY;

    const response = await fetch(apiUrl, {
        method: req.method,
        headers: {
            ...Object.fromEntries(req.headers.entries()),
            "x-api-key": apiKey,
        },
        body: req.body,
    });

    const responseBody = await response.text();
    return new Response(responseBody, {
        status: response.status,
        statusText: response.statusText,
        headers: response.headers,
    });
}
