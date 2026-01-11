"use client";

export function LoadingState() {
  return (
    <div className="flex flex-col items-center justify-center h-full">
      {/* Blueprint Grid Animation */}
      <div className="relative w-64 h-64">
        {/* Grid lines */}
        <svg
          className="absolute inset-0 w-full h-full"
          viewBox="0 0 100 100"
          fill="none"
        >
          {/* Horizontal lines */}
          {[0, 20, 40, 60, 80, 100].map((y) => (
            <line
              key={`h-${y}`}
              x1="0"
              y1={y}
              x2="100"
              y2={y}
              stroke="currentColor"
              strokeWidth="0.5"
              className="text-purple-500/20"
            />
          ))}
          {/* Vertical lines */}
          {[0, 20, 40, 60, 80, 100].map((x) => (
            <line
              key={`v-${x}`}
              x1={x}
              y1="0"
              x2={x}
              y2="100"
              stroke="currentColor"
              strokeWidth="0.5"
              className="text-purple-500/20"
            />
          ))}
        </svg>

        {/* Animated blueprint drawing */}
        <svg
          className="absolute inset-0 w-full h-full"
          viewBox="0 0 100 100"
          fill="none"
        >
          {/* Drawing path animation */}
          <path
            d="M20 20 L80 20 L80 50 L60 50 L60 80 L40 80 L40 50 L20 50 Z"
            stroke="currentColor"
            strokeWidth="1"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-purple-500/60"
            strokeDasharray="400"
            strokeDashoffset="400"
            style={{
              animation: "draw 3s ease-in-out infinite",
            }}
          />
          
          {/* Connection lines */}
          <path
            d="M50 20 L50 10 M20 35 L10 35 M80 35 L90 35 M50 80 L50 90"
            stroke="currentColor"
            strokeWidth="0.8"
            strokeLinecap="round"
            className="text-purple-400/40"
            strokeDasharray="100"
            strokeDashoffset="100"
            style={{
              animation: "draw 2s ease-in-out infinite 1s",
            }}
          />

          {/* Pulsing nodes */}
          <circle cx="50" cy="10" r="3" className="text-purple-500/60 fill-current animate-pulse" />
          <circle cx="10" cy="35" r="3" className="text-purple-500/60 fill-current animate-pulse delay-100" />
          <circle cx="90" cy="35" r="3" className="text-purple-500/60 fill-current animate-pulse delay-200" />
          <circle cx="50" cy="90" r="3" className="text-purple-500/60 fill-current animate-pulse delay-300" />
        </svg>
      </div>

      {/* Loading text */}
      <div className="mt-8 flex flex-col items-center">
        <p className="text-purple-300 text-lg font-light">Architecting your system</p>
        <div className="flex gap-1 mt-2">
          <span className="w-2 h-2 bg-purple-500/60 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
          <span className="w-2 h-2 bg-purple-500/60 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
          <span className="w-2 h-2 bg-purple-500/60 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
        </div>
      </div>
    </div>
  );
}
