"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useState, useMemo } from "react";
import { 
  format, 
  startOfWeek, 
  endOfWeek, 
  eachDayOfInterval, 
  addWeeks, 
  subWeeks,
  isSameDay,
  startOfDay,
  getHours,
  getMinutes
} from "date-fns";
import { 
  ChevronLeft, 
  ChevronRight, 
  Calendar as CalendarIcon,
  Clock,
  MoreHorizontal
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import type { Doc } from "@/convex/_generated/dataModel";

const categoryColors = {
  content: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  research: "bg-green-500/20 text-green-400 border-green-500/30",
  build: "bg-purple-500/20 text-purple-400 border-purple-500/30",
  "check-in": "bg-zinc-500/20 text-zinc-400 border-zinc-500/30",
};

const categoryLabels = {
  content: "Content",
  research: "Research",
  build: "Build",
  "check-in": "Check-in",
};

export function CalendarView() {
  const [currentWeek, setCurrentWeek] = useState(new Date());
  const [selectedTask, setSelectedTask] = useState<Doc<"scheduledTasks"> | null>(null);
  
  const tasks = useQuery(api.tasks.getScheduledTasks, {});

  const weekDays = useMemo(() => {
    const start = startOfWeek(currentWeek, { weekStartsOn: 1 });
    const end = endOfWeek(currentWeek, { weekStartsOn: 1 });
    return eachDayOfInterval({ start, end });
  }, [currentWeek]);

  const tasksByDay = useMemo(() => {
    const map = new Map<string, Doc<"scheduledTasks">[]>();
    weekDays.forEach((day) => {
      map.set(format(day, "yyyy-MM-dd"), []);
    });
    
    tasks?.forEach((task) => {
      const taskDate = new Date(task.nextRunAt);
      const dayKey = format(taskDate, "yyyy-MM-dd");
      if (map.has(dayKey)) {
        map.get(dayKey)?.push(task);
      }
    });
    
    // Sort tasks within each day by time
    map.forEach((dayTasks) => {
      dayTasks.sort((a, b) => a.nextRunAt - b.nextRunAt);
    });
    
    return map;
  }, [tasks, weekDays]);

  const timeSlots = useMemo(() => {
    return Array.from({ length: 24 }, (_, i) => i);
  }, []);

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-zinc-800">
        <div className="flex items-center gap-4">
          <h2 className="text-lg font-semibold">Weekly Schedule</h2>
          <div className="flex items-center gap-2 text-sm text-zinc-400">
            <CalendarIcon className="w-4 h-4" />
            {format(weekDays[0], "MMM d")} - {format(weekDays[6], "MMM d, yyyy")}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentWeek(new Date())}
            className="border-zinc-700 hover:bg-zinc-800"
          >
            Today
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => setCurrentWeek(subWeeks(currentWeek, 1))}
            className="border-zinc-700 hover:bg-zinc-800"
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => setCurrentWeek(addWeeks(currentWeek, 1))}
            className="border-zinc-700 hover:bg-zinc-800"
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 px-4 py-2 border-b border-zinc-800">
        <span className="text-xs text-zinc-500 uppercase tracking-wider">Categories:</span>
        {(Object.keys(categoryLabels) as Array<keyof typeof categoryLabels>).map((cat) => (
          <div key={cat} className="flex items-center gap-1.5">
            <div className={`w-2 h-2 rounded-full ${categoryColors[cat].split(" ")[0]}`} />
            <span className="text-xs text-zinc-400">{categoryLabels[cat]}</span>
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="flex-1 overflow-auto">
        <div className="min-w-[800px]">
          {/* Day Headers */}
          <div className="grid grid-cols-7 border-b border-zinc-800 sticky top-0 bg-zinc-950 z-10">
            {weekDays.map((day) => {
              const isToday = isSameDay(day, new Date());
              return (
                <div
                  key={day.toISOString()}
                  className={`p-3 text-center border-r border-zinc-800 last:border-r-0 ${
                    isToday ? "bg-cyan-500/5" : ""
                  }`}
                >
                  <div className={`text-sm font-medium ${isToday ? "text-cyan-500" : "text-zinc-300"}`}>
                    {format(day, "EEEE")}
                  </div>
                  <div className={`text-xs ${isToday ? "text-cyan-400" : "text-zinc-500"}`}>
                    {format(day, "MMM d")}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Tasks Grid */}
          <div className="grid grid-cols-7">
            {weekDays.map((day) => {
              const dayKey = format(day, "yyyy-MM-dd");
              const dayTasks = tasksByDay.get(dayKey) ?? [];
              const isToday = isSameDay(day, new Date());

              return (
                <div
                  key={day.toISOString()}
                  className={`min-h-[400px] border-r border-zinc-800 last:border-r-0 p-2 space-y-2 ${
                    isToday ? "bg-cyan-500/5" : ""
                  }`}
                >
                  {dayTasks.map((task) => {
                    const taskDate = new Date(task.nextRunAt);
                    const hours = getHours(taskDate);
                    const minutes = getMinutes(taskDate);
                    
                    return (
                      <button
                        key={task._id}
                        onClick={() => setSelectedTask(task)}
                        className={`w-full text-left p-2 rounded-lg border text-xs transition-all hover:scale-[1.02] ${
                          categoryColors[task.category]
                        }`}
                      >
                        <div className="flex items-center gap-1 mb-1">
                          <Clock className="w-3 h-3" />
                          <span className="font-mono">
                            {hours.toString().padStart(2, "0")}:{minutes.toString().padStart(2, "0")}
                          </span>
                        </div>
                        <div className="font-medium truncate">{task.name}</div>
                        <div className="opacity-70 truncate">{task.model.split("/").pop()}</div>
                      </button>
                    );
                  })}
                  {dayTasks.length === 0 && (
                    <div className="h-full flex items-center justify-center text-zinc-700 text-xs">
                      No tasks
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Task Details Dialog */}
      <Dialog open={!!selectedTask} onOpenChange={() => setSelectedTask(null)}>
        <DialogContent className="bg-zinc-900 border-zinc-800 text-zinc-100 max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              <span>{selectedTask?.name}</span>
              {selectedTask && (
                <Badge className={categoryColors[selectedTask.category]}>
                  {categoryLabels[selectedTask.category]}
                </Badge>
              )}
            </DialogTitle>
          </DialogHeader>
          {selectedTask && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-zinc-500 mb-1">Schedule</p>
                  <p className="font-mono text-zinc-300">{selectedTask.schedule}</p>
                </div>
                <div>
                  <p className="text-zinc-500 mb-1">Status</p>
                  <Badge variant={selectedTask.status === "active" ? "default" : "secondary"}>
                    {selectedTask.status}
                  </Badge>
                </div>
                <div>
                  <p className="text-zinc-500 mb-1">Model</p>
                  <p className="text-zinc-300">{selectedTask.model}</p>
                </div>
                <div>
                  <p className="text-zinc-500 mb-1">Next Run</p>
                  <p className="text-zinc-300">
                    {format(new Date(selectedTask.nextRunAt), "MMM d, HH:mm")}
                  </p>
                </div>
              </div>
              <div>
                <p className="text-zinc-500 mb-1">Description</p>
                <p className="text-sm text-zinc-300 leading-relaxed">
                  {selectedTask.description}
                </p>
              </div>
              {selectedTask.lastRunAt && (
                <div>
                  <p className="text-zinc-500 mb-1">Last Run</p>
                  <p className="text-sm text-zinc-300">
                    {format(new Date(selectedTask.lastRunAt), "MMM d, HH:mm")}
                  </p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
