"use client";

import { useState, useCallback, useRef } from "react";
import type {
  ActivityEvent,
  AgentMessage,
  ClarifyingQuestion,
  ResearchAgentOutput,
  DesignAgentOutput,
} from "@/lib/agents";

interface UseAgentStreamReturn {
  // State
  isProcessing: boolean;
  currentActivity: ActivityEvent | null;
  activities: ActivityEvent[];

  // Actions
  startStream: (
    userMessage: string,
    existingMessages: AgentMessage[],
    callbacks: StreamCallbacks
  ) => Promise<void>;
  reset: () => void;
}

interface StreamCallbacks {
  onMessage?: (content: string) => void;
  onQuestion?: (question: ClarifyingQuestion) => void;
  onResearch?: (research: ResearchAgentOutput) => void;
  onDesign?: (design: DesignAgentOutput) => void;
  onError?: (error: string) => void;
  onComplete?: () => void;
}

export function useAgentStream(): UseAgentStreamReturn {
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentActivity, setCurrentActivity] = useState<ActivityEvent | null>(
    null
  );
  const [activities, setActivities] = useState<ActivityEvent[]>([]);
  const abortControllerRef = useRef<AbortController | null>(null);

  const reset = useCallback(() => {
    setIsProcessing(false);
    setCurrentActivity(null);
    setActivities([]);
  }, []);

  const startStream = useCallback(
    async (
      userMessage: string,
      existingMessages: AgentMessage[],
      callbacks: StreamCallbacks
    ) => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      abortControllerRef.current = new AbortController();
      setIsProcessing(true);
      setActivities([]);
      setCurrentActivity(null);

      try {
        const response = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            message: userMessage,
            messages: existingMessages,
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
              handleStreamChunk(
                chunk,
                callbacks,
                setCurrentActivity,
                setActivities
              );
            } catch (e) {
              console.error("Failed to parse chunk:", e);
            }
          }
        }

        callbacks.onComplete?.();
      } catch (error) {
        if (error instanceof Error && error.name === "AbortError") {
          return;
        }
        console.error("Stream error:", error);
        callbacks.onError?.(
          error instanceof Error ? error.message : "Unknown error"
        );
      } finally {
        setIsProcessing(false);
        setCurrentActivity(null);
      }
    },
    []
  );

  return {
    isProcessing,
    currentActivity,
    activities,
    startStream,
    reset,
  };
}

function handleStreamChunk(
  chunk: { type: string; data: unknown },
  callbacks: StreamCallbacks,
  setCurrentActivity: React.Dispatch<
    React.SetStateAction<ActivityEvent | null>
  >,
  setActivities: React.Dispatch<React.SetStateAction<ActivityEvent[]>>
) {
  switch (chunk.type) {
    case "activity": {
      const activity = chunk.data as ActivityEvent;
      setCurrentActivity(activity);

      if (activity.type === "complete" || activity.type === "error") {
        setActivities((prev) => [...prev, activity]);
        setCurrentActivity(null);
      } else {
        setCurrentActivity((prev) => {
          if (prev && prev.id !== activity.id) {
            setActivities((activities) => [...activities, prev]);
          }
          return activity;
        });
      }
      break;
    }

    case "message": {
      const { content } = chunk.data as {
        content: string;
        isComplete: boolean;
      };
      callbacks.onMessage?.(content);
      break;
    }

    case "question": {
      callbacks.onQuestion?.(chunk.data as ClarifyingQuestion);
      break;
    }

    case "research": {
      callbacks.onResearch?.(chunk.data as ResearchAgentOutput);
      break;
    }

    case "design": {
      callbacks.onDesign?.(chunk.data as DesignAgentOutput);
      break;
    }

    case "error": {
      const { message } = chunk.data as { message: string };
      callbacks.onError?.(message);
      break;
    }
  }
}
