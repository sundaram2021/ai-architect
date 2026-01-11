"use client";

import { useState, useCallback } from "react";
import type {
  CanvasState,
  ArchitectureData,
  FlowNode,
  FlowEdge,
} from "@/types";
import { applyNodeChanges, applyEdgeChanges } from "@xyflow/react";
import type { NodeChange, EdgeChange } from "@xyflow/react";

export function useCanvasState() {
  const [canvasState, setCanvasState] = useState<CanvasState>("empty");
  const [nodes, setNodes] = useState<FlowNode[]>([]);
  const [edges, setEdges] = useState<FlowEdge[]>([]);

  const onNodesChange = useCallback((changes: NodeChange<FlowNode>[]) => {
    setNodes((nds) => applyNodeChanges(changes, nds));
  }, []);

  const onEdgesChange = useCallback((changes: EdgeChange<FlowEdge>[]) => {
    setEdges((eds) => applyEdgeChanges(changes, eds));
  }, []);

  const setLoading = useCallback(() => {
    setCanvasState("loading");
  }, []);

  const setArchitecture = useCallback((data: ArchitectureData) => {
    const flowNodes: FlowNode[] = data.nodes.map((node) => ({
      id: node.id,
      type: "base",
      position: node.position,
      draggable: true,
      data: {
        label: node.label,
        type: node.type,
        description: node.description,
      },
    }));

    const flowEdges: FlowEdge[] = data.edges.map((edge) => ({
      id: edge.id,
      source: edge.source,
      target: edge.target,
      label: edge.label,
      type: "smoothstep",
      animated: false,
      style: { stroke: "#374151", strokeWidth: 2 },
    }));

    setNodes(flowNodes);
    setEdges(flowEdges);
    setCanvasState("design");
  }, []);

  const resetCanvas = useCallback(() => {
    setNodes([]);
    setEdges([]);
    setCanvasState("empty");
  }, []);

  return {
    canvasState,
    nodes,
    edges,
    onNodesChange,
    onEdgesChange,
    setLoading,
    setArchitecture,
    resetCanvas,
  };
}
