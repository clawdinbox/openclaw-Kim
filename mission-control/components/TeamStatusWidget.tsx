"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Users,
  CheckCircle2,
  Clock,
  AlertCircle,
  TrendingUp,
  Activity,
} from "lucide-react";
import { motion } from "framer-motion";

const statusIcons = {
  idle: <CheckCircle2 className="w-3 h-3 text-emerald-400" />,
  working: <Clock className="w-3 h-3 text-amber-400" />,
  blocked: <AlertCircle className="w-3 h-3 text-red-400" />,
  offline: <div className="w-2 h-2 rounded-full bg-slate-500" />,
};

const departmentColors: Record<string, string> = {
  strategy: "border-l-cyan-500",
  research: "border-l-blue-500",
  marketing: "border-l-emerald-500",
  engineering: "border-l-violet-500",
};

export function TeamStatusWidget() {
  const agentStatus = useQuery(api.agents.getStatus);
  const dashboard = useQuery(api.tasks.getDashboard);

  if (!agentStatus || !dashboard) {
    return (
      <Card className="p-4 bg-slate-800/50 border-slate-700">
        <div className="flex items-center gap-2 mb-3">
          <Users className="w-4 h-4 text-slate-400" />
          <span className="text-sm font-medium text-slate-300">Team Status</span>
        </div>
        <div className="space-y-2">
          <Skeleton className="h-8 w-full bg-slate-700" />
          <Skeleton className="h-8 w-full bg-slate-700" />
          <Skeleton className="h-8 w-full bg-slate-700" />
        </div>
      </Card>
    );
  }

  const workingCount = agentStatus.agents.filter((a) => a.status === "working").length;

  return (
    <Card className="p-4 bg-slate-800/50 border-slate-700">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Users className="w-4 h-4 text-cyan-400" />
          <span className="text-sm font-medium text-slate-100">Team Status</span>
        </div>
        <div className="flex items-center gap-2">
          <Activity className="w-3 h-3 text-emerald-400" />
          <span className="text-xs text-emerald-400">{workingCount} active</span>
        </div>
      </div>

      <ScrollArea className="h-48 -mx-2 px-2">
        <div className="space-y-2">
          {agentStatus.agents
            .filter((a) => a.role !== "ceo") // Hide CEO from status list
            .map((agent) => (
              <motion.div
                key={agent.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className={`flex items-center gap-2 p-2 rounded-md bg-slate-900/50 border-l-2 ${departmentColors[agent.role === "cso" ? "strategy" : agent.role.includes("analyst") || agent.role.includes("associate") ? "research" : agent.role === "cmo" ? "marketing" : "engineering"]} hover:bg-slate-800/50 transition-colors`}
              >
                <div className="flex-shrink-0">
                  {statusIcons[agent.status]}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-slate-200 truncate">
                    {agent.name}
                  </p>
                  {agent.currentTask ? (
                    <p className="text-[10px] text-slate-500 truncate">
                      {agent.currentTask}
                    </p>
                  ) : (
                    <p className="text-[10px] text-slate-600">
                      {agent.status === "idle" ? "Available" : agent.status}
                    </p>
                  )}
                </div>
                <div className="flex-shrink-0 text-right">
                  <p className="text-[10px] text-slate-500">
                    {agent.lastActive
                      ? formatTimeAgo(agent.lastActive)
                      : "—"}
                  </p>
                </div>
              </motion.div>
            ))}
        </div>
      </ScrollArea>

      {/* Quick Stats */}
      <div className="mt-3 pt-3 border-t border-slate-700 grid grid-cols-3 gap-2 text-center">
        <div>
          <p className="text-lg font-bold text-amber-400">
            {dashboard.counts.inProgress}
          </p>
          <p className="text-[10px] text-slate-500">In Progress</p>
        </div>
        <div>
          <p className="text-lg font-bold text-violet-400">
            {dashboard.counts.review}
          </p>
          <p className="text-[10px] text-slate-500">Review</p>
        </div>
        <div>
          <p className="text-lg font-bold text-emerald-400">
            {dashboard.counts.complete}
          </p>
          <p className="text-[10px] text-slate-500">Done</p>
        </div>
      </div>
    </Card>
  );
}

function formatTimeAgo(timestamp: number): string {
  const seconds = Math.floor((Date.now() - timestamp) / 1000);
  
  if (seconds < 60) return "now";
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h`;
  return `${Math.floor(seconds / 86400)}d`;
}
