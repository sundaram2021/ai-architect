"use client";

import { motion } from "framer-motion";

interface OptionPillProps {
  label: string;
  selected?: boolean;
  variant?: "default" | "outline";
  onClick?: () => void;
  disabled?: boolean;
}

export function OptionPill({ 
  label, 
  selected = false, 
  variant = "default",
  onClick,
  disabled = false,
}: OptionPillProps) {
  const baseClasses = `
    px-3 py-1.5 rounded-full text-sm font-medium
    transition-all duration-150 cursor-pointer
    disabled:opacity-50 disabled:cursor-not-allowed
  `;
  
  const variantClasses = {
    default: selected
      ? "bg-purple-500 text-white border border-purple-400 shadow-lg shadow-purple-500/20"
      : "bg-zinc-800 text-zinc-300 border border-zinc-700 hover:bg-zinc-700 hover:border-zinc-600",
    outline: selected
      ? "bg-purple-500/20 text-purple-300 border border-purple-500/50"
      : "bg-transparent text-zinc-400 border border-zinc-600 border-dashed hover:border-zinc-500 hover:text-zinc-300",
  };
  
  return (
    <motion.button
      onClick={onClick}
      disabled={disabled}
      whileHover={{ scale: disabled ? 1 : 1.02 }}
      whileTap={{ scale: disabled ? 1 : 0.98 }}
      className={`${baseClasses} ${variantClasses[variant]}`}
    >
      {label}
    </motion.button>
  );
}
