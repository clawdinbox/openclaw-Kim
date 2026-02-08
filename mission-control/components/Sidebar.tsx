"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { 
  Activity, 
  Calendar, 
  Clock, 
  FileText, 
  Folder, 
  Home, 
  Search,
  Zap,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Briefcase,
  LayoutGrid
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";

export function Sidebar() {
  const stats = useQuery(api.sync.getDashboardStats);

  return (
    <aside className="w-64 bg-zinc-900 border-r border-zinc-800 flex flex-col h-screen sticky top-0">
      {/* Header */}
      <div className="p-6 border-b border-zinc-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
            <Zap className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="font-semibold text-lg tracking-tight">Mission Control</h1>
            <p className="text-xs text-zinc-500">Kim&apos;s Operations Dashboard</p>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="p-4 space-y-3">
        <h2 className="text-xs font-medium text-zinc-500 uppercase tracking-wider px-2">Today</h2>
        <div className="space-y-2">
          <StatCard 
            icon={Activity} 
            label="Activities" 
            value={stats?.activities.today ?? 0} 
            color="cyan"
          />
          <StatCard 
            icon={Calendar} 
            label="Tasks Scheduled" 
            value={stats?.tasks.upcoming24h ?? 0} 
            color="blue"
          />
          <StatCard 
            icon={Zap} 
            label="Active Cron Jobs" 
            value={stats?.tasks.active ?? 0} 
            color="green"
          />
        </div>
      </div>

      {/* Quick Links */}
      <div className="p-4 space-y-3">
        <h2 className="text-xs font-medium text-zinc-500 uppercase tracking-wider px-2">Navigation</h2>
        <nav className="space-y-1">
          <QuickLink href="/" icon={LayoutGrid} label="Dashboard" />
          <QuickLink href="/projects" icon={Briefcase} label="Projects" />
          <QuickLink href="/tasks" icon={CheckCircle2} label="Tasks" />
          <QuickLink href="#" icon={FileText} label="Memory" />
          <QuickLink href="#" icon={Folder} label="Documents" />
        </nav>
      </div>

      <div className="flex-1" />

      {/* Status */}
      <div className="p-4 border-t border-zinc-800 space-y-3">
        <h2 className="text-xs font-medium text-zinc-500 uppercase tracking-wider px-2">Status</h2>
        
        {stats?.lastCronRun && (
          <div className="px-2 space-y-2">
            <div className="flex items-center gap-2 text-sm">
              {stats.lastCronRun.status === "success" ? (
                <CheckCircle2 className="w-4 h-4 text-green-500" />
              ) : stats.lastCronRun.status === "error" ? (
                <AlertCircle className="w-4 h-4 text-red-500" />
              ) : (
                <Loader2 className="w-4 h-4 text-yellow-500 animate-spin" />
              )}
              <span className="text-zinc-300 truncate">{stats.lastCronRun.name}</span>
            </div>
            <p className="text-xs text-zinc-500 px-6">
              {formatDistanceToNow(stats.lastCronRun.timestamp, { addSuffix: true })}
            </p>
          </div>
        )}

        {stats?.nextTask && (
          <div className="px-2 space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <Clock className="w-4 h-4 text-cyan-500" />
              <span className="text-zinc-300 truncate">{stats.nextTask.name}</span>
            </div>
            <p className="text-xs text-zinc-500 px-6">
              {formatDistanceToNow(stats.nextTask.timestamp, { addSuffix: true })}
            </p>
          </div>
        )}
      </div>
    </aside>
  );
}

function StatCard({ 
  icon: Icon, 
  label, 
  value, 
  color 
}: { 
  icon: React.ElementType; 
  label: string; 
  value: number; 
  color: "cyan" | "blue" | "green"; 
}) {
  const colorClasses = {
    cyan: "bg-cyan-500/10 text-cyan-500",
    blue: "bg-blue-500/10 text-blue-500",
    green: "bg-green-500/10 text-green-500",
  };

  return (
    <div className="flex items-center gap-3 px-3 py-2 rounded-lg bg-zinc-800/50">
      <div className={`p-2 rounded-md ${colorClasses[color]}`}>
        <Icon className="w-4 h-4" />
      </div>
      <div className="flex-1">
        <p className="text-xs text-zinc-500">{label}</p>
        <p className="text-lg font-semibold">{value}</p>
      </div>
    </div>
  );
}

function QuickLink({ 
  href, 
  icon: Icon, 
  label 
}: { 
  href: string; 
  icon: React.ElementType; 
  label: string; 
}) {
  return (
    <a 
      href={href}
      className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/50 transition-colors"
    >
      <Icon className="w-4 h-4" />
      {label}
    </a>
  );
}
