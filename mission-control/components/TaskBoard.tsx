"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  Clock,
  CheckCircle2,
  AlertCircle,
  MoreHorizontal,
  Calendar,
  User,
  ArrowRight,
  Link2,
  Timer,
  Trash2,
  GripVertical,
} from "lucide-react";
import { Id } from "@/convex/_generated/dataModel";

type TaskStatus = "todo" | "in-progress" | "review" | "done";
type TaskPriority = "p0" | "p1" | "p2";

interface Task {
  _id: Id<"projectTasks">;
  projectId: Id<"projects">;
  title: string;
  description: string;
  assignedTo: Id<"agents">;
  status: TaskStatus;
  priority: TaskPriority;
  dependencies: Id<"projectTasks">[];
  estimatedHours?: number;
  actualHours?: number;
  createdAt: number;
  startedAt?: number;
  completedAt?: number;
  order: number;
  assigneeInfo: {
    id: Id<"agents">;
    name: string;
    avatar?: string;
    role?: string;
  } | null;
  dependenciesInfo: {
    id: Id<"projectTasks">;
    title: string;
    status: TaskStatus;
  }[];
}

interface TaskBoardProps {
  projectId: Id<"projects">;
  tasks: Task[];
}

const columns: { id: TaskStatus; label: string; color: string }[] = [
  { id: "todo", label: "To Do", color: "bg-slate-700" },
  { id: "in-progress", label: "In Progress", color: "bg-amber-600" },
  { id: "review", label: "Review", color: "bg-violet-600" },
  { id: "done", label: "Done", color: "bg-emerald-600" },
];

const priorityConfig = {
  p0: { label: "P0", color: "bg-red-500 text-white" },
  p1: { label: "P1", color: "bg-amber-500 text-white" },
  p2: { label: "P2", color: "bg-blue-500 text-white" },
};

