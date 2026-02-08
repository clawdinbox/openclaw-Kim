import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { Id } from "./_generated/dataModel";

// ==================== QUERIES ====================

export const listByProject = query({
  args: { projectId: v.id("projects") },
  handler: async (ctx, args) => {
    const tasks = await ctx.db
      .query("projectTasks")
      .withIndex("by_project", (q) => q.eq("projectId", args.projectId))
      .order("asc")
      .collect();

    // Enrich with assignee info
    const enriched = await Promise.all(
      tasks.map(async (task) => {
        const assignee = await ctx.db.get(task.assignedTo);
        
        // Get dependency info
        const dependencies = await Promise.all(
          task.dependencies.map((depId) => ctx.db.get(depId))
        );

        return {
          ...task,
          assigneeInfo: assignee
            ? {
                id: assignee._id,
                name: assignee.displayName,
                avatar: assignee.avatar,
                role: assignee.role,
              }
            : null,
          dependenciesInfo: dependencies
            .filter((d) => d !== null)
            .map((d) => ({
              id: d!._id,
              title: d!.title,
              status: d!.status,
            })),
        };
      })
    );

    return enriched;
  },
});

export const getById = query({
  args: { id: v.id("projectTasks") },
  handler: async (ctx, args) => {
    const task = await ctx.db.get(args.id);
    if (!task) return null;

    const assignee = await ctx.db.get(task.assignedTo);
    const project = await ctx.db.get(task.projectId);
    
    const dependencies = await Promise.all(
      task.dependencies.map((depId) => ctx.db.get(depId))
    );

    return {
      ...task,
      assigneeInfo: assignee
        ? {
            id: assignee._id,
            name: assignee.displayName,
            avatar: assignee.avatar,
            role: assignee.role,
          }
        : null,
      projectInfo: project
        ? {
            id: project._id,
            name: project.name,
          }
        : null,
      dependenciesInfo: dependencies
        .filter((d) => d !== null)
        .map((d) => ({
          id: d!._id,
          title: d!.title,
          status: d!.status,
        })),
    };
  },
});

