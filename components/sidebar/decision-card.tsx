"use client";

import type { DecisionPayload } from "@/types";
import { OptionCard } from "./option-card";
import { ResearchStatus } from "./research-status";

interface DecisionCardProps {
  decision: DecisionPayload;
  onSelectOption: (decisionId: string, optionId: string, optionTitle: string) => void;
  disabled?: boolean;
}

export function DecisionCard({ decision, onSelectOption, disabled }: DecisionCardProps) {
  const isResearching = decision.status === "researching";
  const isSelected = decision.status === "selected";

  return (
    <div className="rounded-lg border-l-4 border-purple-500 bg-zinc-900/80 overflow-hidden">
      <div className="p-3 border-b border-zinc-800">
        <div className="flex items-start gap-2">
          <div className="p-1.5 bg-purple-600/20 rounded">
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="text-purple-400"
            >
              <circle cx="12" cy="12" r="10" />
              <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
              <line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-semibold text-zinc-100">
              {decision.question}
            </h3>
            <p className="text-xs text-zinc-500 mt-0.5">
              {decision.context}
            </p>
          </div>
        </div>
      </div>

      <div className="p-3">
        {isResearching ? (
          <ResearchStatus />
        ) : (
          <div className="space-y-2">
            {decision.options.map((option, index) => (
              <OptionCard
                key={option.id}
                option={option}
                isSelected={decision.selectedOptionId === option.id}
                isRecommended={index === 0}
                onSelect={(optionId) => onSelectOption(decision.id, optionId, option.title)}
                disabled={disabled || isSelected}
              />
            ))}
          </div>
        )}
      </div>

      {!isResearching && !isSelected && (
        <div className="px-3 pb-3">
          <p className="text-[10px] text-zinc-600 text-center">
            Click &quot;Show pros &amp; cons&quot; to see detailed comparison
          </p>
        </div>
      )}
    </div>
  );
}
