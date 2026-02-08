import { v } from "convex/values";
import { query, mutation } from "./_generated/server";

// ==================== QUERIES ====================

export const list = query({
  args: {
    limit: v.optional(v.number()),
    type: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    let activities;
    
    if (args.type) {
      activities = await ctx.db
        .query("activities")
        .withIndex("by_type", (q) => q.eq("type", args.type))
        .order("desc")
        .take(args.limit || 50);
    } else {
      activities = await ctx.db
        .query("activities")
        .withIndex("by_timestamp")
        .order("desc")
        .take(args.limit || 50);
    }

    // Enrich with agent info
    const enriched = await Promise.all(
      activities.map(async (activity) => {
        const agent = activity.agentId
          ? await ctx.db.get(activity.agentId)
          : null;
        const task = activity.taskId
          ? await ctx.db.get(activity.taskId)
          : null;
        
        return {
          ...activity,
          agent: agent
            ? {
                id: agent._id,
                name: agent.displayName,
                avatar: agent.avatar,
              }
            : null,
          task: task
            ? {
                id: task._id,
                title: task.title,
              }
            : null,
        };
      })
    );

    return enriched;
  },
});

export const getRecent = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const activities = await ctx.db
      .query("activities")
      .withIndex("by_timestamp")
      .order("desc")
      .take(args.limit || 20);

    return activities;
  },
});

export const getForAgent = query({
  args: {
    agentId: v.id("agents"),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("activities")
      .withIndex("by_agent", (q) => q.eq("agentId", args.agentId))
      .order("desc")
      .take(args.limit || 20);
  },
});

// ==================== MUTATIONS ====================

export const create = mutation({
  args: {
    type: v.union(
      v.literal("agent_spawned"),
      v.literal("task_created"),
      v.literal("task_started"),
      v.literal("task_completed"),
      v.literal("task_reviewed"),
      v.literal("output_delivered"),
      v.literal("status_changed")
    ),
    agentId: v.optional(v.id("agents")),
    agentRole: v.optional(v.string()),
    taskId: v.optional(v.id("tasks")),
    message: v.string(),
    metadata: v.optional(v.any()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("activities", {
      ...args,
      timestamp: Date.now(),
    });
  },
});

export const deleteOld = mutation({
  args: {
    olderThan: v.number(), // timestamp
  },
  handler: async (ctx, args) => {
    const activities = await ctx.db
      .query("activities")
      .withIndex("by_timestamp")
      .filter((q) => q.lt(q.field("timestamp"), args.olderThan))
      .collect();

    for (const activity of activities) {
      await ctx.db.delete(activity._id);
    }

    return activities.length;
  },
});
