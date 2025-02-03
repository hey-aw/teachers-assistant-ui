import { Client, ThreadState } from "@langchain/langgraph-sdk";
import {
  LangChainMessage,
  LangGraphCommand,
} from "@assistant-ui/react-langgraph";

const createClient = () => {
  const apiUrl =
    process.env["NEXT_PUBLIC_LANGGRAPH_API_URL"] ||
    new URL("/api", window.location.href).href;
  return new Client({
    apiUrl,
  });
};

export const createThread = async () => {
  const client = createClient();
  try {
    return await client.threads.create();
  } catch (error) {
    console.error("Failed to create thread:", error);
    throw new Error("Failed to create thread");
  }
};

export const getThreadState = async (
  threadId: string
): Promise<ThreadState<{ messages: LangChainMessage[] }>> => {
  const client = createClient();
  return client.threads.getState(threadId);
};

export const sendMessage = async (params: {
  threadId: string;
  messages?: LangChainMessage[];
  command?: LangGraphCommand | undefined;
  userId?: string | null;
}) => {
  const client = createClient();
  try {
    return await client.runs.stream(
      params.threadId,
      process.env["NEXT_PUBLIC_LANGGRAPH_ASSISTANT_ID"]!,
      {
        input: params.messages?.length
          ? {
            messages: params.messages,
          }
          : null,
        command: params.command,
        streamMode: ["messages", "updates"],
        config: {
          configurable: {
            user_id: params.userId,
            thread_id: params.threadId,
          },
        },
      }
    );
  } catch (error) {
    console.error("Failed to send message:", error);
    throw new Error("Failed to send message");
  }
};
