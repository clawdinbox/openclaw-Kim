/**
 * Output Delivery - Automatic Result Handling
 * 
 * Handles:
 * - Save deliverables to correct paths
 * - Notify CEO (Marcel) of completed work
 * - Queue for review if quality uncertain
 * - Update activity log
 */

import { internalMutation, query } from "../_generated/server";
import { v } from "convex/values";

// Output path templates by task type
const OUTPUT_PATHS: Record<string, string> = {
  "daily_brief": "outputs/daily-briefs/",
  "research": "outputs/research/",
  "content": "outputs/content/",
  "analysis": "outputs/analysis/",
  "build": "outputs/builds/",
  "monitoring": "outputs/monitoring/",
  "review": "outputs/reviews/",
  "maintenance": "outputs/maintenance/",
  "strategy": "outputs/strategy/",
};

// Quality threshold for auto-approval
const AUTO_APPROVAL_THRESHOLD = 4; // out of 5

/**
 * Process and deliver job output
 */
export const deliverOutput = internalMutation({
  args: {
    jobId: v.id("pipelineJobs"),
    output: v.string(),
    outputFormat: v.optional(v.union(
      v.literal("text"),
      v.literal("markdown"),
      v.literal("json"),
      v.literal("html")
    )),
    quality: v.optional(v.number()), // 1-5 self-assessed quality
    requiresReview: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const job = await ctx.db.get(args.jobId);
    if (!job) throw new Error("Job not found");

    const now = Date.now();
    const agent = job.assignedAgent ? await ctx.db.get(job.assignedAgent) : null;

    // Determine output path
    const basePath = OUTPUT_PATHS[job.type] || "outputs/misc/";
    const filename = generateFilename(job);
    const outputPath = `${basePath}${filename}`;

    // Determine if review is needed
    const needsReview = args.requiresReview || 
      (args.quality !== undefined && args.quality < AUTO_APPROVAL_THRESHOLD) ||
      job.priorityLevel === "p0";

    // Mark job complete
    await ctx.db.patch(args.jobId, {
      status: "complete",
      completedAt: now,
      output: args.output,
      outputPath,
    });

    // Update associated task
    const tasks = await ctx.db.query("tasks")
      .withIndex("by_pipeline_job", (q) => q.eq("pipelineJobId", job._id))
      .collect();

    for (const task of tasks) {
      await ctx.db.patch(task._id, {
        status: needsReview ? "review" : "complete",
        completedAt: needsReview ? undefined : now,
        output: outputPath,
        outputSummary: args.output.substring(0, 500),
        quality: args.quality,
      });

      // Add completion note
      await ctx.db.patch(task._id, {
        notes: [
          ...task.notes,
          {
            text: needsReview 
              ? `Output delivered for review. Quality: ${args.quality}/5`
              : `Output delivered and auto-approved. Quality: ${args.quality}/5`,
            author: agent?.displayName || "Pipeline",
            timestamp: now,
          },
        ],
      });
    }

    // Release agent
    if (job.assignedAgent) {
      const agent = await ctx.db.get(job.assignedAgent);
      if (agent) {
        const newWorkload = Math.max((agent.workload || 0) - 1, 0);
        await ctx.db.patch(job.assignedAgent, {
          workload: newWorkload,
          status: newWorkload === 0 ? "idle" : "working",
          lastOutput: args.output.substring(0, 200),
          lastOutputPath: outputPath,
        });
      }
    }

    // Log delivery
    await ctx.db.insert("activities", {
      type: "output_delivered",
      agentId: job.assignedAgent,
      agentRole: job.agentRole,
      pipelineJobId: job._id,
      message: needsReview 
        ? `Output delivered for review: ${job.type}`
        : `Output delivered: ${job.type}`,
      metadata: {
        jobType: job.type,
        outputPath,
        quality: args.quality,
        requiresReview: needsReview,
        format: args.outputFormat,
      },
      timestamp: now,
    });

    // Notify CEO
    await notifyCEOOfCompletion(ctx, {
      jobId: job._id,
      jobType: job.type,
      agentName: agent?.displayName,
      outputPath,
      quality: args.quality,
      requiresReview: needsReview,
      output: args.output,
    });

    // If it's a workflow step, advance the workflow
    if (job.workflowId) {
      await ctx.runMutation(api.pipeline.monitor.advanceWorkflows);
    }

    return {
      success: true,
      outputPath,
      requiresReview: needsReview,
    };
  },
});

