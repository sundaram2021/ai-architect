"use client";

import { useState, useCallback } from "react";
import { Sidebar } from "@/components/sidebar";
import { Canvas } from "@/components/canvas";
import { useChatSession, useCanvasState } from "@/hooks";
import type { ArchitectureData } from "@/types";

export default function Home() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  const { 
    messages, 
    isLoading, 
    sendMessage, 
    clearMessages,
    activeDecision,
    submitDecision,
  } = useChatSession();
  const {
    canvasState,
    nodes,
    edges,
    onNodesChange,
    onEdgesChange,
    setLoading,
    setArchitecture,
    resetCanvas,
  } = useCanvasState();

  const handleSendMessage = useCallback(
    (message: string) => {
      setLoading();
      sendMessage(message, (data) => {
        setArchitecture(data as ArchitectureData);
      });
    },
    [sendMessage, setLoading, setArchitecture]
  );

  const handleNewChat = useCallback(() => {
    clearMessages();
    resetCanvas();
  }, [clearMessages, resetCanvas]);

  const handleToggleSidebar = useCallback(() => {
    setSidebarOpen((prev) => !prev);
  }, []);

  const handleSubmitDecision = useCallback(
    (decisionId: string, optionId: string, optionTitle: string) => {
      setLoading();
      submitDecision(decisionId, optionId, optionTitle, (data) => {
        setArchitecture(data as ArchitectureData);
      });
    },
    [submitDecision, setLoading, setArchitecture]
  );

  return (
    <div className="flex h-screen w-screen overflow-hidden">
      <Sidebar
        isOpen={sidebarOpen}
        onToggle={handleToggleSidebar}
        messages={messages}
        isLoading={isLoading}
        onSendMessage={handleSendMessage}
        onNewChat={handleNewChat}
        activeDecision={activeDecision}
        onSubmitDecision={handleSubmitDecision}
      />
      <Canvas
        state={canvasState}
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
      />
    </div>
  );
}
