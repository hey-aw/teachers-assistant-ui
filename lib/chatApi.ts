import { ThreadState, Client } from "@langchain/langgraph-sdk";
import {
  LangChainMessage,
  LangGraphCommand,
} from "@assistant-ui/react-langgraph";

// Custom error class for chat API errors
export class ChatApiError extends Error {
  constructor(message: string, public originalError?: unknown) {
    super(message);
    this.name = 'ChatApiError';
  }
}

const createClient = () => {
  const apiUrl =
    process.env["NEXT_PUBLIC_LANGGRAPH_API_URL"] ||
    new URL("/api", window.location.href).href;
  return new Client({
    apiUrl,
  });
};

export const createAssistant = async (graphId: string) => {
  const client = createClient();
  try {
    return await client.assistants.create({ graphId });
  } catch (error) {
    throw new ChatApiError('Failed to create assistant', error);
  }
};

export const createThread = async () => {
  const client = createClient();
  try {
    return await client.threads.create();
  } catch (error) {
    throw new ChatApiError('Failed to create thread', error);
  }
};

export const getThreadState = async (
  threadId: string,
): Promise<ThreadState<Record<string, unknown>>> => {
  const client = createClient();
  try {
    return await client.threads.getState(threadId);
  } catch (error) {
    throw new ChatApiError(`Failed to get thread state for thread ${threadId}`, error);
  }
};

export const updateState = async (
  threadId: string,
  fields: {
    newState: Record<string, unknown>;
    asNode?: string;
  },
) => {
  const client = createClient();
  try {
    return await client.threads.updateState(threadId, {
      values: fields.newState,
      asNode: fields.asNode!,
    });
  } catch (error) {
    throw new ChatApiError(`Failed to update state for thread ${threadId}`, error);
  }
};

export const sendMessage = async (params: {
  threadId: string;
  messages: LangChainMessage[];
  command?: LangGraphCommand | undefined;
}) => {
  const client = createClient();

  const input = params.messages.length
    ? { messages: params.messages }
    : undefined;

  const config = {
    configurable: {
      model_name: "openai",
    }
  };

  try {
    return await client.runs.stream(
      params.threadId,
      process.env["NEXT_PUBLIC_LANGGRAPH_ASSISTANT_ID"]!,
      {
        input,
        ...(params.command && { command: params.command }),
        config,
        streamMode: ["updates", "messages"],
      },
    );
  } catch (error: any) {
    // Enhanced error handling
    let errorMessage = `Failed to send message to thread ${params.threadId}`;

    if (error.response) {
      // Add status code and response data if available
      errorMessage += ` (Status ${error.response.status})`;
      if (error.response.data) {
        errorMessage += `: ${JSON.stringify(error.response.data)}`;
      }
    }

    throw new ChatApiError(errorMessage, error);
  }
};
