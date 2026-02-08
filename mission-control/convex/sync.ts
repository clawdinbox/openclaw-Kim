import { v } from "convex/values";
import { query, mutation, action, internalAction } from "./_generated/server";
import { api } from "./_generated/api";

// ==================== SYNC CRON JOBS ====================

// Job category detection based on name
function detectCategory(name: string): "content" | "research" | "build" | "check-in" {
  const lowerName = name.toLowerCase();
  
  if (lowerName.includes("x post") || lowerName.includes("threads") || 
      lowerName.includes("instagram") || lowerName.includes("linkedin") ||
      lowerName.includes("substack") || lowerName.includes("newsletter")) {
    return "content";
  }
  
  if (lowerName.includes("brief") || lowerName.includes("report") || 
      lowerName.includes("digest") || lowerName.includes("research")) {
    return "research";
  }
  
  if (lowerName.includes("build") || lowerName.includes("overnight") ||
      lowerName.includes("autonomous")) {
    return "build";
  }
  
  return "check-in";
}

// Parse cron expression to get next run time (simplified)
function getNextRunTime(expr: string, tz: string): number {
  const now = Date.now();
  // For demo purposes, return times spread throughout the week
  // In production, use a proper cron parser
  return now + Math.random() * 7 * 24 * 60 * 60 * 1000;
}

export const syncJobs = mutation({
  args: {
    jobs: v.array(v.object({
      id: v.string(),
      name: v.string(),
      schedule: v.string(),
      enabled: v.boolean(),
      model: v.string(),
      description: v.string(),
      nextRunAt: v.optional(v.number()),
      lastRunAt: v.optional(v.number()),
      lastStatus: v.optional(v.string()),
    })),
  },
  handler: async (ctx, args) => {
    const results = [];
    
    for (const job of args.jobs) {
      const category = detectCategory(job.name);
      const status = job.enabled ? "active" : "disabled";
      
      // Calculate next run time
      const nextRunAt = job.nextRunAt ?? getNextRunTime(job.schedule, "Europe/Berlin");
      
      const result = await ctx.db.insert("scheduledTasks", {
        jobId: job.id,
        name: job.name,
        schedule: job.schedule,
        nextRunAt,
        lastRunAt: job.lastRunAt,
        status: status as "active" | "disabled" | "error",
        model: job.model,
        description: job.description,
        category,
      });
      
      results.push(result);
    }
    
    return results;
  },
});

export const getDashboardStats = query({
  args: {},
  handler: async (ctx) => {
    const now = Date.now();
    const todayStart = new Date().setHours(0, 0, 0, 0);
    
    // Get activity stats
    const allActivities = await ctx.db.query("activities").collect();
    const todayActivities = allActivities.filter(a => a.timestamp >= todayStart);
    
    // Get task stats
    const tasks = await ctx.db.query("scheduledTasks").collect();
    const activeTasks = tasks.filter(t => t.status === "active");
    const upcoming24h = tasks.filter(t => t.nextRunAt > now && t.nextRunAt < now + 24 * 60 * 60 * 1000);
    
    // Get last cron run
    const lastCronRun = allActivities
      .filter(a => a.type === "cron_run")
      .sort((a, b) => b.timestamp - a.timestamp)[0];
    
    // Get next upcoming task
    const nextTask = tasks
      .filter(t => t.nextRunAt > now)
      .sort((a, b) => a.nextRunAt - b.nextRunAt)[0];
    
    return {
      activities: {
        today: todayActivities.length,
        total: allActivities.length,
      },
      tasks: {
        total: tasks.length,
        active: activeTasks.length,
        upcoming24h: upcoming24h.length,
      },
      lastCronRun: lastCronRun ? {
        name: lastCronRun.metadata?.jobName ?? "Unknown",
        timestamp: lastCronRun.timestamp,
        status: lastCronRun.status,
      } : null,
      nextTask: nextTask ? {
        name: nextTask.name,
        timestamp: nextTask.nextRunAt,
        category: nextTask.category,
      } : null,
    };
  },
});
