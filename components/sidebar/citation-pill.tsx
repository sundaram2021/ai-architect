"use client";

import type { ResearchCitation } from "@/types";

interface CitationPillProps {
  citation: ResearchCitation;
}

export function CitationPill({ citation }: CitationPillProps) {
  return (
    <a
      href={citation.url}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-1 px-2 py-0.5 bg-zinc-700/50 hover:bg-zinc-600/50 
                 rounded text-[10px] text-zinc-400 hover:text-zinc-300 transition-colors
                 border border-zinc-600/30 hover:border-zinc-500/30"
      title={citation.snippet}
    >
      <svg
        width="10"
        height="10"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="shrink-0"
      >
        <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
        <polyline points="15 3 21 3 21 9" />
        <line x1="10" y1="14" x2="21" y2="3" />
      </svg>
      <span className="truncate max-w-[100px]">{citation.title}</span>
    </a>
  );
}