/**
 * Queue output for manual review
 */
export const queueForReview = internalMutation({
  args: {
    jobId: v.id("pipelineJobs"),
    reviewerRole: v.optional(v.string()),
    priority: v.optional(v.union(v.literal("p0"), v.literal("p1"), v.literal("p2"))),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const job = await ctx.db.get(args.jobId);
    if (!job) throw new Error("Job not found");

    // Create review task
    const reviewJobId = await ctx.db.insert("pipelineJobs", {
      type: "review",
      status: "pending",
      agentRole: args.reviewerRole || "cso",
      priority: args.priority === "p0" ? 85 : args.priority === "p1" ? 70 : 55,
      priorityLevel: args.priority || "p1",
      createdAt: Date.now(),
      deadline: Date.now() + 24 * 60 * 60 * 1000, // 24 hours
      retryCount: 0,
      maxRetries: 2,
      context: `Review output from job ${args.jobId} (${job.type}). ${args.notes || ""}`,
      triggerType: "manual",
      dependencies: [args.jobId],
    });

    // Mark original job as in review
    await ctx.db.patch(args.jobId, {
      status: "complete", // Still complete, but has review pending
    });

    await ctx.db.insert("activities", {
      type: "task_created",
      pipelineJobId: reviewJobId,
      message: `Review queued for ${job.type} output`,
      metadata: {
        originalJobId: args.jobId,
        reviewerRole: args.reviewerRole,
        priority: args.priority,
      },
      timestamp: Date.now(),
    });

    return { reviewJobId };
  },
});

/**
 * Approve reviewed output
 */
export const approveOutput = internalMutation({
  args: {
    jobId: v.id("pipelineJobs"),
    reviewerId: v.string(),
    feedback: v.optional(v.string()),
    quality: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const job = await ctx.db.get(args.jobId);
    if (!job) throw new Error("Job not found");

    // Update job
    await ctx.db.patch(args.jobId, {
      output: job.output + `\n\n---\nApproved by ${args.reviewerId}${args.feedback ? `: ${args.feedback}` : ""}`,
    });

    // Update associated task
    const tasks = await ctx.db.query("tasks")
      .withIndex("by_pipeline_job", (q) => q.eq("pipelineJobId", job._id))
      .collect();

    for (const task of tasks) {
      await ctx.db.patch(task._id, {
        status: "complete",
        completedAt: Date.now(),
        quality: args.quality,
        reviewFeedback: args.feedback,
      });

      await ctx.db.patch(task._id, {
        notes: [
          ...task.notes,
          {
            text: `Approved by ${args.reviewerId}. Quality: ${args.quality}/5${args.feedback ? `. Feedback: ${args.feedback}` : ""}`,
            author: args.reviewerId,
            timestamp: Date.now(),
          },
        ],
      });
    }

    await ctx.db.insert("activities", {
      type: "task_reviewed",
      pipelineJobId: job._id,
      message: `Output approved: ${job.type}`,
      metadata: {
        reviewer: args.reviewerId,
        quality: args.quality,
        feedback: args.feedback,
      },
      timestamp: Date.now(),
    });

    return { success: true };
  },
});

/**
 * Reject output and request revision
 */
