/**
 * Execution Monitor - Track all ongoing work
 * 
 * Handles:
 * - Real-time status updates
 * - Auto-retry failed tasks (max 3 attempts)
 * - Escalate stuck tasks (>4 hours)
 * - Generate progress reports
 */

import { internalMutation, query } from "../_generated/server";
import { v } from "convex/values";
import { api } from "../_generated/api";

const DEFAULT_STUCK_THRESHOLD = 4 * 60 * 60 * 1000; // 4 hours
const MAX_RETRIES = 3;
const RETRY_DELAY_BASE = 5 * 60 * 1000; // 5 minutes base delay

/**
 * Check for stuck tasks and escalate
 */
export const checkStuckTasks = internalMutation({
  args: {
    thresholdMs: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const threshold = args.thresholdMs || DEFAULT_STUCK_THRESHOLD;
    const now = Date.now();
    const stuckThreshold = now - threshold;

    // Find running jobs that haven't been updated recently
    const runningJobs = await ctx.db.query("pipelineJobs")
      .withIndex("by_status", (q) => q.eq("status", "running"))
      .collect();

    let checked = 0;
    let escalated = 0;

    for (const job of runningJobs) {
      checked++;
      
      const lastActivity = job.startedAt || job.createdAt;
      
      if (lastActivity < stuckThreshold) {
        // Mark as stuck
        await ctx.db.patch(job._id, {
          status: "stuck",
        });

        // Get assigned agent
        const agent = job.assignedAgent ? await ctx.db.get(job.assignedAgent) : null;

        // Log escalation
        await ctx.db.insert("activities", {
          type: "stuck_task_escalated",
          agentId: job.assignedAgent,
          agentRole: job.agentRole,
          pipelineJobId: job._id,
          message: `Job stuck for ${Math.round((now - lastActivity) / (60 * 60 * 1000))} hours: ${job.type}`,
          metadata: {
            stuckDuration: now - lastActivity,
            threshold,
            assignedAgent: agent?.displayName,
          },
          timestamp: now,
        });

        // Notify CEO if configured
        const config = await ctx.db.query("pipelineConfig").first();
        if (config?.notifyOn?.stuckTask) {
          await notifyCEO(ctx, {
            type: "stuck_task",
            jobId: job._id,
            jobType: job.type,
            agentName: agent?.displayName,
            duration: now - lastActivity,
          });
        }

        // Attempt to reassign if possible
        await attemptReassignment(ctx, job);

        escalated++;
      }
    }

    return { checked, escalated };
  },
});

/**
 * Auto-retry failed tasks
 */
export const retryFailedTasks = internalMutation({
  args: {
    maxRetries: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const maxRetries = args.maxRetries || MAX_RETRIES;
    
    const failedJobs = await ctx.db.query("pipelineJobs")
      .withIndex("by_status", (q) => q.eq("status", "failed"))
      .collect();

    let retried = 0;

    for (const job of failedJobs) {
      if ((job.retryCount || 0) >= maxRetries) {
        // Max retries exceeded - escalate to manual review
        await escalateToManualReview(ctx, job);
        continue;
      }

      // Calculate retry delay (exponential backoff)
      const retryDelay = RETRY_DELAY_BASE * Math.pow(2, job.retryCount || 0);
      const canRetry = !job.completedAt || (Date.now() - job.completedAt) > retryDelay;

      if (canRetry) {
        // Reset job for retry
        await ctx.db.patch(job._id, {
          status: "retrying",
          retryCount: (job.retryCount || 0) + 1,
          error: undefined,
        });

        // Log retry
        await ctx.db.insert("activities", {
          type: "task_retry",
          pipelineJobId: job._id,
          message: `Retrying failed job (attempt ${(job.retryCount || 0) + 1}/${maxRetries}): ${job.type}`,
          metadata: {
            retryCount: (job.retryCount || 0) + 1,
            maxRetries,
            previousError: job.error,
          },
          timestamp: Date.now(),
        });

        retried++;
      }
    }

    return { retried };
  },
});

/**
 * Advance multi-step workflows
 */
