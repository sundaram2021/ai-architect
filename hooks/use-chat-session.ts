"use client";

import { useState, useCallback } from "react";
import type { ChatMessage } from "@/types";
import { generateId } from "@/lib/utils";

export function useChatSession() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const addMessage = useCallback(
    (role: "user" | "assistant", content: string) => {
      const message: ChatMessage = {
        id: generateId(),
        role,
        content,
        timestamp: Date.now(),
      };
      setMessages((prev) => [...prev, message]);
      return message;
    },
    []
  );

  const clearMessages = useCallback(() => {
    setMessages([]);
  }, []);

  const sendMessage = useCallback(
    async (content: string, onArchitecture: (data: unknown) => void) => {
      if (!content.trim() || isLoading) return;

      addMessage("user", content);
      setIsLoading(true);

      try {
        const response = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            messages: [...messages, { role: "user", content }],
          }),
        });

        if (!response.ok) {
          throw new Error("Failed to get response");
        }

        const data = await response.json();

        if (data.text) {
          addMessage("assistant", data.text);
        }

        if (data.architecture) {
          onArchitecture(data.architecture);
        }
      } catch (error) {
        console.error("Chat error:", error);
        addMessage(
          "assistant",
          "Sorry, I encountered an error. Please try again."
        );
      } finally {
        setIsLoading(false);
      }
    },
    [messages, isLoading, addMessage]
  );

  return {
    messages,
    isLoading,
    sendMessage,
    clearMessages,
  };
}
