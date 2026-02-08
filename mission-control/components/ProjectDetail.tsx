"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { TaskBoard } from "./TaskBoard";
import { motion } from "framer-motion";
import {
  Folder,
  Clock,
  CheckCircle2,
  AlertCircle,
  Calendar,
  Users,
  Target,
  TrendingUp,
  Edit3,
  Archive,
  MessageSquare,
  Flag,
  User,
  MoreHorizontal,
  ArrowLeft,
} from "lucide-react";
import { Id } from "@/convex/_generated/dataModel";

type ProjectStatus = "planning" | "active" | "on-hold" | "completed" | "cancelled";
type ProjectPriority = "p0" | "p1" | "p2";
type UpdateType = "progress" | "blocker" | "milestone" | "decision";

interface Project {
  _id: Id<"projects">;
  name: string;
  description: string;
  status: ProjectStatus;
  priority: ProjectPriority;
  owner: Id<"agents">;
  team: Id<"agents">[];
  startDate: number;
  targetDate?: number;
  completedAt?: number;
  progress: number;
  tags: string[];
  folder: string;
  ownerInfo: {
    id: Id<"agents">;
    name: string;
    avatar?: string;
    role?: string;
  } | null;
  teamInfo: {
    id: Id<"agents">;
    name: string;
    avatar?: string;
  }[];
  tasks: any[];
  updates: {
    _id: Id<"projectUpdates">;
    projectId: Id<"projects">;
    agentId: Id<"agents">;
    message: string;
    type: UpdateType;
    timestamp: number;
    agentInfo: {
      id: Id<"agents">;
      name: string;
      avatar?: string;
    } | null;
  }[];
}

const statusConfig = {
  planning: {
    label: "Planning",
    color: "bg-slate-600 text-slate-200",
    icon: Clock,
    next: "active",
  },
  active: {
    label: "Active",
    color: "bg-cyan-600 text-white",
    icon: TrendingUp,
    next: "completed",
  },
  "on-hold": {
    label: "On Hold",
    color: "bg-amber-600 text-white",
    icon: AlertCircle,
    next: "active",
  },
  completed: {
    label: "Completed",
    color: "bg-emerald-600 text-white",
    icon: CheckCircle2,
    next: null,
  },
  cancelled: {
    label: "Cancelled",
    color: "bg-slate-700 text-slate-400",
    icon: AlertCircle,
    next: null,
  },
};

const priorityConfig = {
  p0: { label: "P0 - Critical", color: "bg-red-500 text-white" },
  p1: { label: "P1 - High", color: "bg-amber-500 text-white" },
  p2: { label: "P2 - Normal", color: "bg-blue-500 text-white" },
};

const updateTypeConfig: Record<UpdateType, { color: string; icon: any }> = {
  progress: { color: "bg-blue-500/20 text-blue-400", icon: TrendingUp },
  blocker: { color: "bg-red-500/20 text-red-400", icon: AlertCircle },
  milestone: { color: "bg-emerald-500/20 text-emerald-400", icon: CheckCircle2 },
  decision: { color: "bg-purple-500/20 text-purple-400", icon: Flag },
};

const folderColors: Record<string, string> = {
  Content: "bg-pink-500/20 text-pink-400 border-pink-500/30",
  Product: "bg-purple-500/20 text-purple-400 border-purple-500/30",
  Research: "bg-cyan-500/20 text-cyan-400 border-cyan-500/30",
  Operations: "bg-slate-500/20 text-slate-400 border-slate-500/30",
  Revenue: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
};

function UpdateCard({
  update,
}: {
  update: Project["updates"][0];
}) {
  const config = updateTypeConfig[update.type];
  const TypeIcon = config.icon;

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffHours < 1) return "Just now";
    if (diffHours < 24) return `${Math.floor(diffHours)}h ago`;
    if (diffHours < 48) return "Yesterday";
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 5 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex gap-3 p-3 rounded-lg bg-slate-800/50 border border-slate-700/50"
    >
      <div className="flex-shrink-0">
        {update.agentInfo?.avatar ? (
          <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-sm">
            {update.agentInfo.avatar}
          </div>
        ) : (
          <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center">
            <User className="w-4 h-4 text-slate-500" />
          </div>
        )}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-sm font-medium text-slate-200">
            {update.agentInfo?.name || "Unknown"}
          </span>
          <Badge className={`text-xs ${config.color}`}>
            <TypeIcon className="w-3 h-3 mr-1" />
            {update.type}
          </Badge>
          <span className="text-xs text-slate-500">{formatDate(update.timestamp)}</span>
        </div>
        <p className="text-sm text-slate-300">{update.message}</p>
      </div>
    </motion.div>
  );
}

