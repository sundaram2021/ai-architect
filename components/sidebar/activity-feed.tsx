"use client";

import { motion, AnimatePresence } from "framer-motion";
import { ActivityItem } from "./activity-item";
import type { ActivityEvent } from "@/lib/agents";

interface ActivityFeedProps {
  activities: ActivityEvent[];
  currentActivity?: ActivityEvent | null;
}

export function ActivityFeed({ activities, currentActivity }: ActivityFeedProps) {
  const allActivities = currentActivity 
    ? [...activities.filter(a => a.id !== currentActivity.id), currentActivity]
    : activities;
  
  if (allActivities.length === 0) return null;
  
  return (
    <div className="bg-zinc-900/50 rounded-lg border border-zinc-800 overflow-hidden">
      <div className="px-3 py-2 border-b border-zinc-800">
        <span className="text-xs font-medium text-zinc-400 uppercase tracking-wider">
          Processing
        </span>
      </div>
      
      <div className="p-2 space-y-1 max-h-48 overflow-y-auto">
        <AnimatePresence mode="popLayout">
          {allActivities.map((activity, index) => (
            <motion.div
              key={activity.id}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ 
                duration: 0.2,
                delay: index * 0.05,
              }}
            >
              <ActivityItem 
                activity={activity}
                isActive={currentActivity?.id === activity.id}
              />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
