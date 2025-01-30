import { NextRequest } from "next/server";
import { POST } from "@/app/api/[..._path]/route";

describe("LangGraph Configuration Tests", () => {
    const originalEnv = process.env;

    beforeEach(() => {
        jest.resetModules();
        process.env = { ...originalEnv };
    });

    afterEach(() => {
        process.env = originalEnv;
        jest.clearAllMocks();
    });

    describe("Local Development Setup", () => {
        beforeEach(() => {
            // Setup local development environment variables
            process.env.LANGGRAPH_API_URL = "http://localhost:8000";
            process.env.NEXT_PUBLIC_LANGGRAPH_ASSISTANT_ID = "local-graph-id";
            delete process.env.LANGCHAIN_API_KEY;
            delete process.env.LANGGRAPH_ASSISTANT_ID;

            // Mock fetch with a successful response
            global.fetch = jest.fn().mockResolvedValue(new Response(null, {
                status: 200,
                statusText: "OK",
                headers: new Headers({
                    "content-type": "application/json"
                })
            }));
        });

        it("should forward requests to local LangGraph Studio", async () => {
            const mockBody = JSON.stringify({ message: "test" });
            const request = new NextRequest("http://localhost:3000/api/runs/stream", {
                method: "POST",
                headers: {
                    "content-type": "application/json",
                },
                body: mockBody,
            });

            // Mock the text() method to return the body
            jest.spyOn(request, 'text').mockResolvedValue(mockBody);

            await POST(request);

            // Verify fetch was called with correct local URL
            expect(global.fetch).toHaveBeenCalledTimes(1);
            const [url, options] = (global.fetch as jest.Mock).mock.calls[0];
            expect(url).toBe("http://localhost:8000/runs/stream");
            expect(options.headers["x-api-key"]).toBeFalsy();
        });

        it.skip("should inject local assistant ID when missing", async () => {
            const request = new NextRequest("http://localhost:3000/api/runs/stream", {
                method: "POST",
                headers: {
                    "content-type": "application/json",
                },
                body: JSON.stringify({ message: "test" }),
            });

            await POST(request);

            const [_, options] = (global.fetch as jest.Mock).mock.calls[0];
            const bodyJson = JSON.parse(options.body);
            expect(bodyJson.assistant_id).toBe("local-graph-id");
        });
    });

    describe("Cloud Deployment Setup", () => {
        beforeEach(() => {
            // Setup cloud deployment environment variables
            process.env.LANGCHAIN_API_KEY = "test-api-key";
            process.env.LANGGRAPH_API_URL = "https://api.langgraph.com";
            process.env.LANGGRAPH_ASSISTANT_ID = "cloud-graph-id";
            delete process.env.NEXT_PUBLIC_LANGGRAPH_API_URL;
            delete process.env.NEXT_PUBLIC_LANGGRAPH_ASSISTANT_ID;

            // Mock fetch
            global.fetch = jest.fn();
        });

        it("should forward requests to LangGraph Cloud with API key", async () => {
            const request = new NextRequest("http://localhost:3000/api/runs/stream", {
                method: "POST",
                headers: {
                    "content-type": "application/json",
                },
                body: JSON.stringify({ message: "test" }),
            });

            await POST(request);

            // Verify fetch was called with correct cloud URL and API key
            expect(global.fetch).toHaveBeenCalledTimes(1);
            const [url, options] = (global.fetch as jest.Mock).mock.calls[0];
            expect(url).toBe("https://api.langgraph.com/runs/stream");
            expect(options.headers["x-api-key"]).toBe("test-api-key");
        });

        it.skip("should inject cloud assistant ID when missing", async () => {
            const request = new NextRequest("http://localhost:3000/api/runs/stream", {
                method: "POST",
                headers: {
                    "content-type": "application/json",
                },
                body: JSON.stringify({ message: "test" }),
            });

            // Mock fetch to return a successful response
            (global.fetch as jest.Mock).mockResolvedValueOnce({
                status: 200,
                json: async () => ({ success: true }),
            });

            const response = await POST(request);

            // Verify the response status is 200
            expect(response.status).toBe(200);

            const [_, options] = (global.fetch as jest.Mock).mock.calls[0];
            const bodyJson = JSON.parse(options.body);
            expect(bodyJson.assistant_id).toBe("cloud-graph-id");
        });

        it("should preserve existing assistant ID", async () => {
            const existingAssistantId = "existing-assistant-id";
            const request = new NextRequest("http://localhost:3000/api/runs/stream", {
                method: "POST",
                headers: {
                    "content-type": "application/json",
                },
                body: JSON.stringify({
                    message: "test",
                    assistant_id: existingAssistantId
                }),
            });

            await POST(request);

            const [_, options] = (global.fetch as jest.Mock).mock.calls[0];
            const bodyJson = JSON.parse(options.body);
            expect(bodyJson.assistant_id).toBe(existingAssistantId);
        });
    });

    describe("Error Handling", () => {
        beforeEach(() => {
            process.env.LANGGRAPH_API_URL = "https://api.langgraph.com";
            global.fetch = jest.fn();
        });

        it("should handle missing API key in cloud deployment", async () => {
            delete process.env.LANGCHAIN_API_KEY;

            const request = new NextRequest("http://localhost:3000/api/runs/stream", {
                method: "POST",
                headers: {
                    "content-type": "application/json",
                },
                body: JSON.stringify({ message: "test" }),
            });

            await POST(request);

            const [_, options] = (global.fetch as jest.Mock).mock.calls[0];
            expect(options.headers["x-api-key"]).toBe("");
        });

        it("should handle invalid JSON in request body", async () => {
            const request = new NextRequest("http://localhost:3000/api/runs/stream", {
                method: "POST",
                headers: {
                    "content-type": "application/json",
                },
                body: "invalid json",
            });

            const response = await POST(request);
            expect(response.status).toBe(400);

            const data = await response.json();
            expect(data.error).toBe("Invalid JSON in request body");
        });
    });
}); 