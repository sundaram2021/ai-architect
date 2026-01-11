"use client";

export function ResearchStatus() {
  return (
    <div className="flex items-center gap-3 p-4 bg-zinc-900/50 border border-purple-500/20 rounded-lg">
      {/* Animated dots */}
      <div className="flex gap-1">
        <span 
          className="w-2 h-2 bg-purple-500 rounded-full animate-bounce"
          style={{ animationDelay: "0ms", animationDuration: "1s" }}
        />
        <span 
          className="w-2 h-2 bg-purple-500 rounded-full animate-bounce"
          style={{ animationDelay: "150ms", animationDuration: "1s" }}
        />
        <span 
          className="w-2 h-2 bg-purple-500 rounded-full animate-bounce"
          style={{ animationDelay: "300ms", animationDuration: "1s" }}
        />
      </div>
      
      {/* Status text */}
      <div className="flex flex-col">
        <span className="text-sm text-purple-300 font-medium">
          Researching options
        </span>
        <span className="text-xs text-zinc-500">
          Analyzing sources for best recommendations...
        </span>
      </div>
    </div>
  );
}
