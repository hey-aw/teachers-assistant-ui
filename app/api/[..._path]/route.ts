import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const apiUrl = `${process.env.API_BASE_URL}${req.nextUrl.pathname}?${searchParams.toString()}`;
    const apiKey = process.env.API_KEY;

    const response = await fetch(apiUrl, {
        method: req.method,
        headers: {
            ...Object.fromEntries(req.headers.entries()),
            "x-api-key": apiKey as string,
        } as HeadersInit,
    });

    const data = await response.json();

    return NextResponse.json(data);
}

export async function POST(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const apiUrl = `${process.env.API_BASE_URL}${req.nextUrl.pathname}?${searchParams.toString()}`;
    const apiKey = process.env.API_KEY;

    const response = await fetch(apiUrl, {
        method: req.method,
        headers: {
            ...Object.fromEntries(req.headers.entries()),
            "x-api-key": apiKey as string,
        } as HeadersInit,
        body: req.body,
    });

    const data = await response.json();

    return NextResponse.json(data);
}
