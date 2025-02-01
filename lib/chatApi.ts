import { Client, ThreadState } from "@langchain/langgraph-sdk";
import {
  LangChainMessage,
  LangGraphCommand,
} from "@assistant-ui/react-langgraph";
import { type Interrupt } from './types'

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

interface InterruptError {
  type: 'interrupt'
  interrupt: Interrupt
}

interface ChatResponse {
  type: 'response'
  content: string
}

type ChatResult = ChatResponse | InterruptError

export async function handleChatMessage(
  message: string,
  threadId?: string
): Promise<ChatResult> {
  try {
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message,
        threadId,
      }),
    })

    const data = await response.json()

    // Check if response contains an interrupt
    if (data.__interrupt__) {
      return {
        type: 'interrupt',
        interrupt: data.__interrupt__
      }
    }

    // Normal chat response
    return {
      type: 'response',
      content: data.content
    }

  } catch (error) {
    console.error('Error in chat request:', error)
    throw error
  }
}

// Function to resume after OAuth authorization
export async function resumeAfterAuth(
  threadId: string,
  authCode: string
): Promise<ChatResult> {
  try {
    const response = await fetch('/api/chat/resume', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        threadId,
        authCode,
      }),
    })

    const data = await response.json()

    return {
      type: 'response',
      content: data.content
    }

  } catch (error) {
    console.error('Error resuming chat:', error)
    throw error
  }
}