export const advanceWorkflows = internalMutation({
  args: {},
  handler: async (ctx) => {
    const runningWorkflows = await ctx.db.query("workflows")
      .withIndex("by_status", (q) => q.eq("status", "running"))
      .collect();

    let advanced = 0;

    for (const workflow of runningWorkflows) {
      const currentStep = workflow.steps[workflow.currentStep];
      if (!currentStep) {
        // Workflow complete
        await ctx.db.patch(workflow._id, {
          status: "complete",
          completedAt: Date.now(),
        });

        await ctx.db.insert("activities", {
          type: "workflow_completed",
          message: `Workflow completed: ${workflow.name}`,
          metadata: {
            workflowId: workflow._id,
            name: workflow.name,
            totalSteps: workflow.steps.length,
          },
          timestamp: Date.now(),
        });

        continue;
      }

      // Check if current step job is complete
      if (currentStep.jobId) {
        const job = await ctx.db.get(currentStep.jobId);
        
        if (job?.status === "complete") {
          // Advance to next step
          const nextStepIndex = workflow.currentStep + 1;
          await ctx.db.patch(workflow._id, {
            currentStep: nextStepIndex,
          });

          // Start next step if it exists and dependencies are met
          const nextStep = workflow.steps[nextStepIndex];
          if (nextStep) {
            const depsMet = await checkStepDependencies(ctx, workflow, nextStep);
            
            if (depsMet) {
              // Create job for next step
              const newJobId = await ctx.runMutation(api.pipeline.generator.createManualTask, {
                type: nextStep.task,
                priority: "p1",
                context: `Workflow "${workflow.name}" - Step ${nextStep.step}: ${nextStep.task}`,
                agentRole: nextStep.agentRole,
                workflowId: workflow._id,
                workflowStep: nextStep.step,
              });

              // Update step with job ID
              const updatedSteps = [...workflow.steps];
              updatedSteps[nextStepIndex] = { ...nextStep, jobId: newJobId };
              await ctx.db.patch(workflow._id, { steps: updatedSteps });
            }
          }

          advanced++;
        } else if (job?.status === "failed") {
          // Workflow failed
          await ctx.db.patch(workflow._id, {
            status: "failed",
            completedAt: Date.now(),
          });

          await ctx.db.insert("activities", {
            type: "workflow_completed",
            message: `Workflow failed at step ${workflow.currentStep}: ${workflow.name}`,
            metadata: {
              workflowId: workflow._id,
              failedStep: workflow.currentStep,
              error: job.error,
            },
            timestamp: Date.now(),
          });
        }
      }
    }

    return { advanced };
  },
});

/**
 * Update pipeline metrics
 */
export const updateMetrics = internalMutation({
  args: {},
  handler: async (ctx) => {
    const now = Date.now();
    const dayAgo = now - 24 * 60 * 60 * 1000;

    // Count completed tasks in last 24h
    const completedJobs = await ctx.db.query("pipelineJobs")
      .withIndex("by_status", (q) => q.eq("status", "complete"))
      .filter((q) => q.gte(q.field("completedAt"), dayAgo))
      .collect();

    const failedJobs = await ctx.db.query("pipelineJobs")
      .withIndex("by_status", (q) => q.eq("status", "failed"))
      .filter((q) => q.gte(q.field("completedAt"), dayAgo))
      .collect();

    // Calculate average duration
    let totalDuration = 0;
    let durationCount = 0;

    for (const job of completedJobs) {
      if (job.startedAt && job.completedAt) {
        totalDuration += job.completedAt - job.startedAt;
        durationCount++;
      }
    }

    const avgDuration = durationCount > 0 
      ? Math.round(totalDuration / durationCount / (60 * 1000)) // in minutes
      : 0;

    // Calculate success rate
    const totalCompleted = completedJobs.length + failedJobs.length;
    const successRate = totalCompleted > 0 
      ? completedJobs.length / totalCompleted 
      : 1;

    // Update config
    const config = await ctx.db.query("pipelineConfig").first();
    if (config) {
      await ctx.db.patch(config._id, {
        metrics: {
          tasksCompleted24h: completedJobs.length,
          tasksFailed24h: failedJobs.length,
          avgTaskDuration: avgDuration,
          successRate: Math.round(successRate * 100) / 100,
          lastCalculated: now,
        },
      });
    }

    return {
      tasksCompleted24h: completedJobs.length,
      tasksFailed24h: failedJobs.length,
      avgTaskDuration: avgDuration,
      successRate,
    };
  },
});

/**
 * Log pipeline activity
 */
export const logPipelineActivity = internalMutation({
  args: {
    type: v.string(),
    message: v.string(),
    metadata: v.optional(v.any()),
    isError: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    await ctx.db.insert("activities", {
      type: args.type as any,
      message: args.message,
      metadata: args.metadata,
      timestamp: Date.now(),
    });
  },
});

/**
 * Mark a job as complete
 */
