"use client";

import { useState, useEffect, useCallback } from "react";
import type { DecisionOption } from "@/types";

interface ResearchResult {
  status: "pending" | "running" | "completed" | "failed";
  options?: DecisionOption[];
  recommendation?: string;
  error?: string;
}

export function useResearchPolling(researchId: string | null) {
  const [status, setStatus] = useState<
    "idle" | "polling" | "completed" | "failed"
  >("idle");
  const [result, setResult] = useState<ResearchResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const pollResearch = useCallback(async (id: string) => {
    try {
      const response = await fetch(`/api/research/${id}`);

      if (!response.ok) {
        throw new Error("Failed to fetch research status");
      }

      const data = await response.json();
      return data;
    } catch (err) {
      console.error("Polling error:", err);
      throw err;
    }
  }, []);

  useEffect(() => {
    if (!researchId) {
      setStatus("idle");
      return;
    }

    setStatus("polling");
    setError(null);

    let timeoutId: NodeJS.Timeout;
    let pollCount = 0;
    const maxPolls = 60; // Max 2 minutes at 2s intervals
    const pollInterval = 2000;

    const poll = async () => {
      try {
        const data = await pollResearch(researchId);

        if (data.status === "completed" || data.success) {
          setStatus("completed");
          setResult(data);
          return;
        }

        if (data.status === "failed" || data.error) {
          setStatus("failed");
          setError(data.error || "Research failed");
          return;
        }

        // Continue polling
        pollCount++;
        if (pollCount < maxPolls) {
          timeoutId = setTimeout(poll, pollInterval);
        } else {
          setStatus("failed");
          setError("Research timed out");
        }
      } catch (err) {
        setStatus("failed");
        setError(err instanceof Error ? err.message : "Unknown error");
      }
    };

    poll();

    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [researchId, pollResearch]);

  const reset = useCallback(() => {
    setStatus("idle");
    setResult(null);
    setError(null);
  }, []);

  return {
    status,
    result,
    error,
    isPolling: status === "polling",
    isComplete: status === "completed",
    isFailed: status === "failed",
    reset,
  };
}
