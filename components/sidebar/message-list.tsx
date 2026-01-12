"use client";

import { useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { ActivityFeed } from "./activity-feed";
import { QuestionCard } from "./question-card";
import { ResearchCard } from "./research-card";
import type { AgentMessage, ActivityEvent, ClarifyingQuestion, ResearchAgentOutput } from "@/lib/agents";

interface MessageListProps {
  messages: AgentMessage[];
  isLoading?: boolean;
  activities?: ActivityEvent[];
  currentActivity?: ActivityEvent | null;
  activeQuestion?: ClarifyingQuestion | null;
  activeResearch?: ResearchAgentOutput | null;
  onAnswerQuestion?: (value: string) => void;
  onSelectResearchOption?: (optionId: string, optionName: string, topic: string) => void;
}

export function MessageList({ 
  messages, 
  isLoading, 
  activities = [],
  currentActivity,
  activeQuestion,
  activeResearch,
  onAnswerQuestion,
  onSelectResearchOption,
}: MessageListProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading, currentActivity]);

  if (messages.length === 0 && !isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="text-center space-y-2">
          <div className="text-4xl mb-3">🏗️</div>
          <p className="text-purple-300/70 text-sm font-medium">
            AI Architect
          </p>
          <p className="text-zinc-500 text-xs max-w-[200px]">
            Describe the system you want to build and I&apos;ll help design the architecture
          </p>
        </div>
      </div>
    );
  }

  return (
    <div ref={scrollRef} className="flex-1 overflow-y-auto p-3 space-y-3">
      <AnimatePresence mode="popLayout">
        {messages.map((message, index) => (
          <motion.div
            key={message.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
          >
            <div
              className={cn(
                "rounded-lg px-3 py-2 text-sm",
                message.role === "user"
                  ? "bg-purple-600/20 text-purple-100 ml-6 border border-purple-500/20"
                  : message.role === "system"
                  ? "bg-zinc-700/50 text-zinc-400 text-xs italic"
                  : "bg-zinc-800/80 text-zinc-300 mr-6"
              )}
            >
              <p className="whitespace-pre-wrap break-words">{message.content}</p>
            </div>

            {message.question && index === messages.length - 1 && onAnswerQuestion && (
              <div className="mt-2 mr-6">
                <QuestionCard
                  question={message.question}
                  onAnswer={onAnswerQuestion}
                  disabled={isLoading}
                />
              </div>
            )}

            {message.research && index === messages.length - 1 && onSelectResearchOption && (
              <div className="mt-2 mr-6">
                <ResearchCard
                  research={message.research}
                  onSelectOption={onSelectResearchOption}
                  disabled={isLoading}
                />
              </div>
            )}
          </motion.div>
        ))}
      </AnimatePresence>

      {isLoading && (activities.length > 0 || currentActivity) && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mr-6"
        >
          <ActivityFeed 
            activities={activities}
            currentActivity={currentActivity}
          />
        </motion.div>
      )}

      {isLoading && activities.length === 0 && !currentActivity && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-zinc-800/80 text-zinc-400 rounded-lg px-3 py-2 text-sm mr-6"
        >
          <span className="inline-flex items-center gap-2">
            <span className="w-2 h-2 bg-purple-400 rounded-full animate-pulse" />
            Thinking...
          </span>
        </motion.div>
      )}

      {activeQuestion && !messages.some(m => m.question?.id === activeQuestion.id) && onAnswerQuestion && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mr-6"
        >
          <QuestionCard
            question={activeQuestion}
            onAnswer={onAnswerQuestion}
            disabled={isLoading}
          />
        </motion.div>
      )}

      {activeResearch && !messages.some(m => m.research?.topic === activeResearch.topic) && onSelectResearchOption && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mr-6"
        >
          <ResearchCard
            research={activeResearch}
            onSelectOption={onSelectResearchOption}
            disabled={isLoading}
          />
        </motion.div>
      )}
    </div>
  );
}
