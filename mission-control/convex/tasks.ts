import { v } from "convex/values";
import {
  query,
  mutation,
  internalQuery,
  internalMutation,
} from "./_generated/server";

// ==================== QUERIES ====================

export const list = query({
  args: {
    status: v.optional(v.string()),
    assignedTo: v.optional(v.string()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    let tasks;
    
    if (args.status) {
      tasks = await ctx.db
        .query("tasks")
        .withIndex("by_status", (q) => q.eq("status", args.status))
        .take(args.limit || 100);
    } else if (args.assignedTo) {
      tasks = await ctx.db
        .query("tasks")
        .withIndex("by_assigned", (q) => q.eq("assignedTo", args.assignedTo))
        .take(args.limit || 100);
    } else {
      tasks = await ctx.db
        .query("tasks")
        .withIndex("by_created")
        .order("desc")
        .take(args.limit || 100);
    }

    // Enrich with agent info
    const enriched = await Promise.all(
      tasks.map(async (task) => {
        const agent = task.assignedToId
          ? await ctx.db.get(task.assignedToId)
          : null;
        return {
          ...task,
          assignedAgent: agent
            ? {
                id: agent._id,
                name: agent.displayName,
                avatar: agent.avatar,
              }
            : null,
        };
      })
    );

    return enriched;
  },
});

export const getById = query({
  args: { id: v.id("tasks") },
  handler: async (ctx, args) => {
    const task = await ctx.db.get(args.id);
    if (!task) return null;

    const agent = task.assignedToId
      ? await ctx.db.get(task.assignedToId)
      : null;

    return {
      ...task,
      assignedAgent: agent
        ? {
            id: agent._id,
            name: agent.displayName,
            avatar: agent.avatar,
            status: agent.status,
          }
        : null,
    };
  },
});

export const getDashboard = query({
  args: {},
  handler: async (ctx) => {
    const all = await ctx.db.query("tasks").collect();
    
    const pending = all.filter((t) => t.status === "pending");
    const inProgress = all.filter((t) => t.status === "in-progress");
    const review = all.filter((t) => t.status === "review");
    const completed = all.filter((t) => t.status === "complete").slice(-10);

    // Group by assignee
    const byAssignee = all.reduce((acc, task) => {
      if (!acc[task.assignedTo]) acc[task.assignedTo] = [];
      acc[task.assignedTo].push(task);
      return acc;
    }, {} as Record<string, typeof all>);

    return {
      counts: {
        total: all.length,
        pending: pending.length,
        inProgress: inProgress.length,
        review: review.length,
        complete: all.filter((t) => t.status === "complete").length,
      },
      pending,
      inProgress,
      review,
      recentCompleted: completed.reverse(),
      byAssignee,
    };
  },
});

export const getForAgent = query({
  args: { role: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("tasks")
      .withIndex("by_assigned", (q) => q.eq("assignedTo", args.role))
      .filter((q) => q.neq(q.field("status"), "complete"))
      .order("desc")
      .take(20);
  },
});

// ==================== MUTATIONS ====================

export const create = mutation({
  args: {
    title: v.string(),
    description: v.string(),
    assignedTo: v.string(),
    delegatedBy: v.string(),
    priority: v.union(v.literal("p0"), v.literal("p1"), v.literal("p2")),
    category: v.optional(v.string()),
    dueAt: v.optional(v.number()),
    context: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    
    // Find the agent by role
    const agent = await ctx.db
      .query("agents")
      .withIndex("by_role", (q) => q.eq("role", args.assignedTo))
      .first();

    const taskId = await ctx.db.insert("tasks", {
      ...args,
      assignedToId: agent?._id,
      status: "pending",
      createdAt: now,
      notes: [],
    });

    // Log activity
    await ctx.db.insert("activities", {
      type: "task_created",
      agentId: agent?._id,
      agentRole: args.assignedTo,
      taskId,
      message: `New task "${args.title}" assigned to ${args.assignedTo}`,
      timestamp: now,
    });

    return taskId;
  },
});

export const start = mutation({
  args: { id: v.id("tasks") },
  handler: async (ctx, args) => {
    const task = await ctx.db.get(args.id);
    if (!task) return false;

    await ctx.db.patch(args.id, {
      status: "in-progress",
      startedAt: Date.now(),
    });

    // Update agent status
    if (task.assignedToId) {
      await ctx.db.patch(task.assignedToId, {
        status: "working",
        currentTask: task.title,
        currentTaskId: args.id,
      });
    }

    // Log activity
    await ctx.db.insert("activities", {
      type: "task_started",
      agentId: task.assignedToId,
      agentRole: task.assignedTo,
      taskId: args.id,
      message: `Task "${task.title}" started`,
      timestamp: Date.now(),
    });

    return true;
  },
});

export const submitForReview = mutation({
  args: {
    id: v.id("tasks"),
    output: v.string(),
    outputSummary: v.string(),
  },
  handler: async (ctx, args) => {
    const { id, output, outputSummary } = args;
    
    await ctx.db.patch(id, {
      status: "review",
      output,
      outputSummary,
    });

    const task = await ctx.db.get(id);
    if (task?.assignedToId) {
      await ctx.db.patch(task.assignedToId, {
        lastOutput: outputSummary,
      });
    }

    // Log activity
    await ctx.db.insert("activities", {
      type: "output_delivered",
      agentId: task?.assignedToId,
      agentRole: task?.assignedTo,
      taskId: id,
      message: `Output delivered for "${task?.title}"`,
      metadata: { outputPath: output },
      timestamp: Date.now(),
    });

    return true;
  },
});

export const approve = mutation({
  args: {
    id: v.id("tasks"),
    quality: v.optional(v.number()),
    feedback: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    const task = await ctx.db.get(args.id);
    if (!task) return false;

    await ctx.db.patch(args.id, {
      status: "complete",
      completedAt: now,
      quality: args.quality,
      reviewFeedback: args.feedback,
    });

    // Update agent stats
    if (task.assignedToId) {
      const agent = await ctx.db.get(task.assignedToId);
      if (agent) {
        const completed = agent.performance.tasksCompleted + 1;
        const currentAvg = agent.performance.avgQuality;
        const newQuality = args.quality || 4;
        const newAvg = (currentAvg * (completed - 1) + newQuality) / completed;

        await ctx.db.patch(task.assignedToId, {
          status: "idle",
          currentTask: undefined,
          currentTaskId: undefined,
          "performance.tasksCompleted": completed,
          "performance.avgQuality": newAvg,
        });
      }
    }

    // Log activity
    await ctx.db.insert("activities", {
      type: "task_completed",
      agentId: task.assignedToId,
      agentRole: task.assignedTo,
      taskId: args.id,
      message: `Task "${task.title}" completed${args.quality ? ` (quality: ${args.quality}/5)` : ""}`,
      metadata: { quality: args.quality },
      timestamp: now,
    });

    return true;
  },
});

export const requestRevision = mutation({
  args: {
    id: v.id("tasks"),
    feedback: v.string(),
  },
  handler: async (ctx, args) => {
    const task = await ctx.db.get(args.id);
    if (!task) return false;

    const notes = [
      ...task.notes,
      {
        text: `Revision requested: ${args.feedback}`,
        author: "cso",
        timestamp: Date.now(),
      },
    ];

    await ctx.db.patch(args.id, {
      status: "in-progress",
      notes,
      reviewFeedback: args.feedback,
    });

    return true;
  },
});

export const addNote = mutation({
  args: {
    id: v.id("tasks"),
    text: v.string(),
    author: v.string(),
  },
  handler: async (ctx, args) => {
    const task = await ctx.db.get(args.id);
    if (!task) return false;

    const notes = [
      ...task.notes,
      {
        text: args.text,
        author: args.author,
        timestamp: Date.now(),
      },
    ];

    await ctx.db.patch(args.id, { notes });
    return true;
  },
});

export const cancel = mutation({
  args: { id: v.id("tasks") },
  handler: async (ctx, args) => {
    const task = await ctx.db.get(args.id);
    if (!task) return false;

    await ctx.db.patch(args.id, {
      status: "cancelled",
    });

    if (task.assignedToId) {
      await ctx.db.patch(task.assignedToId, {
        status: "idle",
        currentTask: undefined,
        currentTaskId: undefined,
      });
    }

    return true;
  },
});

export const deleteAll = mutation({
  args: {},
  handler: async (ctx) => {
    const tasks = await ctx.db.query("tasks").collect();
    for (const task of tasks) {
      await ctx.db.delete(task._id);
    }
    return tasks.length;
  },
});