export function ProjectDetail({
  project,
  open,
  onClose,
}: {
  project: Project | null;
  open: boolean;
  onClose: () => void;
}) {
  const updateProject = useMutation(api.projects.update);
  const addUpdate = useMutation(api.projectUpdates.create);
  const updateProgress = useMutation(api.projects.updateProgress);

  const [newUpdate, setNewUpdate] = useState("");
  const [updateType, setUpdateType] = useState<UpdateType>("progress");
  const [isEditing, setIsEditing] = useState(false);

  if (!project) return null;

  const status = statusConfig[project.status];
  const StatusIcon = status.icon;
  const priority = priorityConfig[project.priority];
  const folderColor = folderColors[project.folder] || "bg-slate-500/20 text-slate-400";

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const isOverdue =
    project.targetDate &&
    project.targetDate < Date.now() &&
    project.status !== "completed" &&
    project.status !== "cancelled";

  const handleAddUpdate = async () => {
    if (!newUpdate.trim()) return;

    await addUpdate({
      projectId: project._id,
      agentId: project.owner,
      message: newUpdate,
      type: updateType,
    });

    setNewUpdate("");
  };

  const handleStatusChange = async () => {
    if (!status.next) return;

    await updateProject({
      id: project._id,
      status: status.next as ProjectStatus,
    });
  };

  const handleRefreshProgress = async () => {
    await updateProgress({ id: project._id });
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl bg-slate-900 border-slate-700 text-slate-100 max-h-[95vh] p-0">
        {/* Header */}
        <div className="p-6 border-b border-slate-800">
          <DialogHeader>
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2 mb-2 flex-wrap">
                  <Badge className={`${priority.color} text-xs font-mono`}>
                    {priority.label}
                  </Badge>
                  <Badge className={`${status.color} text-xs`}>
                    <StatusIcon className="w-3 h-3 mr-1" />
                    {status.label}
                  </Badge>
                  <Badge className={`text-xs ${folderColor} border`}>
                    <Folder className="w-3 h-3 mr-1" />
                    {project.folder}
                  </Badge>
                </div>

                <DialogTitle className="text-2xl font-bold text-slate-100 mb-2">
                  {project.name}
                </DialogTitle>

                <p className="text-slate-400">{project.description}</p>
              </div>

              <div className="flex items-center gap-2">
                {status.next && (
                  <Button
                    onClick={handleStatusChange}
                    className="bg-cyan-600 hover:bg-cyan-500"
                    size="sm"
                  >
                    Mark as {statusConfig[status.next as ProjectStatus]?.label}
                  </Button>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  className="border-slate-600"
                  onClick={() => setIsEditing(!isEditing)}
                >
                  <Edit3 className="w-4 h-4 mr-1" />
                  Edit
                </Button>
              </div>
            </div>

            {/* Progress Section */}
            <div className="mt-6">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-4">
                  <span className="text-sm text-slate-400">Overall Progress</span>
                  <span className="text-2xl font-bold text-cyan-400 font-mono">
                    {project.progress}%
                  </span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleRefreshProgress}
                  className="text-slate-500"
                >
                  Refresh
                </Button>
              </div>
              <Progress
                value={project.progress}
                className="h-3 bg-slate-700"
              />
            </div>
          </DialogHeader>
        </div>

        {/* Content */}
        <div className="flex flex-col lg:flex-row">
          {/* Main Content */}
          <div className="flex-1 p-6">
            <Tabs defaultValue="tasks" className="w-full">
              <TabsList className="bg-slate-800 border border-slate-700 mb-4">
                <TabsTrigger value="tasks" className="data-[state=active]:bg-slate-700">
                  Task Board
                </TabsTrigger>
                <TabsTrigger value="updates" className="data-[state=active]:bg-slate-700">
                  Activity
                </TabsTrigger>
                <TabsTrigger value="details" className="data-[state=active]:bg-slate-700">
                  Details
                </TabsTrigger>
              </TabsList>

              <TabsContent value="tasks" className="mt-0">
                <TaskBoard projectId={project._id} tasks={project.tasks} />
              </TabsContent>

              <TabsContent value="updates" className="mt-0">
                <div className="space-y-4">
                  {/* Add Update */}
                  <Card className="p-4 bg-slate-800 border-slate-700">
                    <h4 className="text-sm font-medium text-slate-400 mb-3">
                      Post Update
                    </h4>
                    <Textarea
                      value={newUpdate}
                      onChange={(e) => setNewUpdate(e.target.value)}
                      placeholder="Share progress, blockers, or decisions..."
                      className="bg-slate-900 border-slate-700 text-slate-100 mb-3"
                    />
                    <div className="flex items-center justify-between">
                      <div className="flex gap-2">
                        {(["progress", "blocker", "milestone", "decision"] as UpdateType[]).map(
                          (type) => (
                            <button
                              key={type}
                              onClick={() => setUpdateType(type)}
                              className={`px-3 py-1 text-xs rounded-full capitalize transition-colors ${
                                updateType === type
                                  ? updateTypeConfig[type].color
                                  : "bg-slate-700 text-slate-400 hover:bg-slate-600"
                              }`}
                            >
                              {type}
                            </button>
                          )
                        )}
                      </div>
                      <Button
                        onClick={handleAddUpdate}
                        disabled={!newUpdate.trim()}
                        size="sm"
                        className="bg-cyan-600 hover:bg-cyan-500"
                      >
                        Post Update
                      </Button>
                    </div>
                  </Card>

                  {/* Updates List */}
                  <div className="space-y-3">
                    {project.updates.map((update) => (
                      <UpdateCard key={update._id} update={update} />
                    ))}
                    {project.updates.length === 0 && (
                      <div className="text-center py-8 text-slate-500">
                        <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-50" />
                        <p>No updates yet</p>
                      </div>
                    )}
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="details" className="mt-0">
                <Card className="p-4 bg-slate-800 border-slate-700">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-slate-500 mb-1">Start Date</p>
                      <p className="text-sm text-slate-200">
                        {formatDate(project.startDate)}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 mb-1">Target Date</p>
                      <p className={`text-sm ${isOverdue ? "text-red-400" : "text-slate-200"}`}>
                        {project.targetDate
                          ? formatDate(project.targetDate)
                          : "Not set"}
                      </p>
                    </div>
                    {project.completedAt && (
                      <div>
                        <p className="text-xs text-slate-500 mb-1">Completed</p>
                        <p className="text-sm text-emerald-400">
                          {formatDate(project.completedAt)}
                        </p>
                      </div>
                    )}
                    <div>
                      <p className="text-xs text-slate-500 mb-1">Tasks</p>
                      <p className="text-sm text-slate-200">
                        {project.tasks.filter((t) => t.status === "done").length} /{" "}
                        {project.tasks.length} completed
                      </p>
                    </div>
                  </div>

                  {project.tags.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-slate-700">
                      <p className="text-xs text-slate-500 mb-2">Tags</p>
                      <div className="flex gap-2 flex-wrap">
                        {project.tags.map((tag) => (
                          <Badge
                            key={tag}
                            variant="outline"
                            className="border-slate-600 text-slate-400"
                          >
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Sidebar */}
          <div className="lg:w-72 p-6 border-t lg:border-t-0 lg:border-l border-slate-800 bg-slate-900/50">
            <h4 className="text-sm font-medium text-slate-400 mb-4">Team</h4>

            {/* Owner */}
            <div className="mb-4">
              <p className="text-xs text-slate-500 mb-2">Owner</p>
              <div className="flex items-center gap-3 p-2 rounded-lg bg-slate-800/50 border border-slate-700/50">
                {project.ownerInfo?.avatar ? (
                  <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center text-lg">
                    {project.ownerInfo.avatar}
                  </div>
                ) : (
                  <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center">
                    <User className="w-5 h-5 text-slate-500" />
                  </div>
                )}
                <div>
                  <p className="text-sm font-medium text-slate-200">
                    {project.ownerInfo?.name || "Unknown"}
                  </p>
                  <p className="text-xs text-slate-500 capitalize">
                    {project.ownerInfo?.role?.replace("-", " ")}
                  </p>
                </div>
              </div>
            </div>

            {/* Team Members */}
            {project.teamInfo.length > 0 && (
              <div className="mb-4">
                <p className="text-xs text-slate-500 mb-2">
                  Team Members ({project.teamInfo.length})
                </p>
                <div className="space-y-2">
                  {project.teamInfo.map((member) => (
                    <div
                      key={member.id}
                      className="flex items-center gap-3 p-2 rounded-lg bg-slate-800/30 border border-slate-700/30"
                    >
                      {member.avatar ? (
                        <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-sm">
                          {member.avatar}
                        </div>
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center">
                          <User className="w-4 h-4 text-slate-500" />
                        </div>
                      )}
                      <p className="text-sm text-slate-300">{member.name}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Quick Stats */}
            <div className="mt-6 pt-6 border-t border-slate-800">
              <h4 className="text-sm font-medium text-slate-400 mb-4">Quick Stats</h4>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-500">To Do</span>
                  <span className="text-sm text-slate-300">
                    {project.tasks.filter((t) => t.status === "todo").length}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-500">In Progress</span>
                  <span className="text-sm text-amber-400">
                    {project.tasks.filter((t) => t.status === "in-progress").length}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-500">In Review</span>
                  <span className="text-sm text-violet-400">
                    {project.tasks.filter((t) => t.status === "review").length}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-500">Done</span>
                  <span className="text-sm text-emerald-400">
                    {project.tasks.filter((t) => t.status === "done").length}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
