"use client";

import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Clock, CheckCircle2, AlertCircle, PauseCircle, TrendingUp } from "lucide-react";

type AgentStatus = "idle" | "working" | "blocked" | "offline";

interface Agent {
  _id: string;
  role: string;
  name: string;
  displayName: string;
  avatar?: string;
  department: string;
  status: AgentStatus;
  currentTask?: string;
  performance: {
    tasksCompleted: number;
    avgQuality: number;
    lastActive?: number;
  };
}

interface AgentCardProps {
  agent: Agent;
  onClick?: () => void;
  compact?: boolean;
}

const departmentColors: Record<string, { border: string; bg: string; text: string }> = {
  strategy: {
    border: "border-cyan-500",
    bg: "bg-cyan-500/10",
    text: "text-cyan-400",
  },
  research: {
    border: "border-blue-500",
    bg: "bg-blue-500/10",
    text: "text-blue-400",
  },
  marketing: {
    border: "border-emerald-500",
    bg: "bg-emerald-500/10",
    text: "text-emerald-400",
  },
  engineering: {
    border: "border-violet-500",
    bg: "bg-violet-500/10",
    text: "text-violet-400",
  },
};

const statusConfig: Record<AgentStatus, { icon: React.ReactNode; label: string; color: string }> = {
  idle: {
    icon: <CheckCircle2 className="w-4 h-4" />,
    label: "Available",
    color: "text-emerald-400",
  },
  working: {
    icon: <Clock className="w-4 h-4" />,
    label: "Working",
    color: "text-amber-400",
  },
  blocked: {
    icon: <AlertCircle className="w-4 h-4" />,
    label: "Blocked",
    color: "text-red-400",
  },
  offline: {
    icon: <PauseCircle className="w-4 h-4" />,
    label: "Offline",
    color: "text-slate-400",
  },
};

export function AgentCard({ agent, onClick, compact = false }: AgentCardProps) {
  const colors = departmentColors[agent.department] || departmentColors.strategy;
  const status = statusConfig[agent.status];

  if (compact) {
    return (
      <motion.div
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <Card
          className={`p-3 cursor-pointer border ${colors.border} ${colors.bg} hover:shadow-md transition-all`}
          onClick={onClick}
        >
          <div className="flex items-center gap-3">
            <Avatar className={`w-8 h-8 border ${colors.border}`}>
              <AvatarFallback className="text-sm bg-slate-800">
                {agent.avatar || "👤"}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-slate-100 truncate">
                {agent.displayName}
              </p>
              <div className="flex items-center gap-2">
                <span className={`text-xs ${status.color} flex items-center gap-1`}>
                  {status.icon}
                  {status.label}
                </span>
              </div>
            </div>
          </div>
        </Card>
      </motion.div>
    );
  }

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
    >
      <Card
        className={`p-4 cursor-pointer border-2 ${colors.border} ${colors.bg} hover:shadow-lg transition-all`}
        onClick={onClick}
      >
        <div className="flex items-start gap-4">
          <Avatar className={`w-12 h-12 border-2 ${colors.border}`}>
            <AvatarFallback className="text-xl bg-slate-800">
              {agent.avatar || "👤"}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-1">
              <h3 className="font-semibold text-slate-100 truncate">
                {agent.displayName}
              </h3>
              <Badge variant="outline" className={`${colors.text} ${colors.border}`}>
                {agent.department}
              </Badge>
            </div>
            
            <div className="flex items-center gap-2 mb-2">
              <span className={`text-xs flex items-center gap-1 ${status.color}`}>
                {status.icon}
                {status.label}
              </span>
              {agent.currentTask && (
                <span className="text-xs text-slate-500 truncate">
                  · {agent.currentTask}
                </span>
              )}
            </div>

            {/* Performance Stats */}
            <div className="flex items-center gap-4 text-xs text-slate-400">
              <div className="flex items-center gap-1">
                <TrendingUp className="w-3 h-3" />
                <span>{agent.performance.tasksCompleted} tasks</span>
              </div>
              <div className="flex items-center gap-1">
                <span className={agent.performance.avgQuality >= 4 ? "text-emerald-400" : "text-slate-400"}>
                  {agent.performance.avgQuality.toFixed(1)}/5
                </span>
                <span>avg quality</span>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}
