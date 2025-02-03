import { Client, ThreadState } from "@langchain/langgraph-sdk";
import {
  LangChainMessage,
  LangGraphCommand,
} from "@assistant-ui/react-langgraph";
import { getAccessToken } from '@auth0/nextjs-auth0/edge';

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
  const { accessToken } = await getAccessToken();
  if (!accessToken) {
    throw new Error('Invalid access token');
  }

  const headers = {
    'X-Api-Key': process.env["NEXT_PUBLIC_LANGGRAPH_API_KEY"]!,
    'Authorization': `Bearer ${accessToken}`
  };

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
      },
      { headers }
    );
  } catch (error) {
    if (error.response && error.response.status === 422) {
      throw new Error('Unprocessable Entity: The request was well-formed but was unable to be followed due to semantic errors.');
    }
    throw error;
  }
};
