"use client";

import { useState, FormEvent } from "react";

interface ChatInputProps {
  onSend: (message: string) => void;
  disabled?: boolean;
}

export function ChatInput({ onSend, disabled }: ChatInputProps) {
  const [input, setInput] = useState("");

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!input.trim() || disabled) return;
    
    onSend(input.trim());
    setInput("");
  };

  return (
    <form onSubmit={handleSubmit} className="p-3 border-t border-purple-500/30">
      <input
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="start building..."
        disabled={disabled}
        className="w-full bg-zinc-900 border border-purple-500/30 rounded-lg px-4 py-2.5 
                   text-sm text-purple-100 placeholder-purple-400/50
                   focus:outline-none focus:border-purple-500/60 focus:ring-1 focus:ring-purple-500/30
                   disabled:opacity-50 disabled:cursor-not-allowed
                   transition-colors"
      />
    </form>
  );
}