function TaskCard({
  task,
  onClick,
  onStatusChange,
}: {
  task: Task;
  onClick: (task: Task) => void;
  onStatusChange: (taskId: Id<"projectTasks">, status: TaskStatus) => void;
}) {
  const priority = priorityConfig[task.priority];
  const isBlocked = task.dependenciesInfo.some(
    (dep) => dep.status !== "done"
  );

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      whileHover={{ y: -2 }}
      className="group"
    >
      <Card
        className={`p-3 bg-slate-800 border-slate-700 hover:border-slate-600 cursor-pointer transition-all ${
          isBlocked ? "opacity-60" : ""
        }`}
        onClick={() => onClick(task)}
      >
        <div className="flex items-start gap-2">
          <div className="pt-1">
            <GripVertical className="w-4 h-4 text-slate-600 opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <Badge className={`${priority.color} text-xs font-mono`}>
                {priority.label}
              </Badge>
              {isBlocked && (
                <Badge className="bg-red-500/20 text-red-400 text-xs border border-red-500/30">
                  <Link2 className="w-3 h-3 mr-1" />
                  Blocked
                </Badge>
              )}
            </div>

            <h4 className="text-sm font-medium text-slate-200 mb-1 line-clamp-2">
              {task.title}
            </h4>
            <p className="text-xs text-slate-500 line-clamp-2 mb-3">
              {task.description}
            </p>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {task.assigneeInfo?.avatar ? (
                  <div className="w-6 h-6 rounded-full bg-slate-700 flex items-center justify-center text-xs">
                    {task.assigneeInfo.avatar}
                  </div>
                ) : (
                  <div className="w-6 h-6 rounded-full bg-slate-700 flex items-center justify-center">
                    <User className="w-3 h-3 text-slate-500" />
                  </div>
                )}
                {task.estimatedHours && (
                  <span className="text-xs text-slate-500 flex items-center gap-1">
                    <Timer className="w-3 h-3" />
                    {task.estimatedHours}h
                  </span>
                )}
              </div>

              {/* Quick Status Change */}
              <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                <select
                  value={task.status}
                  onChange={(e) =>
                    onStatusChange(task._id, e.target.value as TaskStatus)
                  }
                  onClick={(e) => e.stopPropagation()}
                  className="text-xs bg-slate-700 border-slate-600 rounded px-2 py-1 text-slate-300"
                >
                  {columns.map((col) => (
                    <option key={col.id} value={col.id}>
                      {col.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}

function CreateTaskDialog({
  projectId,
  onTaskCreated,
}: {
  projectId: Id<"projects">;
  onTaskCreated: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<TaskPriority>("p1");
  const [estimatedHours, setEstimatedHours] = useState<string>("");

  const createTask = useMutation(api.projectTasks.create);

  const handleCreate = async () => {
    if (!title) return;

    await createTask({
      projectId,
      title,
      description,
      assignedTo: projectId, // Will be reassigned later
      priority,
      estimatedHours: estimatedHours ? parseFloat(estimatedHours) : undefined,
    });

    setOpen(false);
    setTitle("");
    setDescription("");
    setPriority("p1");
    setEstimatedHours("");
    onTaskCreated();
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="border-slate-700 text-slate-400 hover:text-slate-200"
        >
          <Plus className="w-4 h-4 mr-1" />
          Add Task
        </Button>
      </DialogTrigger>

      <DialogContent className="bg-slate-900 border-slate-700 text-slate-100">
        <DialogHeader>
          <DialogTitle>Create New Task</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <label className="text-xs text-slate-400">Title</label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Task title"
              className="bg-slate-800 border-slate-700 text-slate-100"
            />
          </div>

          <div>
            <label className="text-xs text-slate-400">Description</label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Task description"
              className="bg-slate-800 border-slate-700 text-slate-100"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-slate-400">Priority</label>
              <Select
                value={priority}
                onValueChange={(v) => setPriority(v as TaskPriority)}
              >
                <SelectTrigger className="bg-slate-800 border-slate-700">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-700">
                  <SelectItem value="p0">P0 - Critical</SelectItem>
                  <SelectItem value="p1">P1 - High</SelectItem>
                  <SelectItem value="p2">P2 - Normal</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-xs text-slate-400">Estimated Hours</label>
              <Input
                type="number"
                value={estimatedHours}
                onChange={(e) => setEstimatedHours(e.target.value)}
                placeholder="e.g., 4"
                className="bg-slate-800 border-slate-700 text-slate-100"
              />
            </div>
          </div>

          <Button
            onClick={handleCreate}
            disabled={!title}
            className="w-full bg-cyan-600 hover:bg-cyan-500"
          >
            Create Task
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function TaskDetailDialog({
  task,
  open,
  onClose,
  allTasks,
}: {
  task: Task | null;
  open: boolean;
  onClose: () => void;
  allTasks: Task[];
}) {
  const updateTask = useMutation(api.projectTasks.update);
  const updateStatus = useMutation(api.projectTasks.updateStatus);
  const assignTask = useMutation(api.projectTasks.assign);
  const deleteTask = useMutation(api.projectTasks.deleteTask);

  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editPriority, setEditPriority] = useState<TaskPriority>("p1");

  if (!task) return null;

  const handleSave = async () => {
    await updateTask({
      id: task._id,
      title: editTitle,
      description: editDescription,
      priority: editPriority,
    });
    setIsEditing(false);
  };

  const handleDelete = async () => {
    if (confirm("Are you sure you want to delete this task?")) {
      await deleteTask({ id: task._id });
      onClose();
    }
  };

  const formatDate = (timestamp?: number) => {
    if (!timestamp) return "N/A";
    return new Date(timestamp).toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg bg-slate-900 border-slate-700 text-slate-100">
        <DialogHeader>
          <div className="flex items-start justify-between">
            {isEditing ? (
              <div className="flex-1 mr-4">
                <Input
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="bg-slate-800 border-slate-700 text-slate-100 mb-2"
                />
                <Select
                  value={editPriority}
                  onValueChange={(v) => setEditPriority(v as TaskPriority)}
                >
                  <SelectTrigger className="bg-slate-800 border-slate-700">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-700">
                    <SelectItem value="p0">P0 - Critical</SelectItem>
                    <SelectItem value="p1">P1 - High</SelectItem>
                    <SelectItem value="p2">P2 - Normal</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            ) : (
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <Badge className={priorityConfig[task.priority].color}>
                    {priorityConfig[task.priority].label}
                  </Badge>
                  <Badge
                    className={
                      columns.find((c) => c.id === task.status)?.color || "bg-slate-700"
                    }
                  >
                    {columns.find((c) => c.id === task.status)?.label}
                  </Badge>
                </div>
                <DialogTitle className="text-xl font-bold text-slate-100">
                  {task.title}
                </DialogTitle>
              </div>
            )}

            <div className="flex gap-2">
              {isEditing ? (
                <>
                  <Button size="sm" onClick={handleSave} className="bg-cyan-600">
                    Save
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setIsEditing(false)}
                    className="border-slate-600"
                  >
                    Cancel
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setEditTitle(task.title);
                      setEditDescription(task.description);
                      setEditPriority(task.priority);
                      setIsEditing(true);
                    }}
                    className="border-slate-600"
                  >
                    Edit
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleDelete}
                    className="border-red-800 text-red-400 hover:bg-red-900/20"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </>
              )}
            </div>
          </div>
        </DialogHeader>

        <ScrollArea className="max-h-[60vh]">
          <div className="space-y-4">
            {isEditing ? (
              <Textarea
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
                className="bg-slate-800 border-slate-700 text-slate-100"
                rows={4}
              />
            ) : (
              <p className="text-slate-300">{task.description}</p>
            )}

            {/* Assignee */}
            <Card className="p-3 bg-slate-800 border-slate-700">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {task.assigneeInfo?.avatar ? (
                    <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center text-lg">
                      {task.assigneeInfo.avatar}
                    </div>
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center">
                      <User className="w-5 h-5 text-slate-500" />
                    </div>
                  )}
                  <div>
                    <p className="text-xs text-slate-500">Assigned to</p>
                    <p className="text-sm font-medium text-slate-200">
                      {task.assigneeInfo?.name || "Unassigned"}
                    </p>
                    <p className="text-xs text-slate-500 capitalize">
                      {task.assigneeInfo?.role?.replace("-", " ")}
                    </p>
                  </div>
                </div>
              </div>
            </Card>

            {/* Dependencies */}
            {task.dependenciesInfo.length > 0 && (
              <div>
                <p className="text-xs text-slate-500 mb-2">Dependencies</p>
                <div className="space-y-2">
                  {task.dependenciesInfo.map((dep) => (
                    <div
                      key={dep.id}
                      className={`flex items-center gap-2 p-2 rounded border ${
                        dep.status === "done"
                          ? "bg-emerald-500/10 border-emerald-500/30"
                          : "bg-slate-800/50 border-slate-700"
                      }`}
                    >
                      <Link2 className="w-4 h-4 text-slate-500" />
                      <span className="text-sm text-slate-300">{dep.title}</span>
                      {dep.status === "done" && (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 ml-auto" />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Time Tracking */}
            <div className="grid grid-cols-2 gap-4">
              <Card className="p-3 bg-slate-800 border-slate-700">
                <p className="text-xs text-slate-500 mb-1">Estimated Hours</p>
                <p className="text-lg font-medium text-slate-200">
                  {task.estimatedHours || "-"}
                </p>
              </Card>
              <Card className="p-3 bg-slate-800 border-slate-700">
                <p className="text-xs text-slate-500 mb-1">Actual Hours</p>
                <p className="text-lg font-medium text-slate-200">
                  {task.actualHours || "-"}
                </p>
              </Card>
            </div>

            {/* Dates */}
            <div className="grid grid-cols-3 gap-2 text-xs text-slate-500">
              <div>
                <p className="mb-1">Created</p>
                <p className="text-slate-300">{formatDate(task.createdAt)}</p>
              </div>
              <div>
                <p className="mb-1">Started</p>
                <p className="text-slate-300">{formatDate(task.startedAt)}</p>
              </div>
              <div>
                <p className="mb-1">Completed</p>
                <p className="text-slate-300">{formatDate(task.completedAt)}</p>
              </div>
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}

export function TaskBoard({ projectId, tasks }: TaskBoardProps) {
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const updateStatus = useMutation(api.projectTasks.updateStatus);

  const handleStatusChange = async (
    taskId: Id<"projectTasks">,
    status: TaskStatus
  ) => {
    await updateStatus({ id: taskId, status });
  };

  const tasksByColumn = columns.reduce((acc, col) => {
    acc[col.id] = tasks
      .filter((t) => t.status === col.id)
      .sort((a, b) => a.order - b.order);
    return acc;
  }, {} as Record<TaskStatus, Task[]>);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-slate-400">
          {tasks.length} task{tasks.length !== 1 ? "s" : ""}
        </h3>
        <CreateTaskDialog
          projectId={projectId}
          onTaskCreated={() => {}}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {columns.map((column) => (
          <div key={column.id} className="flex flex-col">
            <div
              className={`flex items-center justify-between p-2 rounded-t-lg ${column.color}`}
            >
              <span className="text-sm font-medium">{column.label}</span>
              <Badge
                variant="secondary"
                className="bg-black/20 text-white border-0"
              >
                {tasksByColumn[column.id].length}
              </Badge>
            </div>

            <div className="flex-1 bg-slate-800/30 rounded-b-lg p-2 space-y-2 min-h-[200px]">
              <AnimatePresence mode="popLayout">
                {tasksByColumn[column.id].map((task) => (
                  <TaskCard
                    key={task._id}
                    task={task}
                    onClick={setSelectedTask}
                    onStatusChange={handleStatusChange}
                  />
                ))}
              </AnimatePresence>

              {tasksByColumn[column.id].length === 0 && (
                <div className="text-center py-8 text-slate-600 text-sm">
                  No tasks
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      <TaskDetailDialog
        task={selectedTask}
        open={!!selectedTask}
        onClose={() => setSelectedTask(null)}
        allTasks={tasks}
      />
    </div>
  );
}
