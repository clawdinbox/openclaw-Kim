import { v } from "convex/values";
import { query, mutation, internalMutation } from "./_generated/server";
import { Id } from "./_generated/dataModel";

// ==================== TYPES ====================

type ProjectStatus = "planning" | "active" | "on-hold" | "completed" | "cancelled";
type ProjectPriority = "p0" | "p1" | "p2";

// ==================== QUERIES ====================

export const list = query({
  args: {
    status: v.optional(v.string()),
    folder: v.optional(v.string()),
    priority: v.optional(v.string()),
    owner: v.optional(v.id("agents")),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    let projects;

    if (args.status) {
      projects = await ctx.db
        .query("projects")
        .withIndex("by_status", (q) => q.eq("status", args.status))
        .take(args.limit || 100);
    } else if (args.folder) {
      projects = await ctx.db
        .query("projects")
        .withIndex("by_folder", (q) => q.eq("folder", args.folder))
        .take(args.limit || 100);
    } else if (args.priority) {
      projects = await ctx.db
        .query("projects")
        .withIndex("by_priority", (q) => q.eq("priority", args.priority))
        .take(args.limit || 100);
    } else if (args.owner) {
      projects = await ctx.db
        .query("projects")
        .withIndex("by_owner", (q) => q.eq("owner", args.owner))
        .take(args.limit || 100);
    } else {
      projects = await ctx.db
        .query("projects")
        .order("desc")
        .take(args.limit || 100);
    }

    // Enrich with owner info
    const enriched = await Promise.all(
      projects.map(async (project) => {
        const owner = await ctx.db.get(project.owner);
        const team = await Promise.all(
          project.team.map((id) => ctx.db.get(id))
        );
        
        // Get task counts
        const tasks = await ctx.db
          .query("projectTasks")
          .withIndex("by_project", (q) => q.eq("projectId", project._id))
          .collect();
        
        const taskCounts = {
          total: tasks.length,
          todo: tasks.filter((t) => t.status === "todo").length,
          inProgress: tasks.filter((t) => t.status === "in-progress").length,
          review: tasks.filter((t) => t.status === "review").length,
          done: tasks.filter((t) => t.status === "done").length,
        };

        return {
          ...project,
          ownerInfo: owner
            ? {
                id: owner._id,
                name: owner.displayName,
                avatar: owner.avatar,
              }
            : null,
          teamInfo: team
            .filter((t) => t !== null)
            .map((t) => ({
              id: t!._id,
              name: t!.displayName,
              avatar: t!.avatar,
            })),
          taskCounts,
        };
      })
    );

    return enriched;
  },
});

export const get = query({
  args: { id: v.id("projects") },
  handler: async (ctx, args) => {
    const project = await ctx.db.get(args.id);
    if (!project) return null;

    const owner = await ctx.db.get(project.owner);
    const team = await Promise.all(
      project.team.map((id) => ctx.db.get(id))
    );

    // Get all tasks for this project
    const tasks = await ctx.db
      .query("projectTasks")
      .withIndex("by_project", (q) => q.eq("projectId", args.id))
      .collect();

    // Enrich tasks with assignee info
    const enrichedTasks = await Promise.all(
      tasks.map(async (task) => {
        const assignee = await ctx.db.get(task.assignedTo);
        return {
          ...task,
          assigneeInfo: assignee
            ? {
                id: assignee._id,
                name: assignee.displayName,
                avatar: assignee.avatar,
              }
            : null,
        };
      })
    );

    // Get recent updates
    const updates = await ctx.db
      .query("projectUpdates")
      .withIndex("by_project", (q) => q.eq("projectId", args.id))
      .order("desc")
      .take(20);

    const enrichedUpdates = await Promise.all(
      updates.map(async (update) => {
        const agent = await ctx.db.get(update.agentId);
        return {
          ...update,
          agentInfo: agent
            ? {
                id: agent._id,
                name: agent.displayName,
                avatar: agent.avatar,
              }
            : null,
        };
      })
    );

    return {
      ...project,
      ownerInfo: owner
        ? {
            id: owner._id,
            name: owner.displayName,
            avatar: owner.avatar,
          }
        : null,
      teamInfo: team
        .filter((t) => t !== null)
        .map((t) => ({
          id: t!._id,
          name: t!.displayName,
          avatar: t!.avatar,
        })),
      tasks: enrichedTasks,
      updates: enrichedUpdates,
    };
  },
});