export const rejectOutput = internalMutation({
  args: {
    jobId: v.id("pipelineJobs"),
    reviewerId: v.string(),
    feedback: v.string(),
    reassignToSameAgent: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const job = await ctx.db.get(args.jobId);
    if (!job) throw new Error("Job not found");

    const now = Date.now();

    // Reset job for revision
    await ctx.db.patch(args.jobId, {
      status: args.reassignToSameAgent ? "running" : "pending",
      completedAt: undefined,
      error: `Revision requested by ${args.reviewerId}: ${args.feedback}`,
    });

    // Update associated task
    const tasks = await ctx.db.query("tasks")
      .withIndex("by_pipeline_job", (q) => q.eq("pipelineJobId", job._id))
      .collect();

    for (const task of tasks) {
      await ctx.db.patch(task._id, {
        status: args.reassignToSameAgent ? "in-progress" : "pending",
        reviewFeedback: args.feedback,
      });

      await ctx.db.patch(task._id, {
        notes: [
          ...task.notes,
          {
            text: `Revision requested by ${args.reviewerId}: ${args.feedback}`,
            author: args.reviewerId,
            timestamp: now,
          },
        ],
      });
    }

    // If not reassigning to same agent, release them
    if (!args.reassignToSameAgent && job.assignedAgent) {
      await ctx.runMutation(api.pipeline.router.releaseAgent, {
        agentId: job.assignedAgent,
        jobId: job._id,
      });
    }

    await ctx.db.insert("activities", {
      type: "task_reviewed",
      pipelineJobId: job._id,
      message: `Output rejected, revision requested: ${job.type}`,
      metadata: {
        reviewer: args.reviewerId,
        feedback: args.feedback,
        reassignToSameAgent: args.reassignToSameAgent,
      },
      timestamp: now,
    });

    return { success: true };
  },
});

/**
 * Store output to file system (placeholder for actual implementation)
 */
export const storeOutputToFile = internalMutation({
  args: {
    content: v.string(),
    path: v.string(),
    format: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // In a real implementation, this would write to the file system
    // or upload to cloud storage (S3, etc.)
    
    console.log(`[STORAGE] Would write to ${args.path}`);
    
    // For now, just log the operation
    return {
      success: true,
      path: args.path,
      size: args.content.length,
    };
  },
});

/**
 * Schedule content to Postiz
 */
export const scheduleToPostiz = internalMutation({
  args: {
    jobId: v.id("pipelineJobs"),
    content: v.string(),
    platform: v.union(
      v.literal("twitter"),
      v.literal("threads"),
      v.literal("instagram"),
      v.literal("linkedin")
    ),
    scheduledTime: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    // In a real implementation, this would integrate with Postiz API
    console.log(`[POSTIZ] Would schedule to ${args.platform}:`, args.content.substring(0, 100));

    const job = await ctx.db.get(args.jobId);
    
    await ctx.db.insert("activities", {
      type: "output_delivered",
      pipelineJobId: job?._id,
      message: `Content scheduled to ${args.platform}`,
      metadata: {
        platform: args.platform,
        scheduledTime: args.scheduledTime,
        contentPreview: args.content.substring(0, 200),
      },
      timestamp: Date.now(),
    });

    return { success: true, platform: args.platform };
  },
});

/**
 * Get outputs pending review
 */
export const getPendingReviews = query({
  args: {},
  handler: async (ctx) => {
    const tasks = await ctx.db.query("tasks")
      .withIndex("by_status", (q) => q.eq("status", "review"))
      .collect();

    return tasks.map(task => ({
      taskId: task._id,
      title: task.title,
      description: task.description,
      assignedTo: task.assignedTo,
      output: task.output,
      outputSummary: task.outputSummary,
      quality: task.quality,
      createdAt: task.createdAt,
      daysPending: Math.floor((Date.now() - (task.completedAt || task.createdAt)) / (24 * 60 * 60 * 1000)),
    }));
  },
});

/**
 * Get recent deliveries
 */
