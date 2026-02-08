"use client";

import { useState } from "react";
import { Sidebar } from "@/components/Sidebar";
import { ActivityFeed } from "@/components/ActivityFeed";
import { CalendarView } from "@/components/CalendarView";
import { GlobalSearch } from "@/components/GlobalSearch";
import { ProjectsDashboard } from "@/components/ProjectsDashboard";
import { TaskManager } from "@/components/TaskManager";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Activity, Calendar, Search, Briefcase, CheckCircle2 } from "lucide-react";

type TabValue = "activity" | "calendar" | "search" | "projects" | "tasks";

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState<TabValue>("activity");

  return (
    <div className="flex h-screen bg-zinc-950">
      <Sidebar />
      
      <main className="flex-1 flex flex-col min-w-0">
        {/* Top Navigation */}
        <header className="h-16 border-b border-zinc-800 flex items-center justify-between px-6 bg-zinc-900/50">
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as TabValue)}>
            <TabsList className="bg-zinc-900 border border-zinc-800">
              <TabsTrigger 
                value="activity" 
                className="data-[state=active]:bg-zinc-800 flex items-center gap-2"
              >
                <Activity className="w-4 h-4" />
                Activity
              </TabsTrigger>
              <TabsTrigger 
                value="projects"
                className="data-[state=active]:bg-zinc-800 flex items-center gap-2"
              >
                <Briefcase className="w-4 h-4" />
                Projects
              </TabsTrigger>
              <TabsTrigger 
                value="tasks"
                className="data-[state=active]:bg-zinc-800 flex items-center gap-2"
              >
                <CheckCircle2 className="w-4 h-4" />
                Tasks
              </TabsTrigger>
              <TabsTrigger 
                value="calendar"
                className="data-[state=active]:bg-zinc-800 flex items-center gap-2"
              >
                <Calendar className="w-4 h-4" />
                Calendar
              </TabsTrigger>
              <TabsTrigger 
                value="search"
                className="data-[state=active]:bg-zinc-800 flex items-center gap-2"
              >
                <Search className="w-4 h-4" />
                Search
              </TabsTrigger>
            </TabsList>
          </Tabs>

          <div className="flex items-center gap-4">
            <div className="text-xs text-zinc-500">
              <span className="text-cyan-500">●</span> Connected
            </div>
          </div>
        </header>

        {/* Content */}
        <div className="flex-1 overflow-hidden">
          {activeTab === "activity" && <ActivityFeed />}
          {activeTab === "projects" && <ProjectsDashboard />}
          {activeTab === "tasks" && <TaskManager />}
          {activeTab === "calendar" && <CalendarView />}
          {activeTab === "search" && <GlobalSearch />}
        </div>
      </main>
    </div>
  );
}
