"use client";

import { motion } from "framer-motion";
import {
  HiOutlineSparkles,
  HiOutlineQuestionMarkCircle,
  HiOutlineMagnifyingGlass,
  HiOutlineScale,
  HiOutlineCubeTransparent,
  HiOutlineSquares2X2,
  HiOutlineCheckCircle,
  HiOutlineExclamationTriangle,
} from "react-icons/hi2";
import type { ActivityEvent, ActivityType } from "@/lib/agents";

interface ActivityItemProps {
  activity: ActivityEvent;
  isActive?: boolean;
}

export function ActivityItem({ activity, isActive = false }: ActivityItemProps) {
  const Icon = ACTIVITY_ICONS[activity.type];
  const isComplete = activity.type === "complete";
  const isError = activity.type === "error";
  
  return (
    <div 
      className={`
        flex items-center gap-2 px-2 py-1.5 rounded-md
        ${isActive ? "bg-zinc-800/50" : ""}
        ${isComplete ? "text-emerald-400" : ""}
        ${isError ? "text-red-400" : ""}
        ${!isComplete && !isError ? "text-zinc-300" : ""}
      `}
    >
      <div className="flex-shrink-0 relative">
        {isActive && !isComplete && !isError ? (
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          >
            <Icon className="w-4 h-4 text-purple-400" />
          </motion.div>
        ) : (
          <Icon className={`w-4 h-4 ${isComplete ? "text-emerald-400" : isError ? "text-red-400" : "text-zinc-500"}`} />
        )}
        
        {isActive && !isComplete && !isError && (
          <motion.div
            className="absolute inset-0 rounded-full bg-purple-400/20"
            animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          />
        )}
      </div>
      
      <span className="text-xs flex-1 truncate">
        {activity.message}
      </span>
      
      {activity.detail && (
        <span className="text-[10px] text-zinc-500 truncate max-w-[80px]">
          {activity.detail}
        </span>
      )}
      
      {isActive && !isComplete && !isError && (
        <motion.div
          className="flex gap-0.5"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <motion.span
            className="w-1 h-1 rounded-full bg-purple-400"
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 0.6, repeat: Infinity, delay: 0 }}
          />
          <motion.span
            className="w-1 h-1 rounded-full bg-purple-400"
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 0.6, repeat: Infinity, delay: 0.2 }}
          />
          <motion.span
            className="w-1 h-1 rounded-full bg-purple-400"
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 0.6, repeat: Infinity, delay: 0.4 }}
          />
        </motion.div>
      )}
      
      {isComplete && (
        <HiOutlineCheckCircle className="w-4 h-4 text-emerald-400" />
      )}
    </div>
  );
}

const ACTIVITY_ICONS: Record<ActivityType, React.ComponentType<{ className?: string }>> = {
  analyzing: HiOutlineSparkles,
  clarifying: HiOutlineQuestionMarkCircle,
  researching: HiOutlineMagnifyingGlass,
  comparing: HiOutlineScale,
  designing: HiOutlineCubeTransparent,
  rendering: HiOutlineSquares2X2,
  complete: HiOutlineCheckCircle,
  error: HiOutlineExclamationTriangle,
};