export const markJobComplete = internalMutation({
  args: {
    jobId: v.id("pipelineJobs"),
    output: v.optional(v.string()),
    outputPath: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const job = await ctx.db.get(args.jobId);
    if (!job) throw new Error("Job not found");

    const now = Date.now();

    // Update job
    await ctx.db.patch(args.jobId, {
      status: "complete",
      completedAt: now,
      output: args.output,
      outputPath: args.outputPath,
    });

    // Release agent
    if (job.assignedAgent) {
      await ctx.runMutation(api.pipeline.router.releaseAgent, {
        agentId: job.assignedAgent,
        jobId: args.jobId,
      });
    }

    // Update associated task
    if (job._id) {
      const tasks = await ctx.db.query("tasks")
        .withIndex("by_pipeline_job", (q) => q.eq("pipelineJobId", job._id))
        .collect();

      for (const task of tasks) {
        await ctx.db.patch(task._id, {
          status: "complete",
          completedAt: now,
          output: args.outputPath,
          outputSummary: args.output,
        });
      }
    }

    // Log completion
    await ctx.db.insert("activities", {
      type: "task_completed",
      agentId: job.assignedAgent,
      agentRole: job.agentRole,
      pipelineJobId: job._id,
      message: `Job completed: ${job.type}`,
      metadata: {
        duration: job.startedAt ? now - job.startedAt : undefined,
        output: args.output,
      },
      timestamp: now,
    });

    // Notify if configured
    const config = await ctx.db.query("pipelineConfig").first();
    if (config?.notifyOn?.taskComplete && job.priorityLevel === "p0") {
      await notifyCEO(ctx, {
        type: "task_complete",
        jobId: job._id,
        jobType: job.type,
        output: args.output,
      });
    }

    return { success: true, completedAt: now };
  },
});

/**
 * Mark a job as failed
 */
export const markJobFailed = internalMutation({
  args: {
    jobId: v.id("pipelineJobs"),
    error: v.string(),
  },
  handler: async (ctx, args) => {
    const job = await ctx.db.get(args.jobId);
    if (!job) throw new Error("Job not found");

    const now = Date.now();

    await ctx.db.patch(args.jobId, {
      status: "failed",
      completedAt: now,
      error: args.error,
    });

    // Release agent
    if (job.assignedAgent) {
      await ctx.runMutation(api.pipeline.router.releaseAgent, {
        agentId: job.assignedAgent,
        jobId: args.jobId,
      });
    }

    // Log failure
    await ctx.db.insert("activities", {
      type: "status_changed",
      agentId: job.assignedAgent,
      agentRole: job.agentRole,
      pipelineJobId: job._id,
      message: `Job failed: ${job.type}`,
      metadata: {
        error: args.error,
        retryCount: job.retryCount,
      },
      timestamp: now,
    });

    // Notify if configured
    const config = await ctx.db.query("pipelineConfig").first();
    if (config?.notifyOn?.taskFailed) {
      await notifyCEO(ctx, {
        type: "task_failed",
        jobId: job._id,
        jobType: job.type,
        error: args.error,
      });
    }

    return { success: true };
  },
});

/**
 * Get execution report
 */
export const getExecutionReport = query({
  args: {
    hours: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const hours = args.hours || 24;
    const since = Date.now() - hours * 60 * 60 * 1000;

    const jobs = await ctx.db.query("pipelineJobs")
      .filter((q) => q.gte(q.field("createdAt"), since))
      .collect();

    const report = {
      period: `${hours} hours`,
      total: jobs.length,
      byStatus: {
        pending: 0,
        running: 0,
        complete: 0,
        failed: 0,
        stuck: 0,
        retrying: 0,
      },
      byType: {} as Record<string, number>,
      byAgent: {} as Record<string, number>,
      avgDuration: 0,
      successRate: 0,
    };

    let totalDuration = 0;
    let completedCount = 0;

    for (const job of jobs) {
      report.byStatus[job.status]++;
      
      report.byType[job.type] = (report.byType[job.type] || 0) + 1;
      
      if (job.agentRole) {
        report.byAgent[job.agentRole] = (report.byAgent[job.agentRole] || 0) + 1;
      }

      if (job.status === "complete" && job.startedAt && job.completedAt) {
        totalDuration += job.completedAt - job.startedAt;
        completedCount++;
      }
    }

    report.avgDuration = completedCount > 0 
      ? Math.round(totalDuration / completedCount / (60 * 1000))
      : 0;

    const finished = report.byStatus.complete + report.byStatus.failed;
    report.successRate = finished > 0 
      ? Math.round((report.byStatus.complete / finished) * 100)
      : 0;

    return report;
  },
});

