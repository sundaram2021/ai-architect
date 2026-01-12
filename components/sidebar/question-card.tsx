"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { OptionPill } from "./option-pill";
import type { ClarifyingQuestion } from "@/lib/agents";
import { HiOutlinePaperAirplane } from "react-icons/hi2";

interface QuestionCardProps {
  question: ClarifyingQuestion;
  onAnswer: (value: string) => void;
  disabled?: boolean;
}

export function QuestionCard({ question, onAnswer, disabled }: QuestionCardProps) {
  const [selectedOptions, setSelectedOptions] = useState<Set<string>>(new Set());
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [customValue, setCustomValue] = useState("");
  
  const handleOptionClick = (optionId: string, value: string) => {
    if (disabled) return;
    
    if (question.multiSelect) {
      const newSelected = new Set(selectedOptions);
      if (newSelected.has(optionId)) {
        newSelected.delete(optionId);
      } else {
        newSelected.add(optionId);
      }
      setSelectedOptions(newSelected);
    } else {
      onAnswer(value);
    }
  };
  
  const handleOtherClick = () => {
    if (disabled) return;
    setShowCustomInput(true);
  };
  
  const handleCustomSubmit = () => {
    if (customValue.trim()) {
      onAnswer(customValue.trim());
      setCustomValue("");
      setShowCustomInput(false);
    }
  };
  
  const handleMultiSelectSubmit = () => {
    if (selectedOptions.size > 0) {
      const values = question.options
        .filter(opt => selectedOptions.has(opt.id))
        .map(opt => opt.value)
        .join(", ");
      onAnswer(values);
    }
  };
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-zinc-800/50 rounded-lg border border-purple-500/20 overflow-hidden"
    >
      <div className="px-4 py-3 border-b border-purple-500/10">
        <h4 className="text-sm font-medium text-purple-100">
          {question.question}
        </h4>
        {question.context && (
          <p className="text-xs text-zinc-400 mt-1">
            {question.context}
          </p>
        )}
      </div>
      
      <div className="p-3">
        <div className="flex flex-wrap gap-2">
          <AnimatePresence>
            {question.options.map((option, index) => (
              <motion.div
                key={option.id}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.05 }}
              >
                <OptionPill
                  label={option.label}
                  selected={selectedOptions.has(option.id)}
                  onClick={() => handleOptionClick(option.id, option.value)}
                  disabled={disabled}
                />
              </motion.div>
            ))}
            
            {question.allowCustom && !showCustomInput && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: question.options.length * 0.05 }}
              >
                <OptionPill
                  label="Other..."
                  variant="outline"
                  onClick={handleOtherClick}
                  disabled={disabled}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        
        <AnimatePresence>
          {showCustomInput && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-3"
            >
              <div className="flex gap-2">
                <input
                  type="text"
                  value={customValue}
                  onChange={(e) => setCustomValue(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleCustomSubmit()}
                  placeholder="Type your answer..."
                  disabled={disabled}
                  autoFocus
                  className="flex-1 bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2
                           text-sm text-zinc-100 placeholder-zinc-500
                           focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/20
                           disabled:opacity-50"
                />
                <button
                  onClick={handleCustomSubmit}
                  disabled={!customValue.trim() || disabled}
                  className="px-3 py-2 bg-purple-600 hover:bg-purple-500 
                           disabled:bg-zinc-700 disabled:cursor-not-allowed
                           rounded-lg transition-colors"
                >
                  <HiOutlinePaperAirplane className="w-4 h-4 text-white" />
                </button>
              </div>
              <button
                onClick={() => setShowCustomInput(false)}
                className="text-xs text-zinc-500 hover:text-zinc-400 mt-2"
              >
                Cancel
              </button>
            </motion.div>
          )}
        </AnimatePresence>
        
        {question.multiSelect && selectedOptions.size > 0 && !showCustomInput && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-3 pt-3 border-t border-zinc-700/50"
          >
            <button
              onClick={handleMultiSelectSubmit}
              disabled={disabled}
              className="w-full py-2 bg-purple-600 hover:bg-purple-500 
                       disabled:bg-zinc-700 disabled:cursor-not-allowed
                       rounded-lg text-sm font-medium text-white transition-colors"
            >
              Continue with {selectedOptions.size} selected
            </button>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}
