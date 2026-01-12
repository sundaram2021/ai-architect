"use client";

import { memo } from "react";
import { Handle, Position } from "@xyflow/react";
import type { Node, NodeProps } from "@xyflow/react";
import { getTechIcon, getDarkModeColor } from "@/lib/tech-icons";

type ArchitectNodeData = Node<{
  label: string;
  type: string;
  technology?: string;
  description?: string;
}>;

export const ArchitectNode = memo(function ArchitectNode({ 
  data 
}: NodeProps<ArchitectNodeData>) {
  const { icon: Icon, color } = getTechIcon(
    data.technology,
    data.type
  );
  const displayColor = getDarkModeColor(color);
  const isDataNode = isDataType(data.type);
  
  return (
    <div className="group relative">
      <Handle
        type="target"
        position={Position.Top}
        className="w-2! h-2! bg-zinc-600! border-zinc-500! -top-1! opacity-0 group-hover:opacity-100 transition-opacity"
      />
      
      <Handle
        type="target"
        position={Position.Left}
        id="left"
        className="w-2! h-2! bg-zinc-600! border-zinc-500! -left-1! opacity-0 group-hover:opacity-100 transition-opacity"
      />
      
      <div
        className={`
          flex flex-col items-center gap-1.5 px-3 py-2.5
          bg-zinc-900/90 backdrop-blur-sm
          border border-zinc-700/50 rounded-lg
          shadow-lg shadow-black/20
          cursor-grab active:cursor-grabbing
          hover:border-zinc-600/70 hover:shadow-xl
          transition-all duration-200
          ${isDataNode ? "rounded-b-2xl" : ""}
        `}
      >
        <div
          className="p-2 rounded-lg bg-zinc-800/80"
          style={{ boxShadow: `0 0 12px ${displayColor}20` }}
        >
          <Icon 
            size={24} 
            style={{ color: displayColor }}
            className="drop-shadow-sm"
          />
        </div>
        
        <span className="text-xs font-medium text-zinc-200 text-center whitespace-nowrap max-w-[100px] truncate">
          {data.label}
        </span>
        
        <span className="text-[10px] text-zinc-500 uppercase tracking-wider">
          {data.type}
        </span>
      </div>
      
      <Handle
        type="source"
        position={Position.Bottom}
        className="w-2! h-2! bg-zinc-600! border-zinc-500! -bottom-1! opacity-0 group-hover:opacity-100 transition-opacity"
      />
      
      <Handle
        type="source"
        position={Position.Right}
        id="right"
        className="w-2! h-2! bg-zinc-600! border-zinc-500! -right-1! opacity-0 group-hover:opacity-100 transition-opacity"
      />
      
      <div 
        className="absolute inset-0 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"
        style={{ 
          boxShadow: `0 0 20px ${displayColor}15`,
        }}
      />
    </div>
  );
});

function isDataType(type: string): boolean {
  const typeNormalized = type.toLowerCase();
  return (
    typeNormalized.includes("database") ||
    typeNormalized.includes("db") ||
    typeNormalized.includes("cache") ||
    typeNormalized.includes("storage") ||
    typeNormalized.includes("queue")
  );
}

export default ArchitectNode;