export const getRecentDeliveries = query({
  args: {
    limit: v.optional(v.number()),
    hours: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit || 20;
    const since = args.hours 
      ? Date.now() - args.hours * 60 * 60 * 1000
      : Date.now() - 24 * 60 * 60 * 1000;

    const activities = await ctx.db.query("activities")
      .withIndex("by_timestamp", (q) => 
        q.gte("timestamp", since)
      )
      .filter((q) => q.eq(q.field("type"), "output_delivered"))
      .order("desc")
      .take(limit);

    return activities.map(activity => ({
      id: activity._id,
      type: activity.metadata?.jobType,
      message: activity.message,
      outputPath: activity.metadata?.outputPath,
      quality: activity.metadata?.quality,
      requiresReview: activity.metadata?.requiresReview,
      timestamp: activity.timestamp,
      agentRole: activity.agentRole,
    }));
  },
});

/**
 * Send daily digest to CEO
 */
export const sendDailyDigest = internalMutation({
  args: {},
  handler: async (ctx) => {
    const since = Date.now() - 24 * 60 * 60 * 1000;

    // Get completed jobs
    const completedJobs = await ctx.db.query("pipelineJobs")
      .withIndex("by_status", (q) => q.eq("status", "complete"))
      .filter((q) => q.gte(q.field("completedAt"), since))
      .collect();

    // Get failed jobs
    const failedJobs = await ctx.db.query("pipelineJobs")
      .withIndex("by_status", (q) => q.eq("status", "failed"))
      .filter((q) => q.gte(q.field("completedAt"), since))
      .collect();

    // Get pending reviews
    const pendingReviews = await ctx.db.query("tasks")
      .withIndex("by_status", (q) => q.eq("status", "review"))
      .collect();

    // Generate digest
    const digest = {
      date: new Date().toISOString().split("T")[0],
      summary: {
        completed: completedJobs.length,
        failed: failedJobs.length,
        pendingReview: pendingReviews.length,
      },
      highlights: completedJobs
        .filter(j => j.priorityLevel === "p0")
        .map(j => ({
          type: j.type,
          outputPath: j.outputPath,
        })),
      issues: failedJobs.map(j => ({
        type: j.type,
        error: j.error,
        retryCount: j.retryCount,
      })),
    };

    // Find CEO
    const ceo = await ctx.db.query("agents")
      .withIndex("by_role", (q) => q.eq("role", "ceo"))
      .first();

    if (ceo) {
      // In real implementation, send email/notification
      console.log(`[DAILY DIGEST] Sent to CEO:`, digest);

      await ctx.db.insert("activities", {
        type: "output_delivered",
        agentId: ceo._id,
        message: `Daily digest sent: ${completedJobs.length} completed, ${failedJobs.length} failed`,
        metadata: digest,
        timestamp: Date.now(),
      });
    }

    return digest;
  },
});

// ==================== HELPER FUNCTIONS ====================

function generateFilename(job: any): string {
  const date = new Date();
  const dateStr = date.toISOString().split("T")[0];
  const timeStr = date.toTimeString().split(":")[0];
  const type = job.type.replace(/_/g, "-");
  const trigger = job.triggerSource?.replace(/\s+/g, "-").toLowerCase() || "auto";
  
  return `${type}_${trigger}_${dateStr}_${timeStr}.md`;
}

async function notifyCEOOfCompletion(ctx: any, notification: any) {
  // Find CEO
  const ceo = await ctx.db.query("agents")
    .withIndex("by_role", (q) => q.eq("role", "ceo"))
    .first();

  if (!ceo) return;

  const config = await ctx.db.query("pipelineConfig").first();
  
  // Determine if notification should be sent
  const shouldNotify = 
    notification.requiresReview ||
    notification.quality !== undefined && notification.quality < 4 ||
    config?.notifyOn?.taskComplete;

  if (!shouldNotify) return;

  // In real implementation, send notification
  console.log(`[NOTIFY CEO] Task ${notification.jobType} completed by ${notification.agentName}`);

  // Create notification record
  await ctx.db.insert("activities", {
    type: "output_delivered",
    agentId: ceo._id,
    pipelineJobId: notification.jobId,
    message: notification.requiresReview
      ? `Output ready for review: ${notification.jobType}`
      : `Task completed: ${notification.jobType}`,
    metadata: {
      notificationType: "completion",
      ...notification,
    },
    timestamp: Date.now(),
  });
}
