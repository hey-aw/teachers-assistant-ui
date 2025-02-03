"use client";

import { useRef } from "react";
import { Thread, type TextContentPartComponent } from "@assistant-ui/react";
import {
  LangChainMessage,
  useLangGraphInterruptState,
  useLangGraphRuntime,
  useLangGraphSendCommand,
} from "@assistant-ui/react-langgraph";
import { makeMarkdownText } from "@assistant-ui/react-markdown";
import { useUser } from '@auth0/nextjs-auth0/client';
import { Button } from "./ui/button";
import { Tooltip, TooltipTrigger, TooltipContent } from "@radix-ui/react-tooltip";
import {
  ActionBarPrimitive,
  BranchPickerPrimitive,
  ComposerPrimitive,
  MessagePrimitive,
  ThreadPrimitive,
} from "@assistant-ui/react";
import {
  ArrowUpIcon,
  CheckIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  CopyIcon,
  Pencil1Icon,
  ReloadIcon,
} from "@radix-ui/react-icons";

import { createThread, getThreadState, sendMessage } from "@/lib/chatApi";
import { ToolFallback } from "./tools/ToolFallback";

const MarkdownComponent = makeMarkdownText() as unknown as TextContentPartComponent;

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
        <Tooltip>
          <TooltipTrigger asChild>
            <Button onClick={respondYes}>Confirm</Button>
          </TooltipTrigger>
          <TooltipContent side="bottom">Confirm</TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button onClick={respondNo}>Reject</Button>
          </TooltipTrigger>
          <TooltipContent side="bottom">Reject</TooltipContent>
        </Tooltip>
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
        command
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
    <Thread
      runtime={runtime}
      components={{ 
        MessagesFooter: InterruptUI,
        ActionBar: ActionBarPrimitive,
        BranchPicker: BranchPickerPrimitive,
        Composer: ComposerPrimitive,
        Message: MessagePrimitive,
        Thread: ThreadPrimitive,
      }}
      assistantMessage={{ components: { Text: MarkdownComponent, ToolFallback } }}
    />
  );
}