export const getForAgent = query({
  args: { agentId: v.id("agents") },
  handler: async (ctx, args) => {
    const tasks = await ctx.db
      .query("projectTasks")
      .withIndex("by_assigned", (q) => q.eq("assignedTo", args.agentId))
      .filter((q) => q.neq(q.field("status"), "done"))
      .order("desc")
      .take(50);

    const enriched = await Promise.all(
      tasks.map(async (task) => {
        const project = await ctx.db.get(task.projectId);
        return {
          ...task,
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
    title: v.string(),
    description: v.string(),
    assignedTo: v.id("agents"),
    priority: v.union(v.literal("p0"), v.literal("p1"), v.literal("p2")),
    estimatedHours: v.optional(v.number()),
    dependencies: v.optional(v.array(v.id("projectTasks"))),
  },
  handler: async (ctx, args) => {
    const now = Date.now();

    // Get max order for this status
    const existingTasks = await ctx.db
      .query("projectTasks")
      .withIndex("by_project_status", (q) =>
        q.eq("projectId", args.projectId).eq("status", "todo")
      )
      .collect();
    
    const maxOrder = existingTasks.reduce((max, t) => Math.max(max, t.order), -1);

    const taskId = await ctx.db.insert("projectTasks", {
      projectId: args.projectId,
      title: args.title,
      description: args.description,
      assignedTo: args.assignedTo,
      status: "todo",
      priority: args.priority,
      dependencies: args.dependencies || [],
      estimatedHours: args.estimatedHours,
      actualHours: undefined,
      createdAt: now,
      startedAt: undefined,
      completedAt: undefined,
      order: maxOrder + 1,
    });

    // Log project update
    await ctx.db.insert("projectUpdates", {
      projectId: args.projectId,
      agentId: args.assignedTo,
      message: `New task created: "${args.title}"`,
      type: "progress",
      timestamp: now,
    });

    return taskId;
  },
});

export const updateStatus = mutation({
  args: {
    id: v.id("projectTasks"),
    status: v.union(
      v.literal("todo"),
      v.literal("in-progress"),
      v.literal("review"),
      v.literal("done")
    ),
  },
  handler: async (ctx, args) => {
    const task = await ctx.db.get(args.id);
    if (!task) return false;

    const now = Date.now();
    const updates: any = { status: args.status };

    // Track timestamps
    if (args.status === "in-progress" && !task.startedAt) {
      updates.startedAt = now;
    }
    if (args.status === "done" && !task.completedAt) {
      updates.completedAt = now;
      
      // Calculate actual hours if we have a start time
      if (task.startedAt) {
        updates.actualHours = Math.round((now - task.startedAt) / (1000 * 60 * 60) * 10) / 10;
      }
    }

    await ctx.db.patch(args.id, updates);

    // Update project progress
    await ctx.scheduler.runAfter(0, api.projects.updateProgress, { id: task.projectId });

    // Log project update
    const statusLabels: Record<string, string> = {
      todo: "To Do",
      "in-progress": "In Progress",
      review: "Review",
      done: "Done",
    };

    await ctx.db.insert("projectUpdates", {
      projectId: task.projectId,
      agentId: task.assignedTo,
      message: `Task "${task.title}" moved to ${statusLabels[args.status]}`,
      type: args.status === "done" ? "milestone" : "progress",
      timestamp: now,
    });

    return true;
  },
});

export const assign = mutation({
  args: {
    id: v.id("projectTasks"),
    assignedTo: v.id("agents"),
  },
  handler: async (ctx, args) => {
    const task = await ctx.db.get(args.id);
    if (!task) return false;

    await ctx.db.patch(args.id, { assignedTo: args.assignedTo });

    // Log project update
    const agent = await ctx.db.get(args.assignedTo);
    await ctx.db.insert("projectUpdates", {
      projectId: task.projectId,
      agentId: args.assignedTo,
      message: `Task "${task.title}" assigned to ${agent?.displayName || "unknown"}`,
      type: "decision",
      timestamp: Date.now(),
    });

    return true;
  },
});

export const reorder = mutation({
  args: {
    id: v.id("projectTasks"),
    newOrder: v.number(),
  },
  handler: async (ctx, args) => {
    const task = await ctx.db.get(args.id);
    if (!task) return false;

    await ctx.db.patch(args.id, { order: args.newOrder });
    return true;
  },
});

export const update = mutation({
  args: {
    id: v.id("projectTasks"),
    title: v.optional(v.string()),
    description: v.optional(v.string()),
    priority: v.optional(v.union(v.literal("p0"), v.literal("p1"), v.literal("p2"))),
    estimatedHours: v.optional(v.number()),
    dependencies: v.optional(v.array(v.id("projectTasks"))),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;
    const task = await ctx.db.get(id);
    if (!task) return false;

    await ctx.db.patch(id, updates);
    return true;
  },
});

export const deleteTask = mutation({
  args: { id: v.id("projectTasks") },
  handler: async (ctx, args) => {
    const task = await ctx.db.get(args.id);
    if (!task) return false;

    await ctx.db.delete(args.id);

    // Update project progress
    await ctx.scheduler.runAfter(0, api.projects.updateProgress, { id: task.projectId });

    return true;
  },
});

export const logHours = mutation({
  args: {
    id: v.id("projectTasks"),
    hours: v.number(),
  },
  handler: async (ctx, args) => {
    const task = await ctx.db.get(args.id);
    if (!task) return false;

    const currentHours = task.actualHours || 0;
    await ctx.db.patch(args.id, {
      actualHours: currentHours + args.hours,
    });

    return true;
  },
});

// Need to import api for scheduler
import { api } from "./_generated/api";
