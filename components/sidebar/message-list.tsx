"use client";

import type { ChatMessage } from "@/types";
import { cn } from "@/lib/utils";

interface MessageListProps {
  messages: ChatMessage[];
  isLoading?: boolean;
}

export function MessageList({ messages, isLoading }: MessageListProps) {
  if (messages.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center p-4">
        <p className="text-purple-400/50 text-sm text-center">
          Describe the system you want to architect
        </p>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto p-3 space-y-3">
      {messages.map((message) => (
        <div
          key={message.id}
          className={cn(
            "rounded-lg px-3 py-2 text-sm",
            message.role === "user"
              ? "bg-purple-600/20 text-purple-100 ml-4"
              : "bg-zinc-800/80 text-zinc-300 mr-4"
          )}
        >
          <p className="whitespace-pre-wrap wrap-break-word">{message.content}</p>
        </div>
      ))}
      {isLoading && (
        <div className="bg-zinc-800/80 text-zinc-400 rounded-lg px-3 py-2 text-sm mr-4">
          <span className="inline-flex gap-1">
            <span className="animate-pulse">Designing</span>
            <span className="animate-bounce delay-100">.</span>
            <span className="animate-bounce delay-200">.</span>
            <span className="animate-bounce delay-300">.</span>
          </span>
        </div>
      )}
    </div>
  );
}
