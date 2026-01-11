"use client";

import { useState, useCallback } from "react";
import type {
  ChatMessage,
  DecisionPayload,
  ConversationContext,
  ChatResponse,
  ArchitectureData,
} from "@/types";
import { generateId } from "@/lib/utils";

export function useChatSession() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [activeDecision, setActiveDecision] = useState<DecisionPayload | null>(
    null
  );
  const [conversationContext, setConversationContext] =
    useState<ConversationContext>({
      requirements: [],
      decisions: [],
      currentPhase: "gathering",
    });

  const addMessage = useCallback(
    (
      role: ChatMessage["role"],
      content: string,
      decision?: DecisionPayload
    ) => {
      const message: ChatMessage = {
        id: generateId(),
        role,
        content,
        timestamp: Date.now(),
        decision,
      };
      setMessages((prev) => [...prev, message]);
      return message;
    },
    []
  );

  const clearMessages = useCallback(() => {
    setMessages([]);
    setActiveDecision(null);
    setConversationContext({
      requirements: [],
      decisions: [],
      currentPhase: "gathering",
    });
  }, []);

  const sendMessage = useCallback(
    async (
      content: string,
      onArchitecture: (data: ArchitectureData) => void,
      onLoading?: () => void
    ) => {
      if (!content.trim() || isLoading) return;

      addMessage("user", content);
      setIsLoading(true);
      onLoading?.();

      try {
        const response = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            messages: [...messages, { role: "user", content }],
            conversationContext,
          }),
        });

        if (!response.ok) {
          throw new Error("Failed to get response");
        }

        const data: ChatResponse = await response.json();

        // Handle different response modes
        if (data.mode === "decision" && data.decision) {
          // Add assistant message with decision
          addMessage("assistant", data.text, data.decision);
          setActiveDecision(data.decision);
        } else if (data.mode === "architecture" && data.architecture) {
          // Add assistant message and trigger architecture render
          addMessage("assistant", data.text);
          onArchitecture(data.architecture);
          setActiveDecision(null);
        } else {
          // Continue mode - just add the message
          addMessage("assistant", data.text);
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
    [messages, isLoading, addMessage, conversationContext]
  );

  const submitDecision = useCallback(
    async (
      decisionId: string,
      optionId: string,
      optionTitle: string,
      onArchitecture: (data: ArchitectureData) => void
    ) => {
      setIsLoading(true);

      try {
        // Update the decision in messages
        setMessages((prev) =>
          prev.map((msg) => {
            if (msg.decision?.id === decisionId) {
              return {
                ...msg,
                decision: {
                  ...msg.decision,
                  status: "selected" as const,
                  selectedOptionId: optionId,
                },
              };
            }
            return msg;
          })
        );

        // Update conversation context
        const updatedContext: ConversationContext = {
          ...conversationContext,
          decisions: [
            ...conversationContext.decisions,
            {
              question: decisionId,
              selectedOption: optionTitle,
              reasoning: "User selected",
            },
          ],
          currentPhase: "deciding",
        };
        setConversationContext(updatedContext);

        // Send decision to API
        const response = await fetch("/api/decision", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            decisionId,
            optionId,
            optionTitle,
            messages,
            conversationContext: updatedContext,
          }),
        });

        if (!response.ok) {
          throw new Error("Failed to submit decision");
        }

        const data = await response.json();

        // Add acknowledgment message
        if (data.text) {
          addMessage("assistant", data.text);
        }

        // Clear active decision
        setActiveDecision(null);

        // If architecture is returned, render it
        if (data.architecture) {
          onArchitecture(data.architecture);
        }
      } catch (error) {
        console.error("Decision submission error:", error);
        addMessage(
          "assistant",
          "Sorry, I had trouble recording your decision. Please try again."
        );
      } finally {
        setIsLoading(false);
      }
    },
    [messages, conversationContext, addMessage]
  );

  return {
    messages,
    isLoading,
    activeDecision,
    conversationContext,
    sendMessage,
    submitDecision,
    clearMessages,
  };
}
