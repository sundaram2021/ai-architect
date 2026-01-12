"use client";

import { useState, useCallback } from "react";
import type { CanvasState, FlowNode, FlowEdge } from "@/types";
import type { DesignAgentOutput, DesignNode } from "@/lib/agents";
import { applyNodeChanges, applyEdgeChanges } from "@xyflow/react";
import type { NodeChange, EdgeChange } from "@xyflow/react";

const LAYOUT_CONFIG = {
  TIER_GAP: 250, // Horizontal gap between tiers
  NODE_GAP: 100, // Vertical gap between nodes in same tier
  START_X: 50, // Starting X position
  START_Y: 50, // Starting Y position
  NODE_WIDTH: 120, // Estimated node width for centering
  NODE_HEIGHT: 80, // Estimated node height
};

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

  const setArchitecture = useCallback((data: DesignAgentOutput) => {
    const { flowNodes, flowEdges } = convertDesignToFlow(data);
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

function convertDesignToFlow(design: DesignAgentOutput): {
  flowNodes: FlowNode[];
  flowEdges: FlowEdge[];
} {
  // Group nodes by tier
  const tierGroups = groupNodesByTier(design.nodes);

  // Calculate positions for each node
  const positions = calculateTierPositions(tierGroups);

  // Create flow nodes
  const flowNodes: FlowNode[] = design.nodes.map((node) => ({
    id: node.id,
    type: "base",
    position: positions.get(node.id) || { x: 0, y: 0 },
    draggable: true,
    data: {
      label: node.label,
      type: node.type,
      technology: node.technology,
      description: node.description,
    },
  }));

  // Create flow edges with animation initially enabled (for entrance effect)
  const flowEdges: FlowEdge[] = design.edges.map((edge) => ({
    id: edge.id,
    source: edge.source,
    target: edge.target,
    label: edge.label,
    type: "smoothstep",
    animated: true, // Start animated, will be disabled after entrance
    style: {
      stroke: "#6b7280",
      strokeWidth: 1.5,
    },
    data: { label: edge.label },
  }));

  return { flowNodes, flowEdges };
}

function groupNodesByTier(nodes: DesignNode[]): Map<number, DesignNode[]> {
  const groups = new Map<number, DesignNode[]>();

  for (const node of nodes) {
    const tier = node.tier || inferTierFromType(node.type);
    const existing = groups.get(tier) || [];
    groups.set(tier, [...existing, node]);
  }

  return groups;
}

function inferTierFromType(type: string): number {
  const typeNormalized = type.toLowerCase();

  if (
    typeNormalized.includes("client") ||
    typeNormalized.includes("user") ||
    typeNormalized.includes("mobile")
  ) {
    return 1;
  }
  if (
    typeNormalized.includes("cdn") ||
    typeNormalized.includes("dns") ||
    typeNormalized.includes("waf")
  ) {
    return 2;
  }
  if (
    typeNormalized.includes("gateway") ||
    typeNormalized.includes("load") ||
    typeNormalized.includes("proxy")
  ) {
    return 3;
  }
  if (
    typeNormalized.includes("service") ||
    typeNormalized.includes("api") ||
    typeNormalized.includes("server") ||
    typeNormalized.includes("worker")
  ) {
    return 4;
  }
  if (
    typeNormalized.includes("database") ||
    typeNormalized.includes("cache") ||
    typeNormalized.includes("queue") ||
    typeNormalized.includes("storage")
  ) {
    return 5;
  }

  return 4;
}

function calculateTierPositions(
  tierGroups: Map<number, DesignNode[]>
): Map<string, { x: number; y: number }> {
  const positions = new Map<string, { x: number; y: number }>();

  const tiers = Array.from(tierGroups.keys()).sort((a, b) => a - b);

  let maxNodesInTier = 0;
  for (const nodes of tierGroups.values()) {
    maxNodesInTier = Math.max(maxNodesInTier, nodes.length);
  }

  const totalHeight = maxNodesInTier * LAYOUT_CONFIG.NODE_GAP;

  tiers.forEach((tier, tierIndex) => {
    const nodesInTier = tierGroups.get(tier) || [];
    const tierX = LAYOUT_CONFIG.START_X + tierIndex * LAYOUT_CONFIG.TIER_GAP;

    const tierHeight = nodesInTier.length * LAYOUT_CONFIG.NODE_GAP;
    const tierStartY = LAYOUT_CONFIG.START_Y + (totalHeight - tierHeight) / 2;

    nodesInTier.forEach((node, nodeIndex) => {
      positions.set(node.id, {
        x: tierX,
        y: tierStartY + nodeIndex * LAYOUT_CONFIG.NODE_GAP,
      });
    });
  });

  return positions;
}
