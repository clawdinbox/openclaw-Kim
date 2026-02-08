"use client";

import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { motion } from "framer-motion";
import {
  Folder,
  FolderOpen,
  ChevronRight,
  FileText,
  TrendingUp,
  Clock,
  CheckCircle2,
} from "lucide-react";
import { Id } from "@/convex/_generated/dataModel";

type ProjectStatus = "planning" | "active" | "on-hold" | "completed" | "cancelled";

interface Project {
  _id: Id<"projects">;
  name: string;
  description: string;
  status: ProjectStatus;
  progress: number;
  folder: string;
  taskCounts: {
    total: number;
    done: number;
  };
}

interface FolderData {
  name: string;
  count: number;
  activeCount: number;
}

const folderIcons: Record<string, string> = {
  Content: "📝",
  Product: "🚀",
  Research: "🔬",
  Operations: "⚙️",
  Revenue: "💰",
};

const folderColors: Record<string, { bg: string; border: string; text: string }> = {
  Content: {
    bg: "bg-pink-500/10",
    border: "border-pink-500/30",
    text: "text-pink-400",
  },
  Product: {
    bg: "bg-purple-500/10",
    border: "border-purple-500/30",
    text: "text-purple-400",
  },
  Research: {
    bg: "bg-cyan-500/10",
    border: "border-cyan-500/30",
    text: "text-cyan-400",
  },
  Operations: {
    bg: "bg-slate-500/10",
    border: "border-slate-500/30",
    text: "text-slate-400",
  },
  Revenue: {
    bg: "bg-emerald-500/10",
    border: "border-emerald-500/30",
    text: "text-emerald-400",
  },
};

const statusConfig = {
  planning: { label: "Planning", color: "bg-slate-600" },
  active: { label: "Active", color: "bg-cyan-600" },
  "on-hold": { label: "On Hold", color: "bg-amber-600" },
  completed: { label: "Completed", color: "bg-emerald-600" },
  cancelled: { label: "Cancelled", color: "bg-slate-700" },
};

function FolderCard({
  folder,
  isSelected,
  onClick,
}: {
  folder: FolderData;
  isSelected: boolean;
  onClick: () => void;
}) {
  const colors = folderColors[folder.name] || {
    bg: "bg-slate-500/10",
    border: "border-slate-500/30",
    text: "text-slate-400",
  };
  const icon = folderIcons[folder.name] || "📁";

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
    >
      <Card
        className={`p-4 cursor-pointer transition-all ${
          isSelected
            ? `${colors.bg} ${colors.border} border-2`
            : "bg-slate-800/50 border-slate-700 hover:border-slate-600"
        }`}
      >
        <div className="flex items-center gap-3">
          <div className={`text-2xl ${isSelected ? "scale-110" : ""} transition-transform`}>
            {icon}
          </div>
          <div className="flex-1">
            <h3 className={`font-medium ${isSelected ? colors.text : "text-slate-200"}`}>
              {folder.name}
            </h3>
            <p className="text-xs text-slate-500">
              {folder.count} project{folder.count !== 1 ? "s" : ""} · {folder.activeCount} active
            </p>
          </div>
          <ChevronRight
            className={`w-5 h-5 transition-transform ${
              isSelected ? "rotate-90" : ""
            } ${isSelected ? colors.text : "text-slate-500"}`}
          />
        </div>
      </Card>
    </motion.div>
  );
}

function ProjectListItem({
  project,
  onClick,
}: {
  project: Project;
  onClick: (project: Project) => void;
}) {
  const status = statusConfig[project.status];

  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      onClick={() => onClick(project)}
    >
      <Card className="p-4 bg-slate-800/30 border-slate-700/50 hover:border-slate-600 cursor-pointer transition-all group">
        <div className="flex items-center justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <div className={`w-2 h-2 rounded-full ${status.color}`} />
              <h4 className="font-medium text-slate-200 group-hover:text-cyan-400 transition-colors truncate">
                {project.name}
              </h4>
            </div>
            <p className="text-xs text-slate-500 line-clamp-1">{project.description}</p>
          </div>

          <div className="flex items-center gap-4 flex-shrink-0">
            <div className="text-right">
              <p className="text-xs text-slate-500">
                {project.taskCounts.done}/{project.taskCounts.total} tasks
              </p>
            </div>
            <div className="w-24">
              <Progress
                value={project.progress}
                className="h-1.5 bg-slate-700"
              />
            </div>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}

export function ProjectFolders({
  onProjectClick,
}: {
  onProjectClick: (project: Project) => void;
}) {
  const folders = useQuery(api.projects.getFolders);
  const allProjects = useQuery(api.projects.list, {});
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null);

  const filteredProjects = selectedFolder
    ? allProjects?.filter((p) => p.folder === selectedFolder)
    : allProjects;

  const groupedByFolder = filteredProjects?.reduce((acc, project) => {
    if (!acc[project.folder]) acc[project.folder] = [];
    acc[project.folder].push(project);
    return acc;
  }, {} as Record<string, typeof allProjects>);

  return (
    <div className="flex flex-col lg:flex-row gap-6">
      {/* Folders Sidebar */}
      <div className="lg:w-64 space-y-3">
        <div className="flex items-center gap-2 mb-4">
          <Folder className="w-5 h-5 text-slate-400" />
          <h3 className="font-medium text-slate-200">Folders</h3>
        </div>

        {/* All Projects */}
        <FolderCard
          folder={{ name: "All", count: allProjects?.length || 0, activeCount: 0 }}
          isSelected={selectedFolder === null}
          onClick={() => setSelectedFolder(null)}
        />

        {/* Individual Folders */}
        {folders?.map((folder) => (
          <FolderCard
            key={folder.name}
            folder={folder}
            isSelected={selectedFolder === folder.name}
            onClick={() => setSelectedFolder(folder.name)}
          />
        ))}
      </div>

      {/* Projects List */}
      <div className="flex-1">
        {selectedFolder === null ? (
          // Show all projects grouped by folder
          <div className="space-y-6">
            {groupedByFolder &&
              Object.entries(groupedByFolder).map(([folderName, projects]) => (
                <div key={folderName}>
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-lg">{folderIcons[folderName] || "📁"}</span>
                    <h3 className="font-medium text-slate-200">{folderName}</h3>
                    <Badge variant="outline" className="border-slate-700 text-slate-500">
                      {projects?.length}
                    </Badge>
                  </div>
                  <div className="space-y-2">
                    {projects?.map((project) => (
                      <ProjectListItem
                        key={project._id}
                        project={project as Project}
                        onClick={onProjectClick}
                      />
                    ))}
                  </div>
                </div>
              ))}
          </div>
        ) : (
          // Show only selected folder
          <div>
            <div className="flex items-center gap-2 mb-4">
              <span className="text-2xl">{folderIcons[selectedFolder] || "📁"}</span>
              <h3 className="text-lg font-medium text-slate-200">{selectedFolder}</h3>
              <Badge variant="outline" className="border-slate-700 text-slate-500">
                {filteredProjects?.length}
              </Badge>
            </div>
            <div className="space-y-2">
              {filteredProjects?.map((project) => (
                <ProjectListItem
                  key={project._id}
                  project={project as Project}
                  onClick={onProjectClick}
                />
              ))}
              {filteredProjects?.length === 0 && (
                <div className="text-center py-8 text-slate-500">
                  <FolderOpen className="w-10 h-10 mx-auto mb-2 opacity-50" />
                  <p>No projects in this folder</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
