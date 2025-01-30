import { describe, it, expect, jest, beforeEach, afterEach } from '@jest/globals';
import { NextRequest } from "next/server";
import { POST } from "@/app/api/[..._path]/route";

// Mock environment variables
const MOCK_API_KEY = "test_api_key";
const MOCK_API_URL = "https://api.example.com";
const MOCK_ASSISTANT_ID = "test_assistant_id";

beforeEach(() => {
    // Setup environment variables
    process.env.LANGCHAIN_API_KEY = MOCK_API_KEY;
    process.env.LANGGRAPH_API_URL = MOCK_API_URL;
    process.env.NEXT_PUBLIC_LANGGRAPH_ASSISTANT_ID = MOCK_ASSISTANT_ID;

    // Mock fetch
    global.fetch = jest.fn();
});

afterEach(() => {
    jest.resetAllMocks();
});

describe("LangGraph API Route Handler", () => {
    it.skip("should add assistant_id to /runs/stream requests when missing", async () => {
        // Mock the fetch response
        (global.fetch as jest.Mock).mockResolvedValueOnce({
            status: 200,
            statusText: "OK",
            headers: new Headers(),
            body: new ReadableStream(),
        });

        // Create a request without assistant_id
        const request = new NextRequest(
            new URL("http://localhost:3000/api/runs/stream"),
            {
                method: "POST",
                body: JSON.stringify({
                    some_param: "value"
                })
            }
        );

        await POST(request);

        // Verify fetch was called with the correct parameters
        expect(global.fetch).toHaveBeenCalledTimes(1);
        const fetchCall = (global.fetch as jest.Mock).mock.calls[0];
        const [url, options] = fetchCall;

        // Check URL
        expect(url).toBe(`${MOCK_API_URL}/runs/stream`);

        // Parse the body to verify assistant_id was added
        const bodyJson = JSON.parse(options.body);
        expect(bodyJson).toEqual({
            some_param: "value",
            assistant_id: MOCK_ASSISTANT_ID
        });
    });

    it.skip("should not modify assistant_id if already present", async () => {
        const EXISTING_ASSISTANT_ID = "existing_assistant_id";

        // Mock the fetch response
        (global.fetch as jest.Mock).mockResolvedValueOnce({
            status: 200,
            statusText: "OK",
            headers: new Headers(),
            body: new ReadableStream(),
        });

        // Create a request with existing assistant_id
        const request = new NextRequest(
            new URL("http://localhost:3000/api/runs/stream"),
            {
                method: "POST",
                body: JSON.stringify({
                    some_param: "value",
                    assistant_id: EXISTING_ASSISTANT_ID
                })
            }
        );

        await POST(request);

        // Verify fetch was called with the correct parameters
        const fetchCall = (global.fetch as jest.Mock).mock.calls[0];
        const [_, options] = fetchCall;

        // Parse the body to verify assistant_id wasn't modified
        const bodyJson = JSON.parse(options.body);
        expect(bodyJson.assistant_id).toBe(EXISTING_ASSISTANT_ID);
    });

    it.skip("should not modify non-stream endpoint requests", async () => {
        // Mock the fetch response
        (global.fetch as jest.Mock).mockResolvedValueOnce({
            status: 200,
            statusText: "OK",
            headers: new Headers(),
            body: new ReadableStream(),
        });

        const originalBody = { some_param: "value" };

        // Create a request to a different endpoint
        const request = new NextRequest(
            new URL("http://localhost:3000/api/other/endpoint"),
            {
                method: "POST",
                body: JSON.stringify(originalBody)
            }
        );

        await POST(request);

        // Verify fetch was called with the correct parameters
        const fetchCall = (global.fetch as jest.Mock).mock.calls[0];
        const [_, options] = fetchCall;

        // Verify body wasn't modified
        expect(options.body).toBe(JSON.stringify(originalBody));
    });
});
