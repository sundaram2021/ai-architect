import type { Node, Edge } from "@xyflow/react";

export type CanvasState = "empty" | "loading" | "design";

// Message roles - extended for decision workflow
export type MessageRole = "user" | "assistant" | "decision" | "system";

// Research citation from Exa
export interface ResearchCitation {
  url: string;
  title: string;
  snippet: string;
}

// Individual decision option with research backing
export interface DecisionOption {
  id: string;
  title: string;
  summary: string;
  pros: string[];
  cons: string[];
  bestFor: string;
  citations: ResearchCitation[];
}

// Decision payload for decision-type messages
export interface DecisionPayload {
  id: string;
  question: string;
  context: string;
  options: DecisionOption[];
  status: "researching" | "ready" | "selected";
  selectedOptionId?: string;
  researchId?: string;
}

// Chat message - extended with optional decision
export interface ChatMessage {
  id: string;
  role: MessageRole;
  content: string;
  timestamp: number;
  decision?: DecisionPayload;
}

// Conversation context tracking accumulated decisions
export interface ConversationContext {
  requirements: string[];
  decisions: Array<{
    question: string;
    selectedOption: string;
    reasoning: string;
  }>;
  currentPhase: "gathering" | "deciding" | "designing";
}

// API response modes
export type ResponseMode = "continue" | "decision" | "architecture";

// Chat API response structure
export interface ChatResponse {
  mode: ResponseMode;
  text: string;
  decision?: DecisionPayload;
  architecture?: ArchitectureData;
  error?: string;
}

export interface ArchitectureNode {
  id: string;
  label: string;
  type: string;
  description?: string;
  position: {
    x: number;
    y: number;
  };
}

export interface ArchitectureEdge {
  id: string;
  source: string;
  target: string;
  label?: string;
}

export interface ArchitectureData {
  nodes: ArchitectureNode[];
  edges: ArchitectureEdge[];
  summary?: string;
}

export type FlowNode = Node<{
  label: string;
  type: string;
  description?: string;
}>;
export type FlowEdge = Edge<{ label?: string }>;
