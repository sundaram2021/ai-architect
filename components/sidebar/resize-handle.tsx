"use client";

interface ResizeHandleProps {
  onMouseDown: () => void;
}

export function ResizeHandle({ onMouseDown }: ResizeHandleProps) {
  return (
    <div
      onMouseDown={onMouseDown}
      className="absolute right-0 top-0 bottom-0 w-1 cursor-col-resize 
                 bg-purple-500/30 hover:bg-purple-500/50 transition-colors
                 group"
    >
      <div className="absolute inset-y-0 -left-1 -right-1" />
    </div>
  );
}
