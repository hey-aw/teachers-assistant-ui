import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    const { LANGCHAIN_API_KEY, LANGGRAPH_API_URL, NEXT_PUBLIC_LANGGRAPH_ASSISTANT_ID } = process.env;

    if (!LANGCHAIN_API_KEY || !LANGGRAPH_API_URL || !NEXT_PUBLIC_LANGGRAPH_ASSISTANT_ID) {
        return NextResponse.json({ error: "Missing environment variables" }, { status: 500 });
    }

    const contentType = req.headers.get("content-type") || "";
    if (contentType.includes("application/json")) {
        let body;
        try {
            body = await req.json();
        } catch (error) {
            return NextResponse.json({ error: "Invalid JSON in request body" }, { status: 400 });
        }

        if (req.nextUrl.pathname === "/api/runs/stream") {
            body.assistant_id = body.assistant_id || NEXT_PUBLIC_LANGGRAPH_ASSISTANT_ID;
        }

        const response = await fetch(`${LANGGRAPH_API_URL}${req.nextUrl.pathname}`, {
            method: "POST",
            headers: {
                "content-type": "application/json",
                "x-api-key": LANGCHAIN_API_KEY,
            },
            body: JSON.stringify(body),
        });

        return new NextResponse(response.body, {
            status: response.status,
            statusText: response.statusText,
            headers: response.headers,
        });
    } else {
        const response = await fetch(`${LANGGRAPH_API_URL}${req.nextUrl.pathname}`, {
            method: "POST",
            headers: {
                "x-api-key": LANGCHAIN_API_KEY,
            },
            body: req.body,
        });

        return new NextResponse(response.body, {
            status: response.status,
            statusText: response.statusText,
            headers: response.headers,
        });
    }
}
