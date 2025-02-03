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
import {
  LangChainMessage,
  useLangGraphInterruptState,
  useLangGraphRuntime,
  useLangGraphSendCommand,
} from "@assistant-ui/react-langgraph";
import { makeMarkdownText } from "@assistant-ui/react-markdown";
import { useUser } from "@auth0/nextjs-auth0/client";
import { Button } from "./ui/button";

import { createThread, getThreadState, sendMessage } from "@/lib/chatApi";
import { ToolFallback } from "./tools/ToolFallback";

const MarkdownComponent = makeMarkdownText();

const InterruptUI = () => {
  const interrupt = useLangGraphInterruptState();
  const sendCommand = useLangGraphSendCommand();
  if (!interrupt) return null;

  const respondYes = () => {
    sendCommand({ resume: "yes" });
  };
  const respondNo = () => {
    sendCommand({ resume: "no" });
  };

  return (
    <div className="flex flex-col gap-2">
      <div>Interrupt: {interrupt.value}</div>
      <div className="flex items-end gap-2">
        <Button onClick={respondYes}>Confirm</Button>
        <Button onClick={respondNo}>Reject</Button>
      </div>
    </div>
  );
};

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
  });

  return (
    <ThreadPrimitive.Root
      className="mx-auto max-w-2xl mt-10"
      config={{
        runtime: runtime,
        assistantMessage: { components: { Text: MarkdownComponent, ToolFallback } },
      }}
    >
      <ThreadPrimitive.Viewport>
        <ThreadPrimitive.Messages />
        <ThreadPrimitive.FollowupSuggestions />
      </ThreadPrimitive.Viewport>
      <ThreadPrimitive.ViewportFooter>
        <ThreadPrimitive.ScrollToBottom />
        <ComposerPrimitive />
        <InterruptUI />
      </ThreadPrimitive.ViewportFooter>
    </ThreadPrimitive.Root>
  );
}