"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { HiOutlineBeaker, HiOutlineLink, HiOutlineCheckCircle } from "react-icons/hi2";
import type { ResearchAgentOutput } from "@/lib/agents";

interface ResearchCardProps {
  research: ResearchAgentOutput;
  onSelectOption: (optionId: string, optionName: string, topic: string) => void;
  disabled?: boolean;
}

export function ResearchCard({ research, onSelectOption, disabled }: ResearchCardProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const handleSelect = (option: ResearchAgentOutput["options"][number]) => {
    if (disabled || selectedId) return;
    setSelectedId(option.id);
    onSelectOption(option.id, option.name, research.topic);
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-zinc-800/90 border border-emerald-500/30 rounded-lg overflow-hidden"
    >
      <div className="bg-emerald-500/10 px-3 py-2 border-b border-emerald-500/20 flex items-center gap-2">
        <HiOutlineBeaker className="w-4 h-4 text-emerald-400" />
        <span className="text-sm font-medium text-emerald-300">Research Results</span>
      </div>

      <div className="px-3 py-2 border-b border-zinc-700/50">
        <p className="text-xs text-zinc-400">Topic</p>
        <p className="text-sm text-zinc-200">{research.topic}</p>
      </div>

      {research.recommendation && (
        <div className="px-3 py-2 border-b border-zinc-700/50 bg-emerald-500/5">
          <p className="text-xs text-emerald-400/80 mb-1">💡 Recommendation</p>
          <p className="text-xs text-zinc-300">{research.recommendation}</p>
        </div>
      )}

      <div className="p-2 space-y-2">
        <p className="text-xs text-zinc-500 px-1">Select an option to proceed:</p>
        {research.options.map((option, index) => (
          <motion.button
            key={option.id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
            onClick={() => handleSelect(option)}
            disabled={disabled || !!selectedId}
            className={`
              w-full text-left p-2 rounded-md transition-all duration-200
              ${selectedId === option.id
                ? "bg-emerald-500/20 border border-emerald-500/50"
                : selectedId
                ? "bg-zinc-700/30 opacity-50"
                : "bg-zinc-700/50 hover:bg-zinc-700/80 border border-transparent hover:border-emerald-500/30"
              }
              ${disabled ? "cursor-not-allowed opacity-50" : "cursor-pointer"}
            `}
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-zinc-200">{option.name}</span>
                  {selectedId === option.id && (
                    <HiOutlineCheckCircle className="w-4 h-4 text-emerald-400" />
                  )}
                </div>
                {option.summary && (
                  <p className="text-xs text-zinc-400 mt-0.5 line-clamp-2">
                    {option.summary}
                  </p>
                )}
                {option.pros && option.pros.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-1.5">
                    {option.pros.slice(0, 3).map((pro, i) => (
                      <span 
                        key={i} 
                        className="text-[10px] px-1.5 py-0.5 bg-emerald-500/10 text-emerald-300 rounded"
                      >
                        {pro}
                      </span>
                    ))}
                  </div>
                )}
              </div>
              {option.citations && option.citations.length > 0 && (
                <a
                  href={option.citations[0].url}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="p-1 text-zinc-500 hover:text-emerald-400 transition-colors"
                  title="View source"
                >
                  <HiOutlineLink className="w-3.5 h-3.5" />
                </a>
              )}
            </div>
          </motion.button>
        ))}
      </div>
    </motion.div>
  );
}
