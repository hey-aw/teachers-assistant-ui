import React from "react";
import { ToolCallContentPartComponent } from "@assistant-ui/react";
import { CheckIcon, ChevronDownIcon, ChevronUpIcon } from "lucide-react";
import { useState } from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../ui/tooltip";
import { Button } from "../ui/button";

export const ToolFallback: React.FC<{ content: string }> = ({ content }) => {
  return (
    <div className="p-4 bg-gray-50 rounded-lg">
      <pre className="whitespace-pre-wrap text-sm">{content}</pre>
    </div>
  );
};

// ... existing code ...
