"use client";

import { useRef, useCallback } from "react";
import { ChatInput } from "./chat-input";
import { MessageList } from "./message-list";
import { ResizeHandle } from "./resize-handle";
import { NewChatButton } from "./new-chat-button";
import { ToggleButton } from "./toggle-button";
import { useSidebarResize } from "@/hooks";
import type { ChatMessage, DecisionPayload } from "@/types";

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
  messages: ChatMessage[];
  isLoading: boolean;
  onSendMessage: (message: string) => void;
  onNewChat: () => void;
  activeDecision?: DecisionPayload | null;
  onSubmitDecision?: (decisionId: string, optionId: string, optionTitle: string) => void;
}

export function Sidebar({
  isOpen,
  onToggle,
  messages,
  isLoading,
  onSendMessage,
  onNewChat,
  activeDecision,
  onSubmitDecision,
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

  // Disable input when there's an active decision awaiting user choice (status = "ready")
  const isInputDisabled = isLoading || (activeDecision?.status === "ready");

  return (
    <>
      {/* Toggle button when sidebar is closed */}
      {!isOpen && (
        <div className="absolute top-3 left-3 z-20">
          <ToggleButton isOpen={isOpen} onClick={onToggle} />
        </div>
      )}

      {/* Sidebar */}
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
            {/* Header */}
            <div className="flex items-center justify-between p-3 border-b border-purple-500/30">
              <div className="flex items-center gap-2">
                <ToggleButton isOpen={isOpen} onClick={onToggle} />
                <NewChatButton onNewChat={onNewChat} hasMessages={messages.length > 0} />
              </div>
            </div>

            {/* Messages */}
            <MessageList 
              messages={messages} 
              isLoading={isLoading} 
              onSelectOption={onSubmitDecision}
            />

            {/* Input */}
            <ChatInput onSend={onSendMessage} disabled={isInputDisabled} />

            {/* Resize handle */}
            <ResizeHandle onMouseDown={startResizing} />
          </>
        )}
      </div>
    </>
  );
}