// ==================== HELPER FUNCTIONS ====================

async function attemptReassignment(ctx: any, job: any) {
  // Try to find a new agent for the stuck job
  const availableAgents = await ctx.db.query("agents")
    .filter((q) => q.and(
      q.neq(q.field("status"), "offline"),
      q.lt(q.field("workload"), 3)
    ))
    .collect();

  if (availableAgents.length > 0) {
    // Release current agent
    if (job.assignedAgent) {
      await ctx.runMutation(api.pipeline.router.releaseAgent, {
        agentId: job.assignedAgent,
        jobId: job._id,
      });
    }

    // Reset job for reassignment
    await ctx.db.patch(job._id, {
      status: "pending",
      assignedAgent: undefined,
      agentRole: undefined,
      error: "Reassigned due to being stuck",
    });

    await ctx.db.insert("activities", {
      type: "task_auto_assigned",
      pipelineJobId: job._id,
      message: `Stuck job reset for reassignment: ${job.type}`,
      metadata: {
        previousAgent: job.assignedAgent,
        reason: "stuck",
      },
      timestamp: Date.now(),
    });
  }
}

async function escalateToManualReview(ctx: any, job: any) {
  await ctx.db.insert("activities", {
    type: "status_changed",
    pipelineJobId: job._id,
    message: `Job requires manual review after ${MAX_RETRIES} failed attempts: ${job.type}`,
    metadata: {
      jobType: job.type,
      retryCount: job.retryCount,
      lastError: job.error,
    },
    timestamp: Date.now(),
  });

  // Notify CEO
  await notifyCEO(ctx, {
    type: "manual_review_required",
    jobId: job._id,
    jobType: job.type,
    error: job.error,
    retryCount: job.retryCount,
  });
}

async function checkStepDependencies(ctx: any, workflow: any, step: any): Promise<boolean> {
  if (!step.dependsOn || step.dependsOn.length === 0) return true;

  for (const depStepNum of step.dependsOn) {
    const depStep = workflow.steps.find((s: any) => s.step === depStepNum);
    if (!depStep?.jobId) return false;

    const depJob = await ctx.db.get(depStep.jobId);
    if (depJob?.status !== "complete") return false;
  }

  return true;
}

async function notifyCEO(ctx: any, notification: any) {
  // Find CEO agent
  const ceo = await ctx.db.query("agents")
    .withIndex("by_role", (q) => q.eq("role", "ceo"))
    .first();

  if (!ceo) return;

  // In a real implementation, this would send an actual notification
  // via email, Slack, webhook, etc.
  console.log(`[NOTIFY CEO] ${notification.type}:`, notification);

  // Log the notification
  await ctx.db.insert("activities", {
    type: "output_delivered",
    agentId: ceo._id,
    message: `Notification sent to CEO: ${notification.type}`,
    metadata: notification,
    timestamp: Date.now(),
  });
}

/**
 * Get real-time pipeline health
 */
export const getPipelineHealth = query({
  args: {},
  handler: async (ctx) => {
    const now = Date.now();

    // Get current metrics
    const config = await ctx.db.query("pipelineConfig").first();
    
    // Count issues
    const stuckCount = await ctx.db.query("pipelineJobs")
      .withIndex("by_status", (q) => q.eq("status", "stuck"))
      .collect()
      .then(jobs => jobs.length);

    const failedCount = await ctx.db.query("pipelineJobs")
      .withIndex("by_status", (q) => q.eq("status", "failed"))
      .collect()
      .then(jobs => jobs.length);

    const runningCount = await ctx.db.query("pipelineJobs")
      .withIndex("by_status", (q) => q.eq("status", "running"))
      .collect()
      .then(jobs => jobs.length);

    // Calculate health score
    let healthScore = 100;
    if (stuckCount > 0) healthScore -= stuckCount * 10;
    if (failedCount > 5) healthScore -= 15;
    if (config?.isPaused) healthScore -= 20;

    // Determine status
    let status: "healthy" | "degraded" | "critical";
    if (healthScore >= 80) status = "healthy";
    else if (healthScore >= 50) status = "degraded";
    else status = "critical";

    return {
      status,
      score: Math.max(healthScore, 0),
      issues: {
        stuck: stuckCount,
        failed: failedCount,
        running: runningCount,
      },
      isPaused: config?.isPaused || false,
      mode: config?.mode || "proactive",
      lastTick: config?.lastTick,
      timeSinceLastTick: config?.lastTick ? now - config.lastTick : undefined,
    };
  },
});
