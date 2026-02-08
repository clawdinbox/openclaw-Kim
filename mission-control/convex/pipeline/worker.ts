/**
 * Pipeline Worker - The Heart of 24/7 Operation
 * 
 * This module runs continuously (via cron or scheduler) to:
 * 1. Check for stuck tasks
 * 2. Generate new tasks if capacity available
 * 3. Assign pending tasks to idle agents
 * 4. Spawn sub-agents for assigned tasks
 * 5. Update metrics
 */

import { internalAction, internalMutation, query } from "../_generated/server";
import { v } from "convex/values";
import { api } from "../_generated/api";

// Constants for pipeline operation
const STUCK_TASK_THRESHOLD = 4 * 60 * 60 * 1000; // 4 hours in ms
const MAX_RETRIES = 3;
const DEFAULT_TICK_INTERVAL = 5 * 60 * 1000; // 5 minutes in ms

/**
 * Main tick function - runs every 5 minutes
 * This is the orchestration heartbeat of the autonomous system
 */
export const tick = internalAction({
  args: {},
  handler: async (ctx) => {
    const now = Date.now();
    console.log(`[PIPELINE TICK] Starting tick at ${new Date(now).toISOString()}`);

    try {
      // 1. Check if pipeline is paused
      const config = await ctx.runQuery(api.pipeline.worker.getPipelineConfig);
      if (config?.isPaused) {
        console.log("[PIPELINE TICK] Pipeline is paused, skipping...");
        return { status: "paused", timestamp: now };
      }

      // 2. Check operating hours
      if (config?.operatingHours) {
        const { start, end, timezone } = config.operatingHours;
        const currentHour = new Date().getHours();
        if (currentHour < start || currentHour >= end) {
          console.log(`[PIPELINE TICK] Outside operating hours (${start}-${end}), skipping...`);
          return { status: "outside_hours", timestamp: now };
        }
      }

      const results = {
        stuckTasksChecked: 0,
        stuckTasksEscalated: 0,
        tasksGenerated: 0,
        tasksAssigned: 0,
        retriesTriggered: 0,
        workflowsAdvanced: 0,
        metrics: null as any,
      };

      // 3. Check for stuck tasks and escalate
      const stuckCheck = await ctx.runMutation(api.pipeline.monitor.checkStuckTasks, {
        thresholdMs: STUCK_TASK_THRESHOLD,
      });
      results.stuckTasksChecked = stuckCheck.checked;
      results.stuckTasksEscalated = stuckCheck.escalated;

      // 4. Auto-retry failed tasks (up to MAX_RETRIES)
      const retryResult = await ctx.runMutation(api.pipeline.monitor.retryFailedTasks, {
        maxRetries: MAX_RETRIES,
      });
      results.retriesTriggered = retryResult.retried;

      // 5. Generate new tasks from templates if in proactive mode
      if (config?.mode === "proactive" || config?.mode === "project") {
        const generated = await ctx.runMutation(api.pipeline.generator.generateTasksFromTemplates, {
          maxTasks: 10,
        });
        results.tasksGenerated = generated.count;
      }

      // 6. Assign pending tasks to available agents
      const assigned = await ctx.runMutation(api.pipeline.router.assignPendingTasks, {
        maxAssignments: 5,
      });
      results.tasksAssigned = assigned.count;

      // 7. Advance multi-step workflows
      const workflows = await ctx.runMutation(api.pipeline.monitor.advanceWorkflows);
      results.workflowsAdvanced = workflows.advanced;

      // 8. Update pipeline metrics
      const metrics = await ctx.runMutation(api.pipeline.monitor.updateMetrics);
      results.metrics = metrics;

      // 9. Update last tick timestamp
      await ctx.runMutation(api.pipeline.worker.updateLastTick, { timestamp: now });

      // 10. Log activity
      await ctx.runMutation(api.pipeline.monitor.logPipelineActivity, {
        type: "pipeline_tick",
        message: `Pipeline tick completed. Generated: ${results.tasksGenerated}, Assigned: ${results.tasksAssigned}, Escalated: ${results.stuckTasksEscalated}`,
        metadata: results,
      });

      console.log(`[PIPELINE TICK] Completed at ${new Date().toISOString()}`, results);

      return {
        status: "success",
        timestamp: now,
        results,
      };
    } catch (error) {
      console.error("[PIPELINE TICK] Error during tick:", error);
      
      // Log the error
      await ctx.runMutation(api.pipeline.monitor.logPipelineActivity, {
        type: "pipeline_tick",
        message: `Pipeline tick failed: ${error instanceof Error ? error.message : String(error)}`,
        metadata: { error: String(error) },
        isError: true,
      });

      return {
        status: "error",
        timestamp: now,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  },
});

/**
 * Get current pipeline configuration
 */
export const getPipelineConfig = query({
  args: {},
  handler: async (ctx) => {
    const config = await ctx.db
      .query("pipelineConfig")
      .first();
    
    if (!config) {
      // Return default config if none exists
      return {
        mode: "proactive" as const,
        lastTick: Date.now(),
        tickInterval: 300,
        isPaused: false,
        metrics: {
          tasksCompleted24h: 0,
          tasksFailed24h: 0,
          avgTaskDuration: 0,
          successRate: 1,
          lastCalculated: Date.now(),
        },
        notifyOn: {
          taskComplete: true,
          taskFailed: true,
          stuckTask: true,
          dailyDigest: true,
        },
      };
    }
    
    return config;
  },
});

/**
 * Initialize pipeline configuration
 */
export const initializeConfig = internalMutation({
  args: {
    mode: v.union(v.literal("proactive"), v.literal("reactive"), v.literal("project")),
    operatingHours: v.optional(v.object({
      start: v.number(),
      end: v.number(),
      timezone: v.string(),
    })),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db.query("pipelineConfig").first();
    
    if (existing) {
      await ctx.db.patch(existing._id, {
        mode: args.mode,
        lastTick: Date.now(),
        operatingHours: args.operatingHours,
      });
      return existing._id;
    }

    const configId = await ctx.db.insert("pipelineConfig", {
      mode: args.mode,
      lastTick: Date.now(),
      tickInterval: 300,
      isPaused: false,
      metrics: {
        tasksCompleted24h: 0,
        tasksFailed24h: 0,
        avgTaskDuration: 0,
        successRate: 1,
        lastCalculated: Date.now(),
      },
      notifyOn: {
        taskComplete: true,
        taskFailed: true,
        stuckTask: true,
        dailyDigest: true,
      },
      operatingHours: args.operatingHours,
      enabledTemplates: [
        "morning_brief",
        "social_content_prep",
        "competitor_scan",
        "news_monitor",
        "weekly_digest",
      ],
    });

    // Initialize default task templates
    await ctx.runMutation(api.pipeline.generator.initializeDefaultTemplates);

    return configId;
  },
});

/**
 * Update last tick timestamp
 */
export const updateLastTick = internalMutation({
  args: { timestamp: v.number() },
  handler: async (ctx, args) => {
    const config = await ctx.db.query("pipelineConfig").first();
    if (config) {
      await ctx.db.patch(config._id, {
        lastTick: args.timestamp,
      });
    }
  },
});

/**
 * Pause/unpause the pipeline
 */
export const setPaused = internalMutation({
  args: {
    paused: v.boolean(),
    reason: v.optional(v.string()),
    pausedBy: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const config = await ctx.db.query("pipelineConfig").first();
    if (!config) return;

    await ctx.db.patch(config._id, {
      isPaused: args.paused,
      pausedAt: args.paused ? Date.now() : undefined,
      pausedBy: args.paused ? args.pausedBy : undefined,
    });

    // Log the pause/unpause
    await ctx.db.insert("activities", {
      type: "status_changed",
      message: args.paused 
        ? `Pipeline paused${args.reason ? `: ${args.reason}` : ""}`
        : "Pipeline resumed",
      metadata: {
        action: args.paused ? "paused" : "resumed",
        reason: args.reason,
        pausedBy: args.pausedBy,
      },
      timestamp: Date.now(),
    });
  },
});

/**
 * Change pipeline mode
 */
export const setMode = internalMutation({
  args: {
    mode: v.union(v.literal("proactive"), v.literal("reactive"), v.literal("project")),
    activeProject: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const config = await ctx.db.query("pipelineConfig").first();
    if (!config) return;

    await ctx.db.patch(config._id, {
      mode: args.mode,
      activeProject: args.activeProject,
    });

    await ctx.db.insert("activities", {
      type: "status_changed",
      message: `Pipeline mode changed to ${args.mode}${args.activeProject ? ` (Project: ${args.activeProject})` : ""}`,
      metadata: {
        oldMode: config.mode,
        newMode: args.mode,
        activeProject: args.activeProject,
      },
      timestamp: Date.now(),
    });
  },
});

/**
 * Get current pipeline status for dashboard
 */
export const getPipelineStatus = query({
  args: {},
  handler: async (ctx) => {
    const config = await ctx.db.query("pipelineConfig").first();
    
    // Count jobs by status
    const pendingJobs = await ctx.db.query("pipelineJobs")
      .withIndex("by_status", (q) => q.eq("status", "pending"))
      .collect();
    
    const runningJobs = await ctx.db.query("pipelineJobs")
      .withIndex("by_status", (q) => q.eq("status", "running"))
      .collect();
    
    const failedJobs = await ctx.db.query("pipelineJobs")
      .withIndex("by_status", (q) => q.eq("status", "failed"))
      .collect();

    const stuckJobs = await ctx.db.query("pipelineJobs")
      .withIndex("by_status", (q) => q.eq("status", "stuck"))
      .collect();

    // Get agent workloads
    const agents = await ctx.db.query("agents").collect();
    const agentWorkloads = agents.map(agent => ({
      id: agent._id,
      role: agent.role,
      name: agent.displayName,
      status: agent.status,
      workload: agent.workload || 0,
      maxWorkload: agent.maxWorkload || 3,
      currentTask: agent.currentTask,
    }));

    // Get active workflows
    const workflows = await ctx.db.query("workflows")
      .withIndex("by_status", (q) => q.eq("status", "running"))
      .collect();

    return {
      mode: config?.mode || "proactive",
      isPaused: config?.isPaused || false,
      lastTick: config?.lastTick || Date.now(),
      metrics: config?.metrics || {
        tasksCompleted24h: 0,
        avgTaskDuration: 0,
        successRate: 1,
      },
      queue: {
        pending: pendingJobs.length,
        running: runningJobs.length,
        failed: failedJobs.length,
        stuck: stuckJobs.length,
      },
      agentWorkloads,
      activeWorkflows: workflows.map(w => ({
        id: w._id,
        name: w.name,
        currentStep: w.currentStep,
        totalSteps: w.steps.length,
        startedAt: w.startedAt,
      })),
    };
  },
});

/**
 * Emergency stop - pause all operations
 */
export const emergencyStop = internalMutation({
  args: {
    reason: v.string(),
    initiatedBy: v.string(),
  },
  handler: async (ctx, args) => {
    const config = await ctx.db.query("pipelineConfig").first();
    if (!config) return;

    // Pause the pipeline
    await ctx.db.patch(config._id, {
      isPaused: true,
      pausedAt: Date.now(),
      pausedBy: args.initiatedBy,
    });

    // Log emergency stop
    await ctx.db.insert("activities", {
      type: "status_changed",
      message: `🚨 EMERGENCY STOP: ${args.reason}`,
      metadata: {
        action: "emergency_stop",
        reason: args.reason,
        initiatedBy: args.initiatedBy,
        timestamp: Date.now(),
      },
      timestamp: Date.now(),
    });

    // Cancel running pipeline jobs
    const runningJobs = await ctx.db.query("pipelineJobs")
      .withIndex("by_status", (q) => q.eq("status", "running"))
      .collect();

    for (const job of runningJobs) {
      await ctx.db.patch(job._id, {
        status: "failed",
        error: "Cancelled due to emergency stop",
        completedAt: Date.now(),
      });
    }

    return {
      jobsCancelled: runningJobs.length,
      timestamp: Date.now(),
    };
  },
});
