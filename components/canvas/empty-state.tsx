"use client";

export function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center h-full">
      <div className="relative mb-8">
        <div className="w-24 h-24 border-2 border-purple-500/60 rotate-45 
                        flex items-center justify-center">
          <div className="w-12 h-12 border-2 border-purple-500/40 rotate-0" />
        </div>
      </div>

      <h1 className="text-4xl font-light text-purple-100 tracking-wide mb-4">
        AI Architect
      </h1>

      <p className="text-purple-400/70 text-center max-w-md text-sm leading-relaxed">
        Design, visualize, and iterate on system architectures with AI-powered assistance.
        Describe your system and watch it come to life.
      </p>

      <div className="mt-12 text-purple-500/50 text-xs flex items-center gap-2">
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <line x1="5" y1="12" x2="19" y2="12" />
          <polyline points="12 5 19 12 12 19" />
        </svg>
        <span>Open sidebar to start building</span>
      </div>
    </div>
  );
}
