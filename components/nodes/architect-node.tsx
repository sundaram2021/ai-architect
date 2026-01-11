"use client";

import { Handle, Position } from "@xyflow/react";
import type { Node, NodeProps } from "@xyflow/react";

type ArchitectNodeData = Node<{
  label: string;
  type: string;
  description?: string;
}>;

// Color mapping based on node type - returns both node colors and handle colors
function getNodeColors(type: string): { bg: string; border: string; text: string; handle: string; handleBorder: string; fill: string; stroke: string } {
  const typeNormalized = type.toLowerCase();
  
  // Client/Frontend - Orange
  if (typeNormalized.includes("client") || typeNormalized.includes("frontend") || typeNormalized.includes("app")) {
    return { bg: "bg-orange-500", border: "border-orange-400", text: "text-black", handle: "bg-orange-400", handleBorder: "border-orange-300", fill: "#f97316", stroke: "#fb923c" };
  }
  
  // CDN/DNS/External Services - Green
  if (typeNormalized.includes("cdn") || typeNormalized.includes("dns") || typeNormalized.includes("pns") || typeNormalized.includes("push")) {
    return { bg: "bg-green-400", border: "border-green-300", text: "text-black", handle: "bg-green-400", handleBorder: "border-green-300", fill: "#4ade80", stroke: "#86efac" };
  }
  
  // Load Balancer/Gateway - Blue
  if (typeNormalized.includes("load") || typeNormalized.includes("balancer") || typeNormalized.includes("gateway")) {
    return { bg: "bg-blue-400", border: "border-blue-300", text: "text-black", handle: "bg-blue-400", handleBorder: "border-blue-300", fill: "#60a5fa", stroke: "#93c5fd" };
  }
  
  // Web Server/Server - Yellow
  if (typeNormalized.includes("server") || typeNormalized.includes("web")) {
    return { bg: "bg-yellow-400", border: "border-yellow-300", text: "text-black", handle: "bg-yellow-400", handleBorder: "border-yellow-300", fill: "#facc15", stroke: "#fde047" };
  }
  
  // API/Service - Yellow lighter
  if (typeNormalized.includes("api") || typeNormalized.includes("service") || typeNormalized.includes("worker")) {
    return { bg: "bg-yellow-300", border: "border-yellow-200", text: "text-black", handle: "bg-yellow-300", handleBorder: "border-yellow-200", fill: "#fde047", stroke: "#fef08a" };
  }
  
  // Queue/Message - Pink
  if (typeNormalized.includes("queue") || typeNormalized.includes("message") || typeNormalized.includes("kafka") || typeNormalized.includes("rabbit")) {
    return { bg: "bg-pink-400", border: "border-pink-300", text: "text-black", handle: "bg-pink-400", handleBorder: "border-pink-300", fill: "#f472b6", stroke: "#f9a8d4" };
  }
  
  // Cache/Memory - Emerald
  if (typeNormalized.includes("cache") || typeNormalized.includes("redis") || typeNormalized.includes("memory")) {
    return { bg: "bg-emerald-400", border: "border-emerald-300", text: "text-black", handle: "bg-emerald-400", handleBorder: "border-emerald-300", fill: "#34d399", stroke: "#6ee7b7" };
  }
  
  // Database - Amber
  if (typeNormalized.includes("database") || typeNormalized.includes("db") || typeNormalized.includes("sql") || 
      typeNormalized.includes("nosql") || typeNormalized.includes("mongo") || typeNormalized.includes("postgres")) {
    return { bg: "bg-amber-300", border: "border-amber-200", text: "text-black", handle: "bg-amber-300", handleBorder: "border-amber-200", fill: "#fcd34d", stroke: "#fde68a" };
  }
  
  // Storage/Object Store - Purple
  if (typeNormalized.includes("storage") || typeNormalized.includes("s3") || typeNormalized.includes("blob") || typeNormalized.includes("object")) {
    return { bg: "bg-purple-400", border: "border-purple-300", text: "text-black", handle: "bg-purple-400", handleBorder: "border-purple-300", fill: "#c084fc", stroke: "#d8b4fe" };
  }
  
  // Default - Cyan (bright and visible)
  return { bg: "bg-cyan-400", border: "border-cyan-300", text: "text-black", handle: "bg-cyan-400", handleBorder: "border-cyan-300", fill: "#22d3ee", stroke: "#67e8f9" };
}

