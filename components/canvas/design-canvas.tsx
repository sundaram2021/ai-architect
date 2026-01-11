"use client";

import {
  ReactFlow,
  Background,
  Controls,
  ConnectionMode,
  MarkerType,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import type { FlowNode, FlowEdge } from "@/types";
import type { NodeChange, EdgeChange } from "@xyflow/react";
import { ArchitectNode } from "@/components/nodes/architect-node";

const nodeTypes = {
  base: ArchitectNode,
};

const defaultEdgeOptions = {
  type: "smoothstep",
  animated: false,
  style: { 
    stroke: "#374151", 
    strokeWidth: 2,
  },
  markerEnd: {
    type: MarkerType.ArrowClosed,
    color: "#374151",
    width: 20,
    height: 20,
  },
};

interface DesignCanvasProps {
  nodes: FlowNode[];
  edges: FlowEdge[];
  onNodesChange: (changes: NodeChange<FlowNode>[]) => void;
  onEdgesChange: (changes: EdgeChange<FlowEdge>[]) => void;
}

export function DesignCanvas({
  nodes,
  edges,
  onNodesChange,
  onEdgesChange,
}: DesignCanvasProps) {
  return (
    <div className="w-full h-full">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        nodeTypes={nodeTypes as never}
        defaultEdgeOptions={defaultEdgeOptions}
        connectionMode={ConnectionMode.Loose}
        fitView
        fitViewOptions={{ padding: 0.2 }}
        minZoom={0.1}
        maxZoom={2}
        proOptions={{ hideAttribution: true }}
        nodesDraggable={true}
        nodesConnectable={true}
        elementsSelectable={true}
        snapToGrid={true}
        snapGrid={[15, 15]}
      >
        <Background color="rgba(55, 65, 81, 0.3)" gap={20} />
        <Controls 
          className="bg-zinc-900! border-zinc-700! rounded-lg! [&>button]:bg-zinc-800! [&>button]:border-zinc-700! [&>button]:text-zinc-400! [&>button:hover]:bg-zinc-700!" 
          showInteractive={false}
        />
      </ReactFlow>
    </div>
  );
}
