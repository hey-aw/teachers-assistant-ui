"use client";

import { useRef } from "react";
import {
  Thread,
  Composer,
  CompositeAttachmentAdapter,
  SimpleImageAttachmentAdapter,
  SimpleTextAttachmentAdapter,
} from "@assistant-ui/react";
import { useLangGraphRuntime } from "@assistant-ui/react-langgraph";
import { makeMarkdownText } from "@assistant-ui/react-markdown";
import { useUser } from '@auth0/nextjs-auth0/client';

import { createThread, getThreadState, sendMessage } from "@/lib/chatApi";

const MarkdownText = makeMarkdownText();

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
      return sendMessage({
        threadId,
        messages,
        command,
        userId: user?.email_verified ? user.email : null
      });
    },
    onSwitchToNewThread: async () => {
      const { thread_id } = await createThread();
      threadIdRef.current = thread_id;
    },
    onSwitchToThread: async (threadId) => {
      const state = await getThreadState(threadId);
      threadIdRef.current = threadId;
      return { messages: state.values.messages };
    },
    adapters: {
      attachments: new CompositeAttachmentAdapter([
        new SimpleImageAttachmentAdapter(),
        new SimpleTextAttachmentAdapter(),
      ]),
    },
  });

  return (
    <Thread.Root
      className="mx-auto max-w-2xl mt-10"
      config={{
        runtime: runtime,
        assistantMessage: { components: { Text: MarkdownText } },
      }}
    >
      <Thread.Viewport>
        <Thread.Messages />
        <Thread.FollowupSuggestions />
      </Thread.Viewport>
      <Thread.ViewportFooter>
        <Thread.ScrollToBottom />
        <Composer />
      </Thread.ViewportFooter>
    </Thread.Root>
  );
}