export const getDashboard = query({
  args: {},
  handler: async (ctx) => {
    const all = await ctx.db.query("projects").collect();

    const active = all.filter((p) => p.status === "active");
    const planning = all.filter((p) => p.status === "planning");
    const onHold = all.filter((p) => p.status === "on-hold");
    const completed = all.filter((p) => p.status === "completed");

    // Calculate overdue projects
    const now = Date.now();
    const overdue = active.filter(
      (p) => p.targetDate && p.targetDate < now
    );

    // Projects completed this week
    const oneWeekAgo = now - 7 * 24 * 60 * 60 * 1000;
    const completedThisWeek = completed.filter(
      (p) => p.completedAt && p.completedAt > oneWeekAgo
    );

    // Group by folder
    const byFolder = all.reduce((acc, project) => {
      if (!acc[project.folder]) acc[project.folder] = [];
      acc[project.folder].push(project);
      return acc;
    }, {} as Record<string, typeof all>);

    return {
      counts: {
        total: all.length,
        active: active.length,
        planning: planning.length,
        onHold: onHold.length,
        completed: completed.length,
        overdue: overdue.length,
        completedThisWeek: completedThisWeek.length,
      },
      byFolder,
      recentProjects: all
        .sort((a, b) => b.startDate - a.startDate)
        .slice(0, 10),
    };
  },
});

export const getFolders = query({
  args: {},
  handler: async (ctx) => {
    const projects = await ctx.db.query("projects").collect();
    
    const folders = projects.reduce((acc, project) => {
      if (!acc[project.folder]) {
        acc[project.folder] = {
          name: project.folder,
          count: 0,
          activeCount: 0,
        };
      }
      acc[project.folder].count++;
      if (project.status === "active") {
        acc[project.folder].activeCount++;
      }
      return acc;
    }, {} as Record<string, { name: string; count: number; activeCount: number }>);

    return Object.values(folders).sort((a, b) => b.count - a.count);
  },
});

// ==================== MUTATIONS ====================

export const create = mutation({
  args: {
    name: v.string(),
    description: v.string(),
    priority: v.union(v.literal("p0"), v.literal("p1"), v.literal("p2")),
    owner: v.id("agents"),
    team: v.array(v.id("agents")),
    folder: v.string(),
    targetDate: v.optional(v.number()),
    tags: v.optional(v.array(v.string())),
    template: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    
    const projectId = await ctx.db.insert("projects", {
      name: args.name,
      description: args.description,
      status: "planning",
      priority: args.priority,
      owner: args.owner,
      team: args.team,
      startDate: now,
      targetDate: args.targetDate,
      completedAt: undefined,
      progress: 0,
      tags: args.tags || [],
      folder: args.folder,
      template: args.template,
    });

    // Create initial tasks from template if specified
    if (args.template) {
      const template = await ctx.db
        .query("projectTemplates")
        .filter((q) => q.eq(q.field("name"), args.template))
        .first();

      if (template) {
        for (let i = 0; i < template.defaultTasks.length; i++) {
          const taskTemplate = template.defaultTasks[i];
          
          // Find agent by role for assignment
          const agent = await ctx.db
            .query("agents")
            .withIndex("by_role", (q) => q.eq("role", taskTemplate.assigneeRole))
            .first();

          await ctx.db.insert("projectTasks", {
            projectId,
            title: taskTemplate.title,
            description: taskTemplate.description,
            assignedTo: agent?._id || args.owner,
            status: "todo",
            priority: taskTemplate.priority,
            dependencies: [],
            estimatedHours: taskTemplate.estimatedHours,
            actualHours: undefined,
            createdAt: now,
            startedAt: undefined,
            completedAt: undefined,
            order: i,
          });
        }
      }
    }

    // Log activity
    await ctx.db.insert("activities", {
      type: "task_created",
      agentId: args.owner,
      message: `Project "${args.name}" created in ${args.folder}`,
      metadata: { projectId, folder: args.folder },
      timestamp: now,
    });

    // Create project update
    await ctx.db.insert("projectUpdates", {
      projectId,
      agentId: args.owner,
      message: "Project created",
      type: "milestone",
      timestamp: now,
    });

    return projectId;
  },
});

