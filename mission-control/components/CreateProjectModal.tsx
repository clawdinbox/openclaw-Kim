"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  Folder,
  Users,
  Target,
  Calendar,
  Sparkles,
  Check,
  ArrowRight,
  FileText,
  Rocket,
  Search,
  Wrench,
  TrendingUp,
  ClipboardList,
} from "lucide-react";
import { Id } from "@/convex/_generated/dataModel";

interface Agent {
  _id: Id<"agents">;
  name: string;
  displayName: string;
  avatar?: string;
  role: string;
  department: string;
}

interface Template {
  _id: Id<"projectTemplates">;
  name: string;
  description: string;
  folder: string;
  defaultTasks: {
    title: string;
    description: string;
    priority: "p0" | "p1" | "p2";
    estimatedHours?: number;
    assigneeRole: string;
  }[];
}

const folders = [
  { name: "Content", icon: FileText, color: "text-pink-400", bg: "bg-pink-500/10" },
  { name: "Product", icon: Rocket, color: "text-purple-400", bg: "bg-purple-500/10" },
  { name: "Research", icon: Search, color: "text-cyan-400", bg: "bg-cyan-500/10" },
  { name: "Operations", icon: Wrench, color: "text-slate-400", bg: "bg-slate-500/10" },
  { name: "Revenue", icon: TrendingUp, color: "text-emerald-400", bg: "bg-emerald-500/10" },
];

const priorities = [
  { value: "p0", label: "P0 - Critical", color: "bg-red-500 text-white" },
  { value: "p1", label: "P1 - High", color: "bg-amber-500 text-white" },
  { value: "p2", label: "P2 - Normal", color: "bg-blue-500 text-white" },
];

function TemplateCard({
  template,
  isSelected,
  onClick,
}: {
  template: Template;
  isSelected: boolean;
  onClick: () => void;
}) {
  const folderConfig = folders.find((f) => f.name === template.folder);
  const FolderIcon = folderConfig?.icon || FileText;

  return (
    <motion.div
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.99 }}
      onClick={onClick}
    >
      <Card
        className={`p-4 cursor-pointer transition-all ${
          isSelected
            ? "bg-cyan-500/10 border-cyan-500/50 border-2"
            : "bg-slate-800/50 border-slate-700 hover:border-slate-600"
        }`}
      >
        <div className="flex items-start gap-3">
          <div
            className={`p-2 rounded-lg ${
              isSelected ? "bg-cyan-500/20" : folderConfig?.bg || "bg-slate-500/10"
            }`}
          >
            <FolderIcon
              className={`w-5 h-5 ${
                isSelected ? "text-cyan-400" : folderConfig?.color || "text-slate-400"
              }`}
            />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h4 className="font-medium text-slate-200">{template.name}</h4>
              {isSelected && <Check className="w-4 h-4 text-cyan-400" />}
            </div>
            <p className="text-xs text-slate-400 mt-1">{template.description}</p>
            <div className="flex items-center gap-2 mt-2">
              <Badge variant="outline" className="border-slate-700 text-slate-500 text-xs">
                {template.defaultTasks.length} tasks
              </Badge>
              <Badge variant="outline" className="border-slate-700 text-slate-500 text-xs">
                {template.folder}
              </Badge>
            </div>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}

