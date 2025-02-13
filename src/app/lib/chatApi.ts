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
  } catch (error: unknown) {
    console.error('[createThread] Error details:', {
      error,
      timestamp: new Date().toISOString()
    });

    let errorMessage = 'Failed to create thread';

    if (error && typeof error === 'object') {
      if ('response' in error) {
        type ErrorResponse = { response: { status?: number; data?: unknown } };
        const errorResponse = error as ErrorResponse;

        if (errorResponse.response.status === 500) {
          errorMessage = 'Server error while creating thread. Please try again later.';
        }

        if (errorResponse.response.data) {
          const errorData = typeof errorResponse.response.data === 'string'
            ? errorResponse.response.data
            : JSON.stringify(errorResponse.response.data);
          errorMessage += `: ${errorData}`;
        }
      }
    }

    throw new ChatApiError(errorMessage, error);
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
  const assistantId = process.env["NEXT_PUBLIC_LANGGRAPH_ASSISTANT_ID"];

  if (!assistantId) {
    throw new ChatApiError('NEXT_PUBLIC_LANGGRAPH_ASSISTANT_ID environment variable is not set');
  }

  // User ID is the email address of the user if it exists and is verified
  const userId = params.user?.email && params.user?.email_verified ? params.user.email : undefined;

  // Enhanced logging
  console.log('[sendMessage] Request details:', {
    threadId: params.threadId,
    hasMessages: params.messages.length > 0,
    hasCommand: !!params.command,
    userId,
    assistantId
  });

  const input = params.messages.length
    ? { messages: params.messages }
    : undefined;

  try {
    const response = await client.runs.stream(
      params.threadId,
      assistantId,
      {
        input,
        ...(params.command && { command: params.command }),
        config: {
          configurable: {
            user_id: userId,
            thread_id: params.threadId,
            assistant_id: assistantId // Explicitly include assistant_id in config
          }
        },
        streamMode: ["updates", "messages"],
      },
    );
    return response;
  } catch (error: unknown) {
    // Enhanced error handling with detailed logging
    console.error('[sendMessage] Error details:', {
      error,
      threadId: params.threadId,
      timestamp: new Date().toISOString()
    });

    let errorMessage = `Failed to send message to thread ${params.threadId}`;

    if (error && typeof error === 'object') {
      if ('response' in error) {
        type ErrorResponse = { response: { status?: number; data?: unknown } };
        const errorResponse = error as ErrorResponse;

        if (errorResponse.response.status === 500) {
          errorMessage = `Internal server error occurred while streaming messages. Please try again later.`;
        } else if (errorResponse.response.status) {
          errorMessage += ` (Status ${errorResponse.response.status})`;
        }

        if (errorResponse.response.data) {
          const errorData = typeof errorResponse.response.data === 'string'
            ? errorResponse.response.data
            : JSON.stringify(errorResponse.response.data);
          errorMessage += `: ${errorData}`;
        }
      }

      if ('message' in error) {
        errorMessage += `\nDetails: ${(error as Error).message}`;
      }
    }

    throw new ChatApiError(errorMessage, error);
  }
};
