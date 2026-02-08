"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Folder, TrendingUp, CheckCircle2, AlertCircle, Clock } from "lucide-react";

export function ProjectsDashboard() {
  const agents = useQuery(api.agents.list);

  return (
    <div className="w-full p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-100">Projects</h2>
          <p className="text-slate-400">16 AI Agents ready for task assignment</p>
        </div>
        <Button className="bg-cyan-600 hover:bg-cyan-700">
          <Folder className="w-4 h-4 mr-2" />
          New Project
        </Button>
      </div>

      {/* Agent Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {agents?.map((agent) => (
          <Card key={agent._id} className="p-4 bg-slate-800/50 border-slate-700">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-slate-700 flex items-center justify-center text-xl">
                  {agent.avatar || "🤖"}
                </div>
                <div>
                  <h3 className="font-semibold text-slate-100">{agent.name}</h3>
                  <p className="text-xs text-slate-500 capitalize">{agent.department}</p>
                </div>
              </div>
              <Badge 
                className={
                  agent.status === "idle" ? "bg-emerald-600/20 text-emerald-400" :
                  agent.status === "working" ? "bg-amber-600/20 text-amber-400" :
                  "bg-slate-600/20 text-slate-400"
                }
              >
                {agent.status}
              </Badge>
            </div>

            <div className="text-sm text-slate-400 mb-3 line-clamp-2">
              {agent.description}
            </div>

            <div className="flex flex-wrap gap-1 mb-3">
              {agent.capabilities?.slice(0, 3).map((cap, i) => (
                <Badge key={i} variant="outline" className="text-xs border-slate-600 text-slate-500">
                  {cap}
                </Badge>
              ))}
            </div>

            <div className="flex items-center justify-between text-xs text-slate-500 pt-3 border-t border-slate-700/50">
              <span>Tasks: {agent.performance?.tasksCompleted || 0}</span>
              <span>Quality: {(agent.performance?.avgQuality || 0).toFixed(1)}</span>
            </div>
          </Card>
        ))}
      </div>

      {!agents && (
        <div className="text-center py-12 text-slate-500">
          <div className="animate-spin w-8 h-8 border-2 border-slate-600 border-t-cyan-500 rounded-full mx-auto mb-4" />
          <p>Loading agents...</p>
        </div>
      )}

      {agents?.length === 0 && (
        <div className="text-center py-12 text-slate-500">
          <Folder className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p>No agents found</p>
          <p className="text-sm mt-1">Run setup script to seed agents</p>
        </div>
      )}
    </div>
  );
}