function AgentSelector({
  agents,
  selected,
  onSelect,
}: {
  agents: Agent[];
  selected: Id<"agents">[];
  onSelect: (ids: Id<"agents">[]) => void;
}) {
  const toggleAgent = (id: Id<"agents">) => {
    if (selected.includes(id)) {
      onSelect(selected.filter((sid) => sid !== id));
    } else {
      onSelect([...selected, id]);
    }
  };

  const byDepartment = agents.reduce((acc, agent) => {
    if (!acc[agent.department]) acc[agent.department] = [];
    acc[agent.department].push(agent);
    return acc;
  }, {} as Record<string, Agent[]>);

  return (
    <div className="space-y-4">
      {Object.entries(byDepartment).map(([dept, deptAgents]) => (
        <div key={dept}>
          <h5 className="text-xs font-medium text-slate-500 uppercase mb-2 capitalize">
            {dept}
          </h5>
          <div className="grid grid-cols-2 gap-2">
            {deptAgents.map((agent) => (
              <button
                key={agent._id}
                onClick={() => toggleAgent(agent._id)}
                className={`flex items-center gap-2 p-2 rounded-lg border text-left transition-all ${
                  selected.includes(agent._id)
                    ? "bg-cyan-500/10 border-cyan-500/50"
                    : "bg-slate-800/30 border-slate-700 hover:border-slate-600"
                }`}
              >
                <Checkbox checked={selected.includes(agent._id)} />
                <div className="w-6 h-6 rounded-full bg-slate-700 flex items-center justify-center text-xs flex-shrink-0">
                  {agent.avatar || "👤"}
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-medium text-slate-200 truncate">
                    {agent.displayName}
                  </p>
                  <p className="text-[10px] text-slate-500 truncate capitalize">
                    {agent.role.replace("-", " ")}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

export function CreateProjectModal() {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(1);

  // Form state
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [folder, setFolder] = useState("");
  const [priority, setPriority] = useState<"p0" | "p1" | "p2">("p1");
  const [owner, setOwner] = useState<Id<"agents"> | "">("");
  const [team, setTeam] = useState<Id<"agents">[]>([]);
  const [targetDate, setTargetDate] = useState("");
  const [selectedTemplate, setSelectedTemplate] = useState<string>("");
  const [tags, setTags] = useState<string[]>([]);

  const agents = useQuery(api.agents.list);
  const templates = useQuery(api.projectTemplates.list);
  const createProject = useMutation(api.projects.create);

  const resetForm = () => {
    setName("");
    setDescription("");
    setFolder("");
    setPriority("p1");
    setOwner("");
    setTeam([]);
    setTargetDate("");
    setSelectedTemplate("");
    setTags([]);
    setStep(1);
  };

  const handleCreate = async () => {
    if (!name || !folder || !owner) return;

    const targetTimestamp = targetDate
      ? new Date(targetDate).getTime()
      : undefined;

    await createProject({
      name,
      description,
      priority,
      owner,
      team,
      folder,
      targetDate: targetTimestamp,
      tags,
      template: selectedTemplate || undefined,
    });

    setOpen(false);
    resetForm();
  };

  const canProceed = () => {
    switch (step) {
      case 1:
        return name && description && folder;
      case 2:
        return owner;
      default:
        return true;
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-cyan-600 hover:bg-cyan-500">
          <Plus className="w-4 h-4 mr-1" />
          New Project
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-3xl bg-slate-900 border-slate-700 text-slate-100 max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-cyan-400" />
            Create New Project
          </DialogTitle>
        </DialogHeader>

        {/* Progress Steps */}
        <div className="flex items-center gap-2 mb-4">
          {[1, 2, 3].map((s) => (
            <div
              key={s}
              className={`flex items-center gap-2 ${
                s < step ? "text-cyan-400" : s === step ? "text-slate-200" : "text-slate-600"
              }`}
            >
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${
                  s < step
                    ? "bg-cyan-500 text-white"
                    : s === step
                    ? "bg-slate-700 text-slate-200"
                    : "bg-slate-800 text-slate-600"
                }`}
              >
                {s < step ? <Check className="w-3 h-3" /> : s}
              </div>
              <span className="text-xs hidden sm:block">
                {s === 1 ? "Details" : s === 2 ? "Team" : "Template"}
              </span>
              {s < 3 && <ArrowRight className="w-3 h-3 mx-1" />}
            </div>
          ))}
        </div>

        <ScrollArea className="max-h-[60vh]">
          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4"
              >
                <div>
                  <Label className="text-slate-400">Project Name</Label>
                  <Input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g., Q1 Content Campaign"
                    className="bg-slate-800 border-slate-700 text-slate-100"
                  />
                </div>

                <div>
                  <Label className="text-slate-400">Description</Label>
                  <Textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="What is this project about?"
                    className="bg-slate-800 border-slate-700 text-slate-100"
                    rows={3}
                  />
                </div>

                <div>
                  <Label className="text-slate-400 mb-2 block">Folder</Label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {folders.map((f) => {
                      const Icon = f.icon;
                      return (
                        <button
                          key={f.name}
                          onClick={() => setFolder(f.name)}
                          className={`flex items-center gap-2 p-3 rounded-lg border transition-all ${
                            folder === f.name
                              ? `${f.bg} border-${f.color.split("-")[1]}-500/50`
                              : "bg-slate-800/30 border-slate-700 hover:border-slate-600"
                          }`}
                        >
                          <Icon
                            className={`w-4 h-4 ${
                              folder === f.name ? f.color : "text-slate-500"
                            }`}
                          />
                          <span
                            className={`text-sm ${
                              folder === f.name ? "text-slate-200" : "text-slate-400"
                            }`}
                          >
                            {f.name}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <Label className="text-slate-400 mb-2 block">Priority</Label>
                  <div className="flex gap-2">
                    {priorities.map((p) => (
                      <button
                        key={p.value}
                        onClick={() => setPriority(p.value as "p0" | "p1" | "p2")}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                          priority === p.value
                            ? p.color
                            : "bg-slate-800 text-slate-400 hover:bg-slate-700"
                        }`}
                      >
                        {p.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <Label className="text-slate-400">Target Date (Optional)</Label>
                  <Input
                    type="date"
                    value={targetDate}
                    onChange={(e) => setTargetDate(e.target.value)}
                    className="bg-slate-800 border-slate-700 text-slate-100"
                  />
                </div>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4"
              >
                <div>
                  <Label className="text-slate-400">Project Owner</Label>
                  <Select
                    value={owner}
                    onValueChange={(v) => setOwner(v as Id<"agents">)}
                  >
                    <SelectTrigger className="bg-slate-800 border-slate-700">
                      <SelectValue placeholder="Select owner" />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-800 border-slate-700">
                      {agents?.map((agent) => (
                        <SelectItem key={agent._id} value={agent._id}>
                          <div className="flex items-center gap-2">
                            <span>{agent.avatar || "👤"}</span>
                            <span>{agent.displayName}</span>
                            <span className="text-slate-500 text-xs capitalize">
                              ({agent.role.replace("-", " ")})
                            </span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-slate-400 mb-2 block">Team Members</Label>
                  {agents && (
                    <AgentSelector
                      agents={agents}
                      selected={team}
                      onSelect={setTeam}
                    />
                  )}
                </div>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4"
              >
                <p className="text-sm text-slate-400">
                  Choose a template to auto-create tasks, or start from scratch.
                </p>

                <div
                  className={`p-4 rounded-lg border cursor-pointer transition-all ${
                    selectedTemplate === ""
                      ? "bg-cyan-500/10 border-cyan-500/50"
                      : "bg-slate-800/50 border-slate-700 hover:border-slate-600"
                  }`}
                  onClick={() => setSelectedTemplate("")}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`p-2 rounded-lg ${
                        selectedTemplate === "" ? "bg-cyan-500/20" : "bg-slate-700"
                      }`}
                    >
                      <ClipboardList
                        className={`w-5 h-5 ${
                          selectedTemplate === "" ? "text-cyan-400" : "text-slate-400"
                        }`}
                      />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium text-slate-200">Start from Scratch</h4>
                        {selectedTemplate === "" && <Check className="w-4 h-4 text-cyan-400" />}
                      </div>
                      <p className="text-xs text-slate-400">Create a blank project</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-slate-300">Templates</h4>
                  {templates?.map((template) => (
                    <TemplateCard
                      key={template._id}
                      template={template}
                      isSelected={selectedTemplate === template.name}
                      onClick={() => setSelectedTemplate(template.name)}
                    />
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </ScrollArea>

        {/* Footer */}
        <div className="flex justify-between pt-4 border-t border-slate-800">
          <Button
            variant="outline"
            onClick={() => {
              if (step > 1) setStep(step - 1);
              else {
                setOpen(false);
                resetForm();
              }
            }}
            className="border-slate-600"
          >
            {step === 1 ? "Cancel" : "Back"}
          </Button>

          <Button
            onClick={() => {
              if (step < 3) setStep(step + 1);
              else handleCreate();
            }}
            disabled={!canProceed()}
            className="bg-cyan-600 hover:bg-cyan-500"
          >
            {step === 3 ? "Create Project" : "Next"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
