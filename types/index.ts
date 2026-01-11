import type { Node, Edge } from "@xyflow/react";

export type CanvasState = "empty" | "loading" | "design";

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: number;
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
