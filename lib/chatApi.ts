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
  return client.threads.create();
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
  return client.runs.stream(
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
};

export const authorize = async (state: any, config: any) => {
  const user_id = config["configurable"].get("user_id");
  for (const tool_call of state["messages"][-1].tool_calls) {
    const tool_name = tool_call["name"];
    if (!tool_manager.requires_auth(tool_name)) {
      continue;
    }
    const auth_response = tool_manager.authorize(tool_name, user_id);
    if (auth_response.status !== "completed") {
      console.log(`Visit the following URL to authorize: ${auth_response.url}`);
      tool_manager.wait_for_auth(auth_response.id);
      if (!tool_manager.is_authorized(auth_response.id)) {
        throw new Error("Authorization failed");
      }
    }
  }
  return { messages: [] };
};
