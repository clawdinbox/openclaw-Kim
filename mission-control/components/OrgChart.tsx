"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { motion, AnimatePresence } from "framer-motion";
import {
  UserCircle,
  Briefcase,
  TrendingUp,
  Clock,
  CheckCircle2,
  AlertCircle,
  PauseCircle,
} from "lucide-react";
import { TaskCreationForm } from "./TaskCreationForm";

type AgentRole =
  | "ceo"
  | "cso"
  | "senior-analyst"
  | "research-associate"
  | "cmo"
  | "newsletter-editor"
  | "engineer"
  | "content-designer"
  | "copywriter"
  | "pricing-analyst"
  | "launch-manager"
  | "operations-assistant"
  | "sales-executive";

type Agent = {
  _id: string;
  role: AgentRole;
  name: string;
  displayName: string;
  avatar?: string;
  department: "strategy" | "research" | "marketing" | "engineering";
  status: "idle" | "working" | "blocked" | "offline";
  currentTask?: string;
  currentTaskId?: string;
  lastOutput?: string;
  lastOutputPath?: string;
  performance: {
    tasksCompleted: number;
    avgQuality: number;
    lastActive?: number;
  };
  capabilities: string[];
  description: string;
};

const departmentColors = {
  strategy: {
    border: "border-cyan-500",
    bg: "bg-cyan-500/10",
    text: "text-cyan-400",
    glow: "shadow-cyan-500/20",
  },
  research: {
    border: "border-blue-500",
    bg: "bg-blue-500/10",
    text: "text-blue-400",
    glow: "shadow-blue-500/20",
  },
  marketing: {
    border: "border-emerald-500",
    bg: "bg-emerald-500/10",
    text: "text-emerald-400",
    glow: "shadow-emerald-500/20",
  },
  engineering: {
    border: "border-violet-500",
    bg: "bg-violet-500/10",
    text: "text-violet-400",
    glow: "shadow-violet-500/20",
  },
};

const statusIcons = {
  idle: <CheckCircle2 className="w-4 h-4 text-emerald-400" />,
  working: <Clock className="w-4 h-4 text-amber-400 animate-pulse" />,
  blocked: <AlertCircle className="w-4 h-4 text-red-400" />,
  offline: <PauseCircle className="w-4 h-4 text-slate-400" />,
};

const statusLabels = {
  idle: "Available",
  working: "Working",
  blocked: "Blocked",
  offline: "Offline",
};

