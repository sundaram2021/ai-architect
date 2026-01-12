"use client";

import { useState, FormEvent, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { HiOutlinePaperAirplane } from "react-icons/hi2";

interface ChatInputProps {
  onSend: (message: string) => void;
  disabled?: boolean;
  isLoading?: boolean;
}

export function ChatInput({ onSend, disabled, isLoading }: ChatInputProps) {
  const [input, setInput] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!input.trim() || disabled || isLoading) return;
    
    onSend(input.trim());
    setInput("");
  };

  useEffect(() => {
    if (!isLoading && !disabled && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isLoading, disabled]);

  const canSend = input.trim().length > 0 && !disabled && !isLoading;

  return (
    <form onSubmit={handleSubmit} className="p-3 border-t border-purple-500/30">
      <div className="flex gap-2">
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={isLoading ? "Processing..." : "Describe what you want to build..."}
          disabled={disabled || isLoading}
          className="flex-1 bg-zinc-900 border border-purple-500/30 rounded-lg px-4 py-2.5 
                     text-sm text-purple-100 placeholder-purple-400/50
                     focus:outline-none focus:border-purple-500/60 focus:ring-1 focus:ring-purple-500/30
                     disabled:opacity-50 disabled:cursor-not-allowed
                     transition-colors"
        />
        
        <motion.button
          type="submit"
          disabled={!canSend}
          whileHover={{ scale: canSend ? 1.05 : 1 }}
          whileTap={{ scale: canSend ? 0.95 : 1 }}
          className={`
            px-4 py-2.5 rounded-lg transition-all duration-200
            flex items-center justify-center min-w-[48px]
            ${canSend 
              ? "bg-purple-600 hover:bg-purple-500 text-white shadow-lg shadow-purple-500/20" 
              : "bg-zinc-800 text-zinc-500 cursor-not-allowed"
            }
          `}
        >
          <AnimatePresence mode="wait">
            {isLoading ? (
              <motion.div
                key="loading"
                initial={{ opacity: 0, rotate: -90 }}
                animate={{ opacity: 1, rotate: 0 }}
                exit={{ opacity: 0, rotate: 90 }}
                className="w-5 h-5 border-2 border-zinc-500 border-t-transparent rounded-full animate-spin"
              />
            ) : (
              <motion.div
                key="send"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
              >
                <HiOutlinePaperAirplane className="w-5 h-5" />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.button>
      </div>
      
      {!disabled && !isLoading && (
        <p className="text-[10px] text-zinc-500 mt-1.5 text-center">
          Press Enter to send • Shift+Enter for new line
        </p>
      )}
    </form>
  );
}
