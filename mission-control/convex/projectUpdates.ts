import { v } from "convex/values";
import { query, mutation } from "./_generated/server";

// ==================== QUERIES ====================

export const list = query({
  args: {
    projectId: v.id("projects"),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const updates = await ctx.db
      .query("projectUpdates")
      .withIndex("by_project", (q) => q.eq("projectId", args.projectId))
      .order("desc")
      .take(args.limit || 50);

    // Enrich with agent info
    const enriched = await Promise.all(
      updates.map(async (update) => {
        const agent = await ctx.db.get(update.agentId);
        return {
          ...update,
          agentInfo: agent
            ? {
                id: agent._id,
                name: agent.displayName,
                avatar: agent.avatar,
                role: agent.role,
              }
            : null,
        };
      })
    );

    return enriched;
  },
});

export const getRecent = query({
  args: {
    limit: v.optional(v.number()),
    type: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    let updates;
    
    if (args.type) {
      updates = await ctx.db
        .query("projectUpdates")
        .filter((q) => q.eq(q.field("type"), args.type))
        .order("desc")
        .take(args.limit || 20);
    } else {
      updates = await ctx.db
        .query("projectUpdates")
        .withIndex("by_timestamp")
        .order("desc")
        .take(args.limit || 20);
    }

    const enriched = await Promise.all(
      updates.map(async (update) => {
        const [agent, project] = await Promise.all([
          ctx.db.get(update.agentId),
          ctx.db.get(update.projectId),
        ]);
        
        return {
          ...update,
          agentInfo: agent
            ? {
                id: agent._id,
                name: agent.displayName,
                avatar: agent.avatar,
              }
            : null,
          projectInfo: project
            ? {
                id: project._id,
                name: project.name,
                folder: project.folder,
              }
            : null,
        };
      })
    );

    return enriched;
  },
});

export const getBlockers = query({
  args: {},
  handler: async (ctx) => {
    const updates = await ctx.db
      .query("projectUpdates")
      .filter((q) => q.eq(q.field("type"), "blocker"))
      .order("desc")
      .take(20);

    const enriched = await Promise.all(
      updates.map(async (update) => {
        const [agent, project] = await Promise.all([
          ctx.db.get(update.agentId),
          ctx.db.get(update.projectId),
        ]);
        
        return {
          ...update,
          agentInfo: agent
            ? {
                id: agent._id,
                name: agent.displayName,
                avatar: agent.avatar,
              }
            : null,
          projectInfo: project
            ? {
                id: project._id,
                name: project.name,
                folder: project.folder,
              }
            : null,
        };
      })
    );

    return enriched;
  },
});

// ==================== MUTATIONS ====================

export const create = mutation({
  args: {
    projectId: v.id("projects"),
    agentId: v.id("agents"),
    message: v.string(),
    type: v.union(
      v.literal("progress"),
      v.literal("blocker"),
      v.literal("milestone"),
      v.literal("decision")
    ),
  },
  handler: async (ctx, args) => {
    const timestamp = Date.now();
    
    const updateId = await ctx.db.insert("projectUpdates", {
      ...args,
      timestamp,
    });

    // Also log to main activity feed for visibility
    const project = await ctx.db.get(args.projectId);
    const agent = await ctx.db.get(args.agentId);
    
    if (project && agent) {
      await ctx.db.insert("activities", {
        type: "status_changed",
        agentId: args.agentId,
        agentRole: agent.role,
        message: `[${project.name}] ${args.message}`,
        metadata: {
          projectId: args.projectId,
          projectName: project.name,
          updateType: args.type,
        },
        timestamp,
      });
    }

    return updateId;
  },
});

export const resolveBlocker = mutation({
  args: {
    id: v.id("projectUpdates"),
    resolution: v.string(),
  },
  handler: async (ctx, args) => {
    const update = await ctx.db.get(args.id);
    if (!update || update.type !== "blocker") return false;

    // Add a follow-up update indicating resolution
    await ctx.db.insert("projectUpdates", {
      projectId: update.projectId,
      agentId: update.agentId,
      message: `Blocker resolved: ${args.resolution}`,
      type: "progress",
      timestamp: Date.now(),
    });

    return true;
  },
});

export const deleteUpdate = mutation({
  args: { id: v.id("projectUpdates") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
    return true;
  },
});
