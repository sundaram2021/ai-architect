"use client";

import type { CanvasState, FlowNode, FlowEdge } from "@/types";
import type { NodeChange, EdgeChange } from "@xyflow/react";
import { EmptyState } from "./empty-state";
import { LoadingState } from "./loading-state";
import { DesignCanvas } from "./design-canvas";

interface CanvasProps {
  state: CanvasState;
  nodes: FlowNode[];
  edges: FlowEdge[];
  onNodesChange: (changes: NodeChange<FlowNode>[]) => void;
  onEdgesChange: (changes: EdgeChange<FlowEdge>[]) => void;
}

export function Canvas({
  state,
  nodes,
  edges,
  onNodesChange,
  onEdgesChange,
}: CanvasProps) {
  return (
    <div className="flex-1 h-full bg-zinc-950 relative overflow-hidden">
      {/* Diagonal stripes background */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `repeating-linear-gradient(
            45deg,
            transparent,
            transparent 10px,
            rgba(168, 85, 247, 0.5) 10px,
            rgba(168, 85, 247, 0.5) 11px
          )`,
        }}
      />

      {/* Content based on state */}
      <div className="relative z-10 w-full h-full">
        {state === "empty" && <EmptyState />}
        {state === "loading" && <LoadingState />}
        {state === "design" && (
          <DesignCanvas
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
          />
        )}
      </div>
    </div>
  );
}
