"use client";

import { useState, useCallback } from "react";
import { Sidebar } from "@/components/sidebar";
import { Canvas } from "@/components/canvas";
import { useChatSession, useCanvasState } from "@/hooks";

export default function Home() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  const { 
    messages, 
    isLoading, 
    sendMessage, 
    clearMessages,
    activities,
    currentActivity,
    activeQuestion,
    answerQuestion,
    activeResearch,
    selectResearchOption,
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
      sendMessage(message, setArchitecture);
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

  const handleAnswerQuestion = useCallback(
    (value: string) => {
      setLoading();
      answerQuestion(value, setArchitecture);
    },
    [answerQuestion, setLoading, setArchitecture]
  );

  const handleSelectResearchOption = useCallback(
    (optionId: string, optionName: string, topic: string) => {
      setLoading();
      selectResearchOption(optionId, optionName, topic, setArchitecture);
    },
    [selectResearchOption, setLoading, setArchitecture]
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
        activities={activities}
        currentActivity={currentActivity}
        activeQuestion={activeQuestion}
        onAnswerQuestion={handleAnswerQuestion}
        activeResearch={activeResearch}
        onSelectResearchOption={handleSelectResearchOption}
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
