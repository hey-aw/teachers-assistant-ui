"use client";

import { useRef, useState } from "react";
import { Thread, type TextContentPartComponent } from "@assistant-ui/react";
import {
  LangChainMessage,
  useLangGraphInterruptState,
  useLangGraphRuntime,
  useLangGraphSendCommand,
} from "@assistant-ui/react-langgraph";
import {
  CompositeAttachmentAdapter,
  SimpleImageAttachmentAdapter,
  SimpleTextAttachmentAdapter,
} from "@assistant-ui/react";
import { makeMarkdownText } from "@assistant-ui/react-markdown";
import { useUser } from "@auth0/nextjs-auth0/client";
import { createThread, getThreadState, sendMessage } from "@/lib/chatApi";
import { ToolFallback } from "./tools/ToolFallback";
import { InterruptUI } from "./interrupt";

const MarkdownComponent = makeMarkdownText() as unknown as TextContentPartComponent;

interface ExtendedCommand {
  resume?: string;
  user_id?: string;
}

interface AuthInterrupt {
  value: string;
  resumable: boolean;
  ns: null;
  when: string;
}

export function MyAssistant() {
  const threadIdRef = useRef<string | undefined>(undefined);
  const { user } = useUser();

  const runtime = useLangGraphRuntime({
    threadId: threadIdRef.current,
    stream: async (messages, { command }) => {
      if (!threadIdRef.current) {
        const { thread_id } = await createThread();
        threadIdRef.current = thread_id;
      }
      const threadId = threadIdRef.current;

      // Only use email as user_id if it's verified
      const userId = user?.email && user.email_verified ? user.email : undefined;

      return sendMessage({
        threadId,
        messages,
        command,
        configurable: {
          user_id: userId
        },
        user: user ? {
          email: user.email || undefined,
          email_verified: user.email_verified || undefined
        } : undefined
      });
    },
    onSwitchToNewThread: async () => {
      const { thread_id } = await createThread();
      threadIdRef.current = thread_id;
    },
    onSwitchToThread: async (threadId) => {
      const state = await getThreadState(threadId);
      threadIdRef.current = threadId;
      return { messages: (state.values.messages as LangChainMessage[]) ?? [] };
    },
    adapters: {
      attachments: new CompositeAttachmentAdapter([
        new SimpleImageAttachmentAdapter(),
        new SimpleTextAttachmentAdapter(),
      ]),
    },
  });

  return (
    <div className="h-full">
      <Thread
        runtime={runtime}
        components={{ MessagesFooter: InterruptUI }}
        assistantMessage={{ components: { Text: MarkdownComponent, ToolFallback } }}
      />
    </div>
  );
}

export default MyAssistant;
