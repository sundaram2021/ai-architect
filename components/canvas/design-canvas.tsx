"use client";

import { useMemo, useState, useEffect } from "react";
import {
  ReactFlow,
  Background,
  Controls,
  ConnectionMode,
  MarkerType,
  BaseEdge,
  getBezierPath,
  type EdgeProps,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import type { FlowNode, FlowEdge } from "@/types";
import type { NodeChange, EdgeChange } from "@xyflow/react";
import { ArchitectNode } from "@/components/nodes/architect-node";

const nodeTypes = {
  base: ArchitectNode,
};

function AnimatedEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = {},
  markerEnd,
  data,
}: EdgeProps) {
  const [edgePath] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  const animationIndex = typeof data?.animationIndex === "number" ? data.animationIndex : 0;
  const animationDelay = animationIndex * 0.08;
  const [isAnimated, setIsAnimated] = useState(true);
  
  // Stop animation after initial entrance
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsAnimated(false);
    }, 2000 + animationDelay * 1000);
    return () => clearTimeout(timer);
  }, [animationDelay]);

  return (
    <>
      <BaseEdge
        id={`${id}-glow`}
        path={edgePath}
        style={{
          ...style,
          stroke: "#a855f7",
          strokeWidth: isAnimated ? 4 : 0,
          filter: "blur(4px)",
          opacity: isAnimated ? 0.5 : 0,
          transition: "opacity 0.5s ease-out, stroke-width 0.5s ease-out",
        }}
      />
      <BaseEdge
        id={id}
        path={edgePath}
        markerEnd={markerEnd}
        style={{
          ...style,
          strokeDasharray: isAnimated ? "5 5" : "none",
          strokeDashoffset: isAnimated ? 10 : 0,
          animation: isAnimated 
            ? `edge-flow 0.5s linear infinite, edge-appear 0.4s ease-out ${animationDelay}s both`
            : "none",
        }}
      />
      {isAnimated && (
        <circle
          r="3"
          fill="#a855f7"
          style={{
            animation: `edge-dot 1.5s ease-in-out ${animationDelay}s infinite`,
            offsetPath: `path("${edgePath}")`,
            offsetDistance: "0%",
          }}
        >
          <animate
            attributeName="offset-distance"
            from="0%"
            to="100%"
            dur="1.5s"
            repeatCount="indefinite"
            begin={`${animationDelay}s`}
          />
        </circle>
      )}
      <style jsx global>{`
        @keyframes edge-flow {
          from { stroke-dashoffset: 10; }
          to { stroke-dashoffset: 0; }
        }
        @keyframes edge-appear {
          from { 
            opacity: 0;
            stroke-width: 0;
          }
          to { 
            opacity: 1;
            stroke-width: 1.5;
          }
        }
      `}</style>
    </>
  );
}

const edgeTypes = {
  animated: AnimatedEdge,
};

const defaultEdgeOptions = {
  type: "animated",
  style: { 
    stroke: "#6b7280", 
    strokeWidth: 1.5,
  },
  markerEnd: {
    type: MarkerType.ArrowClosed,
    color: "#9ca3af",
    width: 16,
    height: 16,
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
  const animatedEdges = useMemo(() => {
    return edges.map((edge, index) => ({
      ...edge,
      type: "animated",
      data: { ...edge.data, animationIndex: index },
    }));
  }, [edges]);

  return (
    <div className="w-full h-full">
      <ReactFlow
        nodes={nodes}
        edges={animatedEdges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        nodeTypes={nodeTypes as never}
        edgeTypes={edgeTypes as never}
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
          className="bg-zinc-900! border-zinc-700! rounded-lg! [&>button]:bg-zinc-800! [&>button]:border-zinc-700! [&>button]:text-zinc-300! [&>button:hover]:bg-zinc-700! [&>button>svg]:fill-zinc-300!" 
          showInteractive={false}
        />
      </ReactFlow>
    </div>
  );
}