// Check if it's a database type for cylinder icon
function isDatabaseType(type: string): boolean {
  const typeNormalized = type.toLowerCase();
  return typeNormalized.includes("database") || 
         typeNormalized.includes("db") || 
         typeNormalized.includes("sql") || 
         typeNormalized.includes("nosql") || 
         typeNormalized.includes("mongo") || 
         typeNormalized.includes("postgres") ||
         typeNormalized.includes("storage") ||
         typeNormalized.includes("s3") ||
         typeNormalized.includes("blob");
}

export function ArchitectNode({ data }: NodeProps<ArchitectNodeData>) {
  const colors = getNodeColors(data.type);
  const isDatabase = isDatabaseType(data.type);
  
  if (isDatabase) {
    return <DatabaseNode data={data} colors={colors} />;
  }
  
  return <StandardNode data={data} colors={colors} />;
}

// Standard rectangular node
function StandardNode({ 
  data, 
  colors 
}: { 
  data: { label: string; type: string; description?: string }; 
  colors: { bg: string; border: string; text: string; handle: string; handleBorder: string; fill: string; stroke: string } 
}) {
  return (
    <div className={`${colors.bg} ${colors.border} border-2 rounded px-4 py-2 min-w-[100px]
                    shadow-lg hover:shadow-xl transition-shadow cursor-grab active:cursor-grabbing`}>
      <Handle
        type="target"
        position={Position.Top}
        className={`w-2! h-2! ${colors.handle}! ${colors.handleBorder}! -top-1!`}
      />
      <Handle
        type="target"
        position={Position.Left}
        id="left"
        className={`w-2! h-2! ${colors.handle}! ${colors.handleBorder}! -left-1!`}
      />
      
      <div className={`text-sm font-semibold ${colors.text} text-center whitespace-nowrap`}>
        {data.label}
      </div>

      <Handle
        type="source"
        position={Position.Bottom}
        className={`w-2! h-2! ${colors.handle}! ${colors.handleBorder}! -bottom-1!`}
      />
      <Handle
        type="source"
        position={Position.Right}
        id="right"
        className={`w-2! h-2! ${colors.handle}! ${colors.handleBorder}! -right-1!`}
      />
    </div>
  );
}

// Database cylinder node
function DatabaseNode({ 
  data, 
  colors 
}: { 
  data: { label: string; type: string; description?: string }; 
  colors: { bg: string; border: string; text: string; handle: string; handleBorder: string; fill: string; stroke: string } 
}) {
  return (
    <div className="relative cursor-grab active:cursor-grabbing">
      <Handle
        type="target"
        position={Position.Top}
        className={`w-2! h-2! ${colors.handle}! ${colors.handleBorder}! top-0! z-10!`}
      />
      <Handle
        type="target"
        position={Position.Left}
        id="left"
        className={`w-2! h-2! ${colors.handle}! ${colors.handleBorder}! -left-1! top-1/2!`}
      />
      
      {/* Cylinder SVG */}
      <svg width="80" height="70" viewBox="0 0 80 70" className="drop-shadow-lg">
        {/* Top ellipse */}
        <ellipse
          cx="40"
          cy="12"
          rx="35"
          ry="10"
          fill={colors.fill}
          stroke={colors.stroke}
          strokeWidth="2"
        />
        {/* Body */}
        <path
          d="M5 12 L5 55 Q5 65 40 65 Q75 65 75 55 L75 12"
          fill={colors.fill}
          stroke={colors.stroke}
          strokeWidth="2"
        />
        {/* Bottom ellipse (partial, for 3D effect) */}
        <ellipse
          cx="40"
          cy="55"
          rx="35"
          ry="10"
          fill={colors.fill}
          stroke={colors.stroke}
          strokeWidth="2"
        />
      </svg>
      
      {/* Label */}
      <div className={`absolute inset-0 flex items-center justify-center ${colors.text}`}>
        <span className="text-xs font-semibold text-center px-2 leading-tight mt-2">
          {data.label}
        </span>
      </div>

      <Handle
        type="source"
        position={Position.Bottom}
        className={`w-2! h-2! ${colors.handle}! ${colors.handleBorder}! -bottom-1! z-10!`}
      />
      <Handle
        type="source"
        position={Position.Right}
        id="right"
        className={`w-2! h-2! ${colors.handle}! ${colors.handleBorder}! -right-1! top-1/2!`}
      />
    </div>
  );
}
