"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Clock, AlertCircle, PlayCircle } from "lucide-react";

export function TaskManager() {
  const tasks = useQuery(api.tasks.list, {});

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "complete": return <CheckCircle2 className="w-4 h-4 text-emerald-500" />;
      case "in-progress": return <PlayCircle className="w-4 h-4 text-amber-500" />;
      case "review": return <Clock className="w-4 h-4 text-violet-500" />;
      default: return <AlertCircle className="w-4 h-4 text-slate-500" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "p0": return "bg-red-600 text-white";
      case "p1": return "bg-amber-500 text-white";
      case "p2": return "bg-blue-500 text-white";
      default: return "bg-slate-600 text-slate-200";
    }
  };

  return (
    <div className="w-full p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-100">Tasks</h2>
          <p className="text-slate-400">Manage and track agent assignments</p>
        </div>
        <Button className="bg-cyan-600 hover:bg-cyan-700">
          <AlertCircle className="w-4 h-4 mr-2" />
          New Task
        </Button>
      </div>

      {/* Task List */}
      <div className="space-y-3">
        {tasks?.map((task) => (
          <Card key={task._id} className="p-4 bg-slate-800/50 border-slate-700 hover:border-slate-600 transition-colors">
            <div className="flex items-start gap-4">
              <div className="mt-1">
                {getStatusIcon(task.status)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <Badge className={`${getPriorityColor(task.priority)} text-xs`}>
                    {task.priority?.toUpperCase()}
                  </Badge>
                  <Badge variant="outline" className="text-xs border-slate-600 text-slate-400">
                    {task.status}
                  </Badge>
                  {task.category && (
                    <Badge variant="outline" className="text-xs border-slate-600 text-slate-400">
                      {task.category}
                    </Badge>
                  )}
                </div>
                <h3 className="font-semibold text-slate-100 mb-1">{task.title}</h3>
                <p className="text-sm text-slate-400 line-clamp-2">{task.description}</p>
                
                <div className="flex items-center gap-4 mt-3 text-xs text-slate-500">
                  <span>Assigned to: <span className="text-slate-300">{task.assignedTo || "Unassigned"}</span></span>
                  <span>Created: {new Date(task.createdAt).toLocaleDateString()}</span>
                  {task.quality && <span>Quality: {task.quality}/5</span>}
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {!tasks && (
        <div className="text-center py-12 text-slate-500">
          <div className="animate-spin w-8 h-8 border-2 border-slate-600 border-t-cyan-500 rounded-full mx-auto mb-4" />
          <p>Loading tasks...</p>
        </div>
      )}

      {tasks?.length === 0 && (
        <div className="text-center py-12 text-slate-500">
          <CheckCircle2 className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p>No tasks found</p>
          <p className="text-sm mt-1">Create your first task to get started</p>
        </div>
      )}
    </div>
  );
}
