"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { motion, AnimatePresence } from "framer-motion";
import {
  UserPlus,
  FilePlus,
  Play,
  CheckCircle2,
  Eye,
  Package,
  RefreshCw,
  type LucideIcon,
} from "lucide-react";

const activityIcons: Record<string, LucideIcon> = {
  agent_spawned: UserPlus,
  task_created: FilePlus,
  task_started: Play,
  task_completed: CheckCircle2,
  task_reviewed: Eye,
  output_delivered: Package,
  status_changed: RefreshCw,
};

const activityColors: Record<string, string> = {
  agent_spawned: "text-cyan-400",
  task_created: "text-blue-400",
  task_started: "text-amber-400",
  task_completed: "text-emerald-400",
  task_reviewed: "text-violet-400",
  output_delivered: "text-pink-400",
  status_changed: "text-slate-400",
};

type ActivityType =
  | "agent_spawned"
  | "task_created"
  | "task_started"
  | "task_completed"
  | "task_reviewed"
  | "output_delivered"
  | "status_changed";

interface Activity {
  _id: string;
  type: ActivityType;
  agentId?: string;
  agentRole?: string;
  taskId?: string;
  message: string;
  metadata?: Record<string, any>;
  timestamp: number;
}

interface ActivityFeedProps {
  limit?: number;
  showTitle?: boolean;
}

export function ActivityFeed({ limit = 20, showTitle = true }: ActivityFeedProps) {
  // Query activities (would need to add this query to convex/activities.ts)
  // For now, we'll use a placeholder that combines task and agent data
  const dashboard = useQuery(api.tasks.getDashboard);
  
  // Generate activities from task data
  const activities: Activity[] = [];
  
  if (dashboard) {
    // Add in-progress tasks as activities
    dashboard.inProgress.forEach((task: any) => {
      activities.push({
        _id: `progress-${task._id}`,
        type: "task_started",
        agentRole: task.assignedTo,
        taskId: task._id,
        message: `Task "${task.title}" started by ${task.assignedTo}`,
        timestamp: task.startedAt || task.createdAt,
      });
    });

    // Add completed tasks as activities
    dashboard.recentCompleted.forEach((task: any) => {
      activities.push({
        _id: `complete-${task._id}`,
        type: "task_completed",
        agentRole: task.assignedTo,
        taskId: task._id,
        message: `Task "${task.title}" completed`,
        metadata: { quality: task.quality },
        timestamp: task.completedAt || task.createdAt,
      });
    });

    // Sort by timestamp desc
    activities.sort((a, b) => b.timestamp - a.timestamp);
  }

  const displayActivities = activities.slice(0, limit);

  return (
    <Card className="bg-slate-800/50 border-slate-700">
      {showTitle && (
        <div className="px-4 py-3 border-b border-slate-700">
          <h3 className="text-sm font-medium text-slate-200">Activity Feed</h3>
        </div>
      )}
      
      <ScrollArea className={showTitle ? "h-64" : "h-full"}>
        <div className="p-2 space-y-1">
          <AnimatePresence initial={false}>
            {displayActivities.map((activity, index) => {
              const Icon = activityIcons[activity.type];
              const colorClass = activityColors[activity.type];
              
              return (
                <motion.div
                  key={activity._id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.2, delay: index * 0.05 }}
                  className="flex items-start gap-3 p-2 rounded-md hover:bg-slate-800/50 transition-colors"
                >
                  <div className={`flex-shrink-0 mt-0.5 ${colorClass}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-slate-300 leading-relaxed">
                      {activity.message}
                    </p>
                    {activity.metadata?.quality && (
                      <span className="text-[10px] text-emerald-400">
                        Quality: {activity.metadata.quality}/5
                      </span>
                    )}
                    <p className="text-[10px] text-slate-500 mt-1">
                      {formatTimestamp(activity.timestamp)}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>

          {displayActivities.length === 0 && (
            <div className="text-center py-8 text-slate-500">
              <RefreshCw className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-xs">No recent activity</p>
            </div>
          )}
        </div>
      </ScrollArea>
    </Card>
  );
}

function formatTimestamp(timestamp: number): string {
  const date = new Date(timestamp);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}
