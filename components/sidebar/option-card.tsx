"use client";

import { useState } from "react";
import type { DecisionOption } from "@/types";
import { CitationPill } from "./citation-pill";

interface OptionCardProps {
  option: DecisionOption;
  isSelected: boolean;
  isRecommended?: boolean;
  onSelect: (optionId: string) => void;
  disabled?: boolean;
}

export function OptionCard({
  option,
  isSelected,
  isRecommended,
  onSelect,
  disabled,
}: OptionCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div
      className={`relative rounded-lg border transition-all duration-200 ${
        isSelected
          ? "bg-purple-900/30 border-purple-500 ring-2 ring-purple-500/50"
          : "bg-zinc-800/50 border-zinc-700/50 hover:border-zinc-600/50 hover:bg-zinc-800/80"
      } ${disabled ? "opacity-60 cursor-not-allowed" : ""}`}
    >
      {isRecommended && !isSelected && (
        <div className="absolute -top-2 -right-2 px-2 py-0.5 bg-emerald-600 text-white text-[10px] font-medium rounded-full">
          Recommended
        </div>
      )}

      {isSelected && (
        <div className="absolute -top-2 -right-2 px-2 py-0.5 bg-purple-600 text-white text-[10px] font-medium rounded-full flex items-center gap-1">
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
            <polyline points="20 6 9 17 4 12" />
          </svg>
          Selected
        </div>
      )}

      <div className="p-3">
        <div className="flex items-start justify-between gap-2 mb-2">
          <div>
            <h4 className="text-sm font-semibold text-zinc-100">{option.title}</h4>
            <p className="text-xs text-zinc-400 mt-0.5">{option.summary}</p>
          </div>
        </div>

        {option.bestFor && (
          <p className="text-[11px] text-zinc-500 mb-2">
            <span className="text-zinc-400">Best for:</span> {option.bestFor}
          </p>
        )}

        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-[11px] text-purple-400 hover:text-purple-300 mb-2 flex items-center gap-1"
        >
          <svg
            width="12"
            height="12"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className={`transition-transform ${isExpanded ? "rotate-180" : ""}`}
          >
            <polyline points="6 9 12 15 18 9" />
          </svg>
          {isExpanded ? "Hide details" : "Show pros & cons"}
        </button>

        {isExpanded && (
          <div className="space-y-3 mt-3 pt-3 border-t border-zinc-700/50">
            <div>
              <h5 className="text-[11px] font-medium text-emerald-400 mb-1.5 flex items-center gap-1">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                Advantages
              </h5>
              <ul className="space-y-1">
                {option.pros.map((pro, i) => (
                  <li key={i} className="text-[11px] text-zinc-300 flex items-start gap-1.5">
                    <span className="text-emerald-500 mt-0.5">+</span>
                    {pro}
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h5 className="text-[11px] font-medium text-red-400 mb-1.5 flex items-center gap-1">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
                Disadvantages
              </h5>
              <ul className="space-y-1">
                {option.cons.map((con, i) => (
                  <li key={i} className="text-[11px] text-zinc-300 flex items-start gap-1.5">
                    <span className="text-red-500 mt-0.5">-</span>
                    {con}
                  </li>
                ))}
              </ul>
            </div>

            {option.citations && option.citations.length > 0 && (
              <div>
                <h5 className="text-[11px] font-medium text-zinc-500 mb-1.5">Sources</h5>
                <div className="flex flex-wrap gap-1">
                  {option.citations.map((citation, i) => (
                    <CitationPill key={i} citation={citation} />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {!isSelected && (
          <button
            onClick={() => onSelect(option.id)}
            disabled={disabled}
            className="mt-3 w-full py-1.5 px-3 bg-purple-600/20 hover:bg-purple-600/40 
                       border border-purple-500/30 hover:border-purple-500/50 
                       rounded text-xs font-medium text-purple-300 
                       transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Select this option
          </button>
        )}
      </div>
    </div>
  );
}
