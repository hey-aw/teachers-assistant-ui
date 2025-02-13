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
  const apiUrl = "/api"; // Update to use the proxy
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
  console.log('[createThread] Debug:', {
    apiUrl: process.env.LANGGRAPH_API_URL,
    hasAssistantId: !!process.env.LANGGRAPH_ASSISTANT_ID,
    hasApiKey: !!process.env.LANGSMITH_API_KEY
  });
  try {
    return await client.threads.create();
  } catch (error) {
    console.error('[createThread] Error details:', error);
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
  user?: { email?: string; email_verified?: boolean };
}) => {
  const client = createClient();
  const { email, email_verified } = params.user || {};
  // User ID is the email address of the user if it exists and is verified
  const userId = email && email_verified ? email : undefined;
  console.log('[sendMessage] User details:', {
    hasUser: !!params.user,
    email: params.user?.email,
    emailVerified: params.user?.email_verified,
    finalUserId: userId
  });

  const input = params.messages.length
    ? { messages: params.messages }
    : undefined;

  try {
    return await client.runs.stream(
      params.threadId,
      process.env["LANGGRAPH_ASSISTANT_ID"]!,
      {
        input,
        ...(params.command && { command: params.command }),
        config: {
          configurable: {
            user_id: email,
            thread_id: params.threadId
          }
        },
        streamMode: ["updates", "messages"],
      },
    );
  } catch (error: unknown) {
    // Enhanced error handling
    let errorMessage = `Failed to send message to thread ${params.threadId}`;

    if (error instanceof Error && 'response' in error) {
      const response = error.response as { status?: number; data?: unknown };
      // Add status code and response data if available 
      if (response.status) {
        errorMessage += ` (Status ${response.status})`;
      }
      if (response.data) {
        errorMessage += `: ${JSON.stringify(response.data)}`;
      }
    }

    throw new ChatApiError(errorMessage, error);
  }
};
