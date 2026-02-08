"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
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
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Plus, Calendar, Clock } from "lucide-react";
import { motion } from "framer-motion";

const roleOptions = [
  { value: "senior-analyst", label: "Senior Research Analyst", icon: "📊" },
  { value: "research-associate", label: "Research Associate", icon: "🔍" },
  { value: "cmo", label: "CMO Social", icon: "📢" },
  { value: "engineer", label: "Lead Software Engineer", icon: "⚡" },
];

const priorityOptions = [
  { value: "p0", label: "P0 - Critical", color: "text-red-400" },
  { value: "p1", label: "P1 - High", color: "text-amber-400" },
  { value: "p2", label: "P2 - Normal", color: "text-blue-400" },
];

const categoryOptions = [
  "Research",
  "Analysis",
  "Content",
  "Development",
  "Strategy",
  "Data Collection",
  "Integration",
  "Other",
];

interface TaskCreationFormProps {
  defaultAssignee?: string;
  onSuccess?: () => void;
  triggerButton?: React.ReactNode;
}

export function TaskCreationForm({
  defaultAssignee,
  onSuccess,
  triggerButton,
}: TaskCreationFormProps) {
  const createTask = useMutation(api.tasks.create);
  
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [assignedTo, setAssignedTo] = useState(defaultAssignee || "");
  const [priority, setPriority] = useState<"p0" | "p1" | "p2">("p1");
  const [category, setCategory] = useState("");
  const [dueDays, setDueDays] = useState<string>("1");
  const [context, setContext] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim() || !assignedTo) return;

    setIsSubmitting(true);

    const dueAt = dueDays 
      ? Date.now() + parseInt(dueDays) * 24 * 60 * 60 * 1000 
      : undefined;

    await createTask({
      title: title.trim(),
      description: description.trim(),
      assignedTo,
      delegatedBy: "cso",
      priority,
      category: category || undefined,
      dueAt,
      context: context.trim() || undefined,
    });

    setIsSubmitting(false);
    setOpen(false);
    
    // Reset form
    setTitle("");
    setDescription("");
    setAssignedTo(defaultAssignee || "");
    setPriority("p1");
    setCategory("");
    setDueDays("1");
    setContext("");

    onSuccess?.();
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {triggerButton || (
          <Button className="bg-cyan-600 hover:bg-cyan-500 text-white">
            <Plus className="w-4 h-4 mr-2" />
            New Task
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-xl bg-slate-900 border-slate-700 text-slate-100 max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Plus className="w-5 h-5 text-cyan-400" />
            Create New Task
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5 mt-4">
          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title" className="text-slate-300">
              Task Title <span className="text-red-400">*</span>
            </Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Analyze Moncler retail expansion"
              className="bg-slate-800 border-slate-700 text-slate-100 placeholder:text-slate-500"
              required
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description" className="text-slate-300">
              Description <span className="text-red-400">*</span>
            </Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Detailed description of what needs to be done..."
              rows={4}
              className="bg-slate-800 border-slate-700 text-slate-100 placeholder:text-slate-500 resize-none"
              required
            />
          </div>

          {/* Assignee & Priority Row */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-slate-300">Assign To <span className="text-red-400">*</span></Label>
              <Select value={assignedTo} onValueChange={setAssignedTo} required>
                <SelectTrigger className="bg-slate-800 border-slate-700 text-slate-100">
                  <SelectValue placeholder="Select agent..." />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-700">
                  {roleOptions.map((role) => (
                    <SelectItem
                      key={role.value}
                      value={role.value}
                      className="text-slate-100 focus:bg-slate-700"
                    >
                      <span className="flex items-center gap-2">
                        <span>{role.icon}</span>
                        <span>{role.label}</span>
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-slate-300">Priority</Label>
              <Select
                value={priority}
                onValueChange={(v: "p0" | "p1" | "p2") => setPriority(v)}
              >
                <SelectTrigger className="bg-slate-800 border-slate-700 text-slate-100">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-700">
                  {priorityOptions.map((p) => (
                    <SelectItem
                      key={p.value}
                      value={p.value}
                      className="text-slate-100 focus:bg-slate-700"
                    >
                      <span className={p.color}>{p.label}</span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Category & Due Date Row */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-slate-300">Category</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger className="bg-slate-800 border-slate-700 text-slate-100">
                  <SelectValue placeholder="Select category..." />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-700">
                  {categoryOptions.map((cat) => (
                    <SelectItem
                      key={cat}
                      value={cat}
                      className="text-slate-100 focus:bg-slate-700"
                    >
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-slate-300">Due In (days)</Label>
              <div className="relative">
                <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <Select value={dueDays} onValueChange={setDueDays}>
                  <SelectTrigger className="bg-slate-800 border-slate-700 text-slate-100 pl-10">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-700">
                    <SelectItem value="0.25" className="text-slate-100">6 hours</SelectItem>
                    <SelectItem value="0.5" className="text-slate-100">12 hours</SelectItem>
                    <SelectItem value="1" className="text-slate-100">1 day</SelectItem>
                    <SelectItem value="2" className="text-slate-100">2 days</SelectItem>
                    <SelectItem value="3" className="text-slate-100">3 days</SelectItem>
                    <SelectItem value="7" className="text-slate-100">1 week</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Context / Additional Info */}
          <div className="space-y-2">
            <Label htmlFor="context" className="text-slate-300">
              Additional Context
            </Label>
            <Textarea
              id="context"
              value={context}
              onChange={(e) => setContext(e.target.value)}
              placeholder="Links, references, or additional context for the agent..."
              rows={3}
              className="bg-slate-800 border-slate-700 text-slate-100 placeholder:text-slate-500 resize-none"
            />
          </div>

          {/* Submit Button */}
          <div className="pt-4 border-t border-slate-800 flex justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              className="border-slate-600 text-slate-300 hover:bg-slate-800"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || !title.trim() || !description.trim() || !assignedTo}
              className="bg-cyan-600 hover:bg-cyan-500 text-white"
            >
              {isSubmitting ? (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full"
                />
              ) : (
                <>
                  <Plus className="w-4 h-4 mr-2" />
                  Create Task
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
