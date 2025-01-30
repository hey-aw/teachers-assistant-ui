import { NextRequest } from "next/server";
import { POST } from "@/app/api/[..._path]/route";

// Mock environment variables
process.env.LANGCHAIN_API_KEY = "test-api-key";
process.env.LANGGRAPH_API_URL = "https://test.langgraph.app";
process.env.NEXT_PUBLIC_LANGGRAPH_ASSISTANT_ID = "test-assistant-id";

// Mock fetch
global.fetch = jest.fn();

describe("API Route Handler", () => {
    beforeEach(() => {
        jest.clearAllMocks();
        (global.fetch as jest.Mock).mockResolvedValue(new Response(null, {
            status: 200,
            statusText: "OK",
        }));
    });

    it("should handle JSON requests to /runs/stream and add assistant_id", async () => {
        const req = new NextRequest("http://localhost:3000/runs/stream", {
            method: "POST",
            headers: {
                "content-type": "application/json",
            },
            body: JSON.stringify({ message: "test" }),
        });

        await POST(req);

        const fetchCalls = (global.fetch as jest.Mock).mock.calls;
        expect(fetchCalls.length).toBe(1);

        const [url, options] = fetchCalls[0];
        expect(url).toBe("https://test.langgraph.app/runs/stream");
        expect(options.method).toBe("POST");
        expect(options.headers["x-api-key"]).toBe("test-api-key");

        const bodyText = await (options.body as Blob).text();
        const bodyJson = JSON.parse(bodyText);
        expect(bodyJson).toEqual({
            message: "test",
            assistant_id: "test-assistant-id",
        });
    });

    it("should handle non-JSON requests without modification", async () => {
        const formData = new FormData();
        formData.append("file", new Blob(["test"]), "test.txt");

        const req = new NextRequest("http://localhost:3000/upload", {
            method: "POST",
            body: formData,
        });

        await POST(req);

        const fetchCalls = (global.fetch as jest.Mock).mock.calls;
        expect(fetchCalls.length).toBe(1);

        const [url, options] = fetchCalls[0];
        expect(url).toBe("https://test.langgraph.app/upload");
        expect(options.method).toBe("POST");
        expect(options.headers["x-api-key"]).toBe("test-api-key");
        expect(options.body instanceof Blob).toBe(true);
        const bodyText = await (options.body as Blob).text();
        expect(bodyText).toContain("test");
    });

    it("should return 400 for invalid JSON on /runs/stream endpoint", async () => {
        const req = new NextRequest("http://localhost:3000/runs/stream", {
            method: "POST",
            headers: {
                "content-type": "application/json",
            },
            body: "invalid json",
        });

        const response = await POST(req);
        expect(response.status).toBe(400);

        const data = await response.json();
        expect(data).toEqual({
            error: "Invalid JSON in request body",
        });
        expect(global.fetch).not.toHaveBeenCalled();
    });

    it("should include assistant_id in the request body", async () => {
        const req = new NextRequest("http://localhost:3000/runs/stream", {
            method: "POST",
            headers: {
                "content-type": "application/json",
            },
            body: JSON.stringify({ message: "test" }),
        });

        await POST(req);

        const fetchCalls = (global.fetch as jest.Mock).mock.calls;
        expect(fetchCalls.length).toBe(1);

        const [url, options] = fetchCalls[0];
        expect(url).toBe("https://test.langgraph.app/runs/stream");
        expect(options.method).toBe("POST");
        expect(options.headers["x-api-key"]).toBe("test-api-key");

        const bodyText = await (options.body as Blob).text();
        const bodyJson = JSON.parse(bodyText);
        expect(bodyJson).toEqual({
            message: "test",
            assistant_id: "test-assistant-id",
        });
    });
});
