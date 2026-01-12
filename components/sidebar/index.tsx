"use client";

import { useRef, useCallback } from "react";
import { ChatInput } from "./chat-input";
import { MessageList } from "./message-list";
import { ResizeHandle } from "./resize-handle";
import { NewChatButton } from "./new-chat-button";
import { ToggleButton } from "./toggle-button";
import { useSidebarResize } from "@/hooks";
import type { AgentMessage, ActivityEvent, ClarifyingQuestion, ResearchAgentOutput } from "@/lib/agents";

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
  messages: AgentMessage[];
  isLoading: boolean;
  onSendMessage: (message: string) => void;
  onNewChat: () => void;
  activities?: ActivityEvent[];
  currentActivity?: ActivityEvent | null;
  activeQuestion?: ClarifyingQuestion | null;
  onAnswerQuestion?: (value: string) => void;
  activeResearch?: ResearchAgentOutput | null;
  onSelectResearchOption?: (optionId: string, optionName: string, topic: string) => void;
}

export function Sidebar({
  isOpen,
  onToggle,
  messages,
  isLoading,
  onSendMessage,
  onNewChat,
  activities = [],
  currentActivity,
  activeQuestion,
  onAnswerQuestion,
  activeResearch,
  onSelectResearchOption,
}: SidebarProps) {
  const sidebarRef = useRef<HTMLDivElement>(null);
  const { width, isResizing, startResizing, resize } = useSidebarResize();

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!sidebarRef.current || !isResizing) return;
      const rect = sidebarRef.current.getBoundingClientRect();
      resize(e.clientX, rect.left);
    },
    [isResizing, resize]
  );

  const isInputDisabled = isLoading || !!activeQuestion || !!activeResearch;

  return (
    <>
      {!isOpen && (
        <div className="absolute top-3 left-3 z-20">
          <ToggleButton isOpen={isOpen} onClick={onToggle} />
        </div>
      )}

      <div
        ref={sidebarRef}
        onMouseMove={handleMouseMove}
        style={{ width: isOpen ? width : 0 }}
        className={`relative h-full bg-zinc-950 border-r border-purple-500/30 
                    flex flex-col transition-all duration-300 overflow-hidden
                    ${isResizing ? "transition-none" : ""}`}
      >
        {isOpen && (
          <>
            <div className="flex items-center justify-between p-3 border-b border-purple-500/30">
              <div className="flex items-center gap-2">
                <ToggleButton isOpen={isOpen} onClick={onToggle} />
                <NewChatButton onNewChat={onNewChat} hasMessages={messages.length > 0} />
              </div>
            </div>

            <MessageList 
              messages={messages} 
              isLoading={isLoading}
              activities={activities}
              currentActivity={currentActivity}
              activeQuestion={activeQuestion}
              activeResearch={activeResearch}
              onAnswerQuestion={onAnswerQuestion}
              onSelectResearchOption={onSelectResearchOption}
            />

            <ChatInput onSend={onSendMessage} disabled={isInputDisabled} isLoading={isLoading} />

            <ResizeHandle onMouseDown={startResizing} />
          </>
        )}
      </div>
    </>
  );
}
