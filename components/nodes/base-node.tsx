"use client";

import { Handle, Position } from "@xyflow/react";
import type { Node, NodeProps } from "@xyflow/react";

type BaseNodeData = Node<{ label: string; type: string; description?: string }>;

export function BaseNode({ data }: NodeProps<BaseNodeData>) {
  return (
    <div className="bg-zinc-900 border border-purple-500/40 rounded-lg px-4 py-3 min-w-35
                    shadow-lg shadow-purple-500/10 hover:border-purple-500/60 transition-colors">
      <Handle
        type="target"
        position={Position.Top}
        className="bg-purple-500! border-purple-400! w-3! h-3!"
      />
      
      <div className="text-[10px] text-purple-400/70 uppercase tracking-wider mb-1">
        {data.type}
      </div>
      
      <div className="text-sm text-purple-100 font-medium">
        {data.label}
      </div>
      
      {data.description && (
        <div className="text-xs text-purple-400/60 mt-1 line-clamp-2">
          {data.description}
        </div>
      )}

      <Handle
        type="source"
        position={Position.Bottom}
        className="bg-purple-500! border-purple-400! w-3! h-3!"
      />
    </div>
  );
}