export const update = mutation({
  args: {
    id: v.id("projects"),
    name: v.optional(v.string()),
    description: v.optional(v.string()),
    status: v.optional(
      v.union(
        v.literal("planning"),
        v.literal("active"),
        v.literal("on-hold"),
        v.literal("completed"),
        v.literal("cancelled")
      )
    ),
    priority: v.optional(v.union(v.literal("p0"), v.literal("p1"), v.literal("p2"))),
    targetDate: v.optional(v.number()),
    progress: v.optional(v.number()),
    tags: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;
    const project = await ctx.db.get(id);
    if (!project) return false;

    const updateData: any = { ...updates };
    
    // If marking as completed, set completedAt
    if (updates.status === "completed" && project.status !== "completed") {
      updateData.completedAt = Date.now();
      updateData.progress = 100;
    }

    await ctx.db.patch(id, updateData);

    // Log status change
    if (updates.status && updates.status !== project.status) {
      await ctx.db.insert("projectUpdates", {
        projectId: id,
        agentId: project.owner,
        message: `Status changed from ${project.status} to ${updates.status}`,
        type: "progress",
        timestamp: Date.now(),
      });
    }

    return true;
  },
});

export const updateProgress = mutation({
  args: {
    id: v.id("projects"),
  },
  handler: async (ctx, args) => {
    const project = await ctx.db.get(args.id);
    if (!project) return false;

    // Calculate progress from tasks
    const tasks = await ctx.db
      .query("projectTasks")
      .withIndex("by_project", (q) => q.eq("projectId", args.id))
      .collect();

    if (tasks.length === 0) return false;

    const doneCount = tasks.filter((t) => t.status === "done").length;
    const progress = Math.round((doneCount / tasks.length) * 100);

    await ctx.db.patch(args.id, { progress });

    // Log milestone at 25%, 50%, 75%, 100%
    const milestones = [25, 50, 75, 100];
    const prevMilestone = Math.floor(project.progress / 25) * 25;
    const newMilestone = Math.floor(progress / 25) * 25;
    
    if (newMilestone > prevMilestone && milestones.includes(newMilestone)) {
      await ctx.db.insert("projectUpdates", {
        projectId: args.id,
        agentId: project.owner,
        message: `Project reached ${newMilestone}% completion`,
        type: "milestone",
        timestamp: Date.now(),
      });
    }

    return progress;
  },
});

export const archive = mutation({
  args: { id: v.id("projects") },
  handler: async (ctx, args) => {
    const project = await ctx.db.get(args.id);
    if (!project) return false;

    await ctx.db.patch(args.id, {
      status: "cancelled",
    });

    await ctx.db.insert("projectUpdates", {
      projectId: args.id,
      agentId: project.owner,
      message: "Project archived",
      type: "decision",
      timestamp: Date.now(),
    });

    return true;
  },
});

export const addTeamMember = mutation({
  args: {
    projectId: v.id("projects"),
    agentId: v.id("agents"),
  },
  handler: async (ctx, args) => {
    const project = await ctx.db.get(args.projectId);
    if (!project) return false;

    if (!project.team.includes(args.agentId)) {
      await ctx.db.patch(args.projectId, {
        team: [...project.team, args.agentId],
      });
    }

    return true;
  },
});

export const removeTeamMember = mutation({
  args: {
    projectId: v.id("projects"),
    agentId: v.id("agents"),
  },
  handler: async (ctx, args) => {
    const project = await ctx.db.get(args.projectId);
    if (!project) return false;

    await ctx.db.patch(args.projectId, {
      team: project.team.filter((id) => id !== args.agentId),
    });

    return true;
  },
});

// ==================== INTERNAL MUTATIONS ====================

export const deleteAll = internalMutation({
  args: {},
  handler: async (ctx) => {
    const projects = await ctx.db.query("projects").collect();
    for (const project of projects) {
      await ctx.db.delete(project._id);
    }

    const tasks = await ctx.db.query("projectTasks").collect();
    for (const task of tasks) {
      await ctx.db.delete(task._id);
    }

    const updates = await ctx.db.query("projectUpdates").collect();
    for (const update of updates) {
      await ctx.db.delete(update._id);
    }

    return {
      projectsDeleted: projects.length,
      tasksDeleted: tasks.length,
      updatesDeleted: updates.length,
    };
  },
});