export function OrgChart() {
  const agents = useQuery(api.agents.list) || [];
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  const [showTaskForm, setShowTaskForm] = useState(false);

  const ceo = agents.find((a) => a.role === "ceo");
  const cso = agents.find((a) => a.role === "cso");
  const cmo = agents.find((a) => a.role === "cmo");
  
  // Operations Team (reports to CSO/COO)
  const operationsTeam = agents.filter(
    (a) => ["operations-assistant"].includes(a.role)
  );

  // Digital Products Team (reports to CMO)
  const digitalProductTeam = agents.filter(
    (a) => ["newsletter-editor", "content-designer", "copywriter", "pricing-analyst", "launch-manager"].includes(a.role)
  );

  // Sales Team (reports to CCO)
  const salesTeam = agents.filter(
    (a) => ["sales-executive"].includes(a.role)
  );

  // Other department heads (not part of special teams)
  const departmentHeads = agents.filter(
    (a) => !["ceo", "cso", "cmo", "newsletter-editor", "content-designer", "copywriter", "pricing-analyst", "launch-manager", "operations-assistant", "sales-executive"].includes(a.role)
  );

  const handleDelegate = (agentRole: string) => {
    setShowTaskForm(true);
  };

  return (
    <div className="w-full space-y-8 p-6">
      {/* Organization Header */}
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold text-slate-100">Organization</h2>
        <p className="text-slate-400">AI Agent Team Hierarchy & Status</p>
      </div>

      {/* Org Chart Tree */}
      <div className="flex flex-col items-center gap-8">
        {/* CEO Level */}
        <TooltipProvider>
          {ceo && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
            >
              <Tooltip>
                <TooltipTrigger asChild>
                  <Card
                    className={`p-4 w-64 cursor-pointer border-2 ${departmentColors.strategy.border} ${departmentColors.strategy.bg} hover:shadow-lg hover:${departmentColors.strategy.glow} transition-all duration-300`}
                    onClick={() => setSelectedAgent(ceo as Agent)}
                  >
                    <div className="flex items-center gap-3">
                      <Avatar className="w-12 h-12 border-2 border-cyan-500">
                        <AvatarFallback className="text-2xl bg-slate-800">
                          {ceo.avatar || "👔"}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-slate-100 truncate">
                          {ceo.displayName}
                        </h3>
                        <Badge
                          variant="outline"
                          className="text-xs border-cyan-500/50 text-cyan-400"
                        >
                          CEO
                        </Badge>
                      </div>
                      {statusIcons[ceo.status]}
                    </div>
                  </Card>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Click to view details</p>
                </TooltipContent>
              </Tooltip>
            </motion.div>
          )}

          {/* Connector Line */}
          <div className="w-px h-8 bg-gradient-to-b from-cyan-500/50 to-cyan-500/20" />

          {/* CSO Level */}
          {cso && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.1 }}
            >
              <Tooltip>
                <TooltipTrigger asChild>
                  <Card
                    className={`p-4 w-64 cursor-pointer border-2 ${departmentColors.strategy.border} ${departmentColors.strategy.bg} hover:shadow-lg hover:${departmentColors.strategy.glow} transition-all duration-300`}
                    onClick={() => setSelectedAgent(cso as Agent)}
                  >
                    <div className="flex items-center gap-3">
                      <Avatar className="w-12 h-12 border-2 border-cyan-500">
                        <AvatarFallback className="text-2xl bg-slate-800">
                          {cso.avatar || "🦞"}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-slate-100 truncate">
                          {cso.displayName}
                        </h3>
                        <Badge
                          variant="outline"
                          className="text-xs border-cyan-500/50 text-cyan-400"
                        >
                          Chief Strategy Officer
                        </Badge>
                      </div>
                      {statusIcons[cso.status]}
                    </div>
                  </Card>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Click to view details</p>
                </TooltipContent>
              </Tooltip>
            </motion.div>
          )}

          {/* Connector Lines */}
          <div className="relative w-full max-w-4xl h-8">
            <div className="absolute left-1/2 -translate-x-1/2 w-px h-8 bg-gradient-to-b from-cyan-500/50 to-slate-700" />
            <div className="absolute top-8 left-1/2 -translate-x-1/2 w-3/4 h-px bg-gradient-to-r from-transparent via-slate-700 to-transparent" />
          </div>

          {/* CMO + Department Heads Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 w-full max-w-5xl">
            <AnimatePresence>
              {/* CMO (Marketing Lead) */}
              {cmo && (
                <motion.div
                  key={cmo._id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3, delay: 0.2 }}
                >
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Card
                        className={`p-4 cursor-pointer border-2 ${departmentColors.marketing.border} ${departmentColors.marketing.bg} hover:shadow-lg hover:${departmentColors.marketing.glow} transition-all duration-300`}
                        onClick={() => setSelectedAgent(cmo as Agent)}
                      >
                        <div className="flex items-center gap-3 mb-3">
                          <Avatar
                            className={`w-10 h-10 border-2 ${departmentColors.marketing.border}`}
                          >
                            <AvatarFallback className="text-xl bg-slate-800">
                              {cmo.avatar || "📢"}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-medium text-slate-100 text-sm truncate">
                              {cmo.displayName}
                            </h3>
                            <Badge
                              variant="outline"
                              className={`text-xs ${departmentColors.marketing.border.replace("border-", "border-")} ${departmentColors.marketing.text}`}
                            >
                              Head of Marketing
                            </Badge>
                          </div>
                          {statusIcons[cmo.status]}
                        </div>

                        {/* Quick Stats */}
                        <div className="space-y-2 text-xs">
                          <div className="flex justify-between text-slate-400">
                            <span>Team Size</span>
                            <span className="text-slate-200">6</span>
                          </div>
                          <div className="flex justify-between text-slate-400">
                            <span>Tasks</span>
                            <span className="text-slate-200">
                              {cmo.performance.tasksCompleted}
                            </span>
                          </div>
                          <div className="flex justify-between text-slate-400">
                            <span>Quality</span>
                            <span
                              className={
                                cmo.performance.avgQuality >= 4
                                  ? "text-emerald-400"
                                  : cmo.performance.avgQuality >= 3
                                    ? "text-amber-400"
                                    : "text-slate-200"
                              }
                            >
                              {cmo.performance.avgQuality.toFixed(1)}/5
                            </span>
                          </div>

                          {cmo.currentTask && (
                            <div className="mt-2 p-2 rounded bg-slate-900/50 border border-slate-700">
                              <p className="text-slate-300 truncate">
                                {cmo.currentTask}
                              </p>
                            </div>
                          )}
                        </div>
                      </Card>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Click for details & delegation</p>
                    </TooltipContent>
                  </Tooltip>
                </motion.div>
              )}

              {/* Other Department Heads */}
              {departmentHeads.map((agent, index) => {
                const colors =
                  departmentColors[
                    agent.department as keyof typeof departmentColors
                  ];
                return (
                  <motion.div
                    key={agent._id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3, delay: 0.2 + index * 0.1 }}
                  >
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Card
                          className={`p-4 cursor-pointer border-2 ${colors.border} ${colors.bg} hover:shadow-lg hover:${colors.glow} transition-all duration-300`}
                          onClick={() => setSelectedAgent(agent as Agent)}
                        >
                          <div className="flex items-center gap-3 mb-3">
                            <Avatar
                              className={`w-10 h-10 border-2 ${colors.border}`}
                            >
                              <AvatarFallback className="text-xl bg-slate-800">
                                {agent.avatar || "👤"}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                              <h3 className="font-medium text-slate-100 text-sm truncate">
                                {agent.displayName}
                              </h3>
                              <Badge
                                variant="outline"
                                className={`text-xs ${colors.border.replace("border-", "border-")} ${colors.text}`}
                              >
                                {agent.department}
                              </Badge>
                            </div>
                            {statusIcons[agent.status]}
                          </div>

                          {/* Quick Stats */}
                          <div className="space-y-2 text-xs">
                            <div className="flex justify-between text-slate-400">
                              <span>Tasks</span>
                              <span className="text-slate-200">
                                {agent.performance.tasksCompleted}
                              </span>
                            </div>
                            <div className="flex justify-between text-slate-400">
                              <span>Quality</span>
                              <span
                                className={
                                  agent.performance.avgQuality >= 4
                                    ? "text-emerald-400"
                                    : agent.performance.avgQuality >= 3
                                      ? "text-amber-400"
                                      : "text-slate-200"
                                }
                              >
                                {agent.performance.avgQuality.toFixed(1)}/5
                              </span>
                            </div>

                            {agent.currentTask && (
                              <div className="mt-2 p-2 rounded bg-slate-900/50 border border-slate-700">
                                <p className="text-slate-300 truncate">
                                  {agent.currentTask}
                                </p>
                              </div>
                            )}
                          </div>
                        </Card>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Click for details & delegation</p>
                      </TooltipContent>
                    </Tooltip>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>

          {/* Operations Team Connector */}
          {operationsTeam.length > 0 && (
            <div className="relative w-full max-w-4xl h-8 mt-4">
              <div className="absolute left-3/4 -translate-x-1/2 w-px h-8 bg-gradient-to-b from-cyan-500/50 to-slate-700" />
              <div className="absolute top-8 left-3/4 -translate-x-1/2 w-32 h-px bg-gradient-to-r from-transparent via-slate-700 to-transparent" />
              <div className="absolute top-4 left-3/4 -translate-x-1/2 text-xs text-slate-500 bg-slate-900 px-2">Operations</div>
            </div>
          )}

          {/* Operations Team Grid */}
          {operationsTeam.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-1 gap-3 w-full max-w-xs">
              <AnimatePresence>
                {operationsTeam.map((agent, index) => {
                  const colors = departmentColors.strategy;
                  return (
                    <motion.div
                      key={agent._id}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.3, delay: 0.3 + index * 0.1 }}
                    >
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Card
                            className={`p-3 cursor-pointer border border-cyan-500/50 bg-cyan-500/5 hover:bg-cyan-500/10 hover:shadow-lg transition-all duration-300`}
                            onClick={() => setSelectedAgent(agent as Agent)}
                          >
                            <div className="flex items-center gap-2 mb-2">
                              <Avatar className="w-8 h-8 border border-cyan-500/50">
                                <AvatarFallback className="text-lg bg-slate-800">
                                  {agent.avatar || "👤"}
                                </AvatarFallback>
                              </Avatar>
                              <div className="flex-1 min-w-0">
                                <h3 className="font-medium text-slate-100 text-xs truncate">
                                  {agent.displayName}
                                </h3>
                                <p className="text-[10px] text-slate-400 truncate">
                                  {agent.role.replace("-", " ")}
                                </p>
                              </div>
                              {statusIcons[agent.status]}
                            </div>
                            <div className="flex justify-between text-[10px] text-slate-400">
                              <span>Tasks: {agent.performance.tasksCompleted}</span>
                              <span>Q: {agent.performance.avgQuality.toFixed(1)}</span>
                            </div>
                          </Card>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>{agent.description}</p>
                        </TooltipContent>
                      </Tooltip>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          )}

          {/* Marketing Team Connector */}
          {digitalProductTeam.length > 0 && (
            <div className="relative w-full max-w-4xl h-8 mt-4">
              <div className="absolute left-1/4 -translate-x-1/2 w-px h-8 bg-gradient-to-b from-emerald-500/50 to-slate-700" />
              <div className="absolute top-8 left-1/4 -translate-x-1/2 w-64 h-px bg-gradient-to-r from-transparent via-slate-700 to-transparent" />
              <div className="absolute top-4 left-1/4 -translate-x-1/2 text-xs text-slate-500 bg-slate-900 px-2">Digital Products Team</div>
            </div>
          )}

          {/* Digital Products Team Grid */}
          {digitalProductTeam.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 w-full max-w-3xl">
              <AnimatePresence>
                {digitalProductTeam.map((agent, index) => {
                  const colors = departmentColors.marketing;
                  return (
                    <motion.div
                      key={agent._id}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.3, delay: 0.3 + index * 0.1 }}
                    >
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Card
                            className={`p-3 cursor-pointer border border-emerald-500/50 bg-emerald-500/5 hover:bg-emerald-500/10 hover:shadow-lg transition-all duration-300`}
                            onClick={() => setSelectedAgent(agent as Agent)}
                          >
                            <div className="flex items-center gap-2 mb-2">
                              <Avatar className="w-8 h-8 border border-emerald-500/50">
                                <AvatarFallback className="text-lg bg-slate-800">
                                  {agent.avatar || "👤"}
                                </AvatarFallback>
                              </Avatar>
                              <div className="flex-1 min-w-0">
                                <h3 className="font-medium text-slate-100 text-xs truncate">
                                  {agent.displayName}
                                </h3>
                                <p className="text-[10px] text-slate-400 truncate">
                                  {agent.role.replace("-", " ")}
                                </p>
                              </div>
                              {statusIcons[agent.status]}
                            </div>
                            <div className="flex justify-between text-[10px] text-slate-400">
                              <span>Tasks: {agent.performance.tasksCompleted}</span>
                              <span>Q: {agent.performance.avgQuality.toFixed(1)}</span>
                            </div>
                          </Card>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>{agent.description}</p>
                        </TooltipContent>
                      </Tooltip>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          )}

          {/* Sales Team Connector */}
          {salesTeam.length > 0 && (
            <div className="relative w-full max-w-4xl h-8 mt-4">
              <div className="absolute left-1/4 -translate-x-1/2 w-px h-8 bg-gradient-to-b from-emerald-500/50 to-slate-700" />
              <div className="absolute top-8 left-1/4 -translate-x-1/2 w-32 h-px bg-gradient-to-r from-transparent via-slate-700 to-transparent" />
              <div className="absolute top-4 left-1/4 -translate-x-1/2 text-xs text-slate-500 bg-slate-900 px-2">Sales</div>
            </div>
          )}

          {/* Sales Team Grid */}
          {salesTeam.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-1 gap-3 w-full max-w-xs">
              <AnimatePresence>
                {salesTeam.map((agent, index) => {
                  const colors = departmentColors.marketing;
                  return (
                    <motion.div
                      key={agent._id}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.3, delay: 0.4 + index * 0.1 }}
                    >
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Card
                            className={`p-3 cursor-pointer border border-emerald-500/50 bg-emerald-500/5 hover:bg-emerald-500/10 hover:shadow-lg transition-all duration-300`}
                            onClick={() => setSelectedAgent(agent as Agent)}
                          >
                            <div className="flex items-center gap-2 mb-2">
                              <Avatar className="w-8 h-8 border border-emerald-500/50">
                                <AvatarFallback className="text-lg bg-slate-800">
                                  {agent.avatar || "👤"}
                                </AvatarFallback>
                              </Avatar>
                              <div className="flex-1 min-w-0">
                                <h3 className="font-medium text-slate-100 text-xs truncate">
                                  {agent.displayName}
                                </h3>
                                <p className="text-[10px] text-slate-400 truncate">
                                  {agent.role.replace("-", " ")}
                                </p>
                              </div>
                              {statusIcons[agent.status]}
                            </div>
                            <div className="flex justify-between text-[10px] text-slate-400">
                              <span>Tasks: {agent.performance.tasksCompleted}</span>
                              <span>Q: {agent.performance.avgQuality.toFixed(1)}</span>
                            </div>
                          </Card>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>{agent.description}</p>
                        </TooltipContent>
                      </Tooltip>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          )}
        </TooltipProvider>
      </div>

      {/* Agent Detail Dialog */}
      <Dialog open={!!selectedAgent} onOpenChange={() => setSelectedAgent(null)}>
        <DialogContent className="max-w-2xl bg-slate-900 border-slate-700 text-slate-100">
          {selectedAgent && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-3">
                  <span className="text-3xl">{selectedAgent.avatar}</span>
                  <div>
                    <h2 className="text-xl font-bold">{selectedAgent.displayName}</h2>
                    <p className="text-sm text-slate-400 font-normal">
                      {selectedAgent.description}
                    </p>
                  </div>
                </DialogTitle>
              </DialogHeader>

              <div className="space-y-6 mt-4">
                {/* Status & Current Work */}
                <div className="grid grid-cols-2 gap-4">
                  <Card className="p-4 bg-slate-800 border-slate-700">
                    <div className="flex items-center gap-2 text-slate-400 mb-2">
                      <UserCircle className="w-4 h-4" />
                      <span className="text-sm">Status</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {statusIcons[selectedAgent.status]}
                      <span className="font-medium">
                        {statusLabels[selectedAgent.status]}
                      </span>
                    </div>
                  </Card>

                  <Card className="p-4 bg-slate-800 border-slate-700">
                    <div className="flex items-center gap-2 text-slate-400 mb-2">
                      <TrendingUp className="w-4 h-4" />
                      <span className="text-sm">Performance</span>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Tasks Completed</span>
                        <span className="font-mono">
                          {selectedAgent.performance.tasksCompleted}
                        </span>
                      </div>
                      <div className="space-y-1">
                        <div className="flex justify-between text-sm">
                          <span>Avg Quality</span>
                          <span className="font-mono">
                            {selectedAgent.performance.avgQuality.toFixed(1)}/5
                          </span>
                        </div>
                        <Progress
                          value={selectedAgent.performance.avgQuality * 20}
                          className="h-2"
                        />
                      </div>
                    </div>
                  </Card>
                </div>

                {/* Current Task */}
                {selectedAgent.currentTask && (
                  <Card className="p-4 bg-slate-800 border-slate-700">
                    <div className="flex items-center gap-2 text-slate-400 mb-2">
                      <Briefcase className="w-4 h-4" />
                      <span className="text-sm">Current Task</span>
                    </div>
                    <p className="text-slate-200">{selectedAgent.currentTask}</p>
                  </Card>
                )}

                {/* Last Output */}
                {selectedAgent.lastOutput && (
                  <Card className="p-4 bg-slate-800 border-slate-700">
                    <div className="flex items-center gap-2 text-slate-400 mb-2">
                      <CheckCircle2 className="w-4 h-4" />
                      <span className="text-sm">Last Output</span>
                    </div>
                    <p className="text-slate-200 text-sm">
                      {selectedAgent.lastOutput}
                    </p>
                    {selectedAgent.lastOutputPath && (
                      <p className="text-xs text-slate-500 mt-1 font-mono">
                        {selectedAgent.lastOutputPath}
                      </p>
                    )}
                  </Card>
                )}

                {/* Capabilities */}
                <div>
                  <h4 className="text-sm font-medium text-slate-400 mb-2">
                    Capabilities
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedAgent.capabilities.map((cap) => (
                      <Badge
                        key={cap}
                        variant="secondary"
                        className="bg-slate-800 text-slate-300"
                      >
                        {cap}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Delegate Button */}
                {selectedAgent.role !== "ceo" && selectedAgent.role !== "cso" && (
                  <div className="pt-4 border-t border-slate-800">
                    <TaskCreationForm
                      defaultAssignee={selectedAgent.role}
                      onSuccess={() => setSelectedAgent(null)}
                      triggerButton={
                        <button className="w-full py-2 px-4 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg font-medium transition-colors">
                          Delegate Task to {selectedAgent.displayName}
                        </button>
                      }
                    />
                  </div>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
