"use client";

import { useState, useCallback, useRef } from "react";
import type {
  AgentMessage,
  ClarifyingQuestion,
  ResearchAgentOutput,
  DesignAgentOutput,
  ActivityEvent,
  GatheredState,
} from "@/lib/agents";
import { generateId } from "@/lib/utils";
import { createEmptyGatheredState, computeReadiness } from "@/lib/agents";

interface ChatSessionState {
  messages: AgentMessage[];
  isLoading: boolean;
  activities: ActivityEvent[];
  currentActivity: ActivityEvent | null;
  activeQuestion: ClarifyingQuestion | null;
  activeResearch: ResearchAgentOutput | null;
  gatheredState: GatheredState;
}

export function useChatSession() {
  const [state, setState] = useState<ChatSessionState>({
    messages: [],
    isLoading: false,
    activities: [],
    currentActivity: null,
    activeQuestion: null,
    activeResearch: null,
    gatheredState: createEmptyGatheredState(),
  });

  const abortControllerRef = useRef<AbortController | null>(null);

  const addMessage = useCallback(
    (
      role: AgentMessage["role"],
      content: string,
      extras?: Partial<
        Omit<AgentMessage, "id" | "role" | "content" | "timestamp">
      >
    ): AgentMessage => {
      const message: AgentMessage = {
        id: generateId(),
        role,
        content,
        timestamp: Date.now(),
        ...extras,
      };
      setState((prev) => ({ ...prev, messages: [...prev.messages, message] }));
      return message;
    },
    []
  );

  const clearMessages = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    setState({
      messages: [],
      isLoading: false,
      activities: [],
      currentActivity: null,
      activeQuestion: null,
      activeResearch: null,
      gatheredState: createEmptyGatheredState(),
    });
  }, []);

  const sendMessage = useCallback(
    async (
      content: string,
      onDesign: (data: DesignAgentOutput) => void,
      onLoading?: () => void
    ) => {
      if (!content.trim() || state.isLoading) return;

      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      abortControllerRef.current = new AbortController();

      addMessage("user", content);

      setState((prev) => ({
        ...prev,
        isLoading: true,
        activities: [],
        currentActivity: null,
        activeQuestion: null,
        activeResearch: null,
      }));
      onLoading?.();

      let assistantContent = "";

      try {
        const readiness = computeReadiness(state.gatheredState);
        const response = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            message: content,
            messages: state.messages,
            gatheredState: state.gatheredState,
            isReadyForDesign: readiness.ready,
          }),
          signal: abortControllerRef.current.signal,
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const reader = response.body?.getReader();
        if (!reader) {
          throw new Error("No response body");
        }

        const decoder = new TextDecoder();
        let buffer = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n\n");
          buffer = lines.pop() || "";

          for (const line of lines) {
            if (!line.startsWith("data: ")) continue;
            const data = line.slice(6);
            if (data === "[DONE]") continue;

            try {
              const chunk = JSON.parse(data);

              switch (chunk.type) {
                case "activity": {
                  const activity = chunk.data as ActivityEvent;
                  setState((prev) => {
                    const newActivities =
                      prev.currentActivity &&
                      prev.currentActivity.id !== activity.id
                        ? [...prev.activities, prev.currentActivity]
                        : prev.activities;
                    return {
                      ...prev,
                      activities: newActivities,
                      currentActivity:
                        activity.type === "complete" ||
                        activity.type === "error"
                          ? null
                          : activity,
                    };
                  });
                  break;
                }

                case "message": {
                  assistantContent = (chunk.data as { content: string })
                    .content;
                  break;
                }

                case "question": {
                  const question = chunk.data as ClarifyingQuestion;
                  setState((prev) => ({ ...prev, activeQuestion: question }));
                  break;
                }

                case "research": {
                  const research = chunk.data as ResearchAgentOutput;
                  setState((prev) => ({ ...prev, activeResearch: research }));
                  break;
                }

                case "design": {
                  const design = chunk.data as DesignAgentOutput;
                  onDesign(design);
                  break;
                }

                case "error": {
                  const { message } = chunk.data as { message: string };
                  assistantContent = `Error: ${message}`;
                  break;
                }
              }
            } catch (e) {
              console.error("Failed to parse chunk:", e);
            }
          }
        }

        if (assistantContent) {
          setState((prev) => ({
            ...prev,
            messages: [
              ...prev.messages,
              {
                id: generateId(),
                role: "assistant",
                content: assistantContent,
                timestamp: Date.now(),
                question: prev.activeQuestion || undefined,
                research: prev.activeResearch || undefined,
              },
            ],
          }));
        }
      } catch (error) {
        if (error instanceof Error && error.name === "AbortError") {
          return;
        }
        console.error("Chat error:", error);
        addMessage(
          "assistant",
          "Sorry, I encountered an error. Please try again."
        );
      } finally {
        setState((prev) => ({
          ...prev,
          isLoading: false,
          currentActivity: null,
        }));
      }
    },
    [state.messages, state.isLoading, state.gatheredState, addMessage]
  );

  const answerQuestion = useCallback(
    async (
      value: string,
      onDesign: (data: DesignAgentOutput) => void,
      onLoading?: () => void
    ) => {
      setState((prev) => ({
        ...prev,
        activeQuestion: null,
        gatheredState: {
          ...prev.gatheredState,
          requirements: [...prev.gatheredState.requirements, value],
          questionsAnswered: prev.gatheredState.questionsAnswered + 1,
        },
        messages: prev.messages.map((msg, idx) =>
          idx === prev.messages.length - 1 && msg.question
            ? {
                ...msg,
                selectedOption: {
                  questionId: msg.question.id,
                  optionId: value,
                  value,
                },
              }
            : msg
        ),
      }));

      await sendMessage(value, onDesign, onLoading);
    },
    [sendMessage]
  );

  const selectResearchOption = useCallback(
    async (
      optionId: string,
      optionName: string,
      topic: string,
      onDesign: (data: DesignAgentOutput) => void,
      onLoading?: () => void
    ) => {
      setState((prev) => ({
        ...prev,
        activeResearch: null,
        gatheredState: {
          ...prev.gatheredState,
          decisions: [
            ...prev.gatheredState.decisions,
            { topic, choice: optionName },
          ],
        },
        messages: prev.messages.map((msg, idx) =>
          idx === prev.messages.length - 1 && msg.research
            ? {
                ...msg,
                selectedOption: {
                  questionId: msg.research.topic,
                  optionId,
                  value: optionName,
                },
              }
            : msg
        ),
      }));

      await sendMessage(
        `I choose ${optionName} for ${topic}`,
        onDesign,
        onLoading
      );
    },
    [sendMessage]
  );

  return {
    messages: state.messages,
    isLoading: state.isLoading,
    activities: state.activities,
    currentActivity: state.currentActivity,
    activeQuestion: state.activeQuestion,
    activeResearch: state.activeResearch,
    sendMessage,
    answerQuestion,
    selectResearchOption,
    clearMessages,
  };
}
