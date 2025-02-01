"use client";

import { useRef } from "react";
import { cn } from "@/lib/utils";
import {
  ActionBarPrimitive,
  BranchPickerPrimitive,
  ComposerPrimitive,
  MessagePrimitive,
  ThreadPrimitive,
} from "@assistant-ui/react";
import * as Avatar from "@radix-ui/react-avatar";
import {
  ArrowUpIcon,
  CheckIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  CopyIcon,
  Pencil1Icon,
  ReloadIcon,
} from "@radix-ui/react-icons";
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
  });

  return (
    <ThreadPrimitive.Root
      className="mx-auto max-w-2xl mt-10"
      config={{
        runtime: runtime,
        assistantMessage: { components: { Text: MarkdownText } },
      }}
    >
      <ThreadPrimitive.Viewport>
        <ThreadPrimitive.Messages />
        <ThreadPrimitive.FollowupSuggestions />
      </ThreadPrimitive.Viewport>
      <ThreadPrimitive.ViewportFooter>
        <ThreadPrimitive.ScrollToBottom />
        <ComposerPrimitive />
      </ThreadPrimitive.ViewportFooter>
    </ThreadPrimitive.Root>
  );
}
