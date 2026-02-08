/**
 * Task Generator - Automatically creates tasks based on triggers
 * 
 * Handles:
 * - Time-based triggers (daily, weekly, monthly recurring tasks)
 * - Event-based triggers (news, market moves, competitor actions)
 * - Goal-based triggers (revenue targets, growth metrics)
 * - Input-based (user requests, external webhooks)
 */

import { internalMutation, query } from "../_generated/server";
import { v } from "convex/values";
import { api } from "../_generated/api";

// Task type definitions
const TASK_TYPES = [
  "daily_brief",
  "research", 
  "content",
  "analysis",
  "build",
  "monitoring",
  "review",
  "maintenance",
] as const;

/**
 * Generate tasks from enabled templates
 */
export const generateTasksFromTemplates = internalMutation({
  args: {
    maxTasks: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const maxTasks = args.maxTasks || 10;
    const now = Date.now();
    const generated: string[] = [];

    // Get all enabled templates that are due
    const templates = await ctx.db.query("taskTemplates")
      .withIndex("by_enabled", (q) => q.eq("isEnabled", true))
      .collect();

    for (const template of templates) {
      if (generated.length >= maxTasks) break;

      // Check if it's time to run this template
      const shouldRun = shouldRunTemplate(template, now);
      if (!shouldRun) continue;

      // Calculate priority score
      const priorityScore = calculatePriorityScore(template, now);

      // Create pipeline job
      const jobId = await ctx.db.insert("pipelineJobs", {
        type: template.type,
        status: "pending",
        priority: priorityScore,
        priorityLevel: template.priority,
        createdAt: now,
        deadline: calculateDeadline(template.priority),
        retryCount: 0,
        maxRetries: 3,
        context: template.contextTemplate,
        triggerType: "time",
        triggerSource: template.name,
      });

      // Update template's last run
      await ctx.db.patch(template._id, {
        lastRun: now,
        nextRun: calculateNextRun(template),
        runCount: (template.runCount || 0) + 1,
      });

      generated.push(jobId);
    }

    return { count: generated.length, jobs: generated };
  },
});

/**
 * Create a task from an event trigger
 */
export const createEventTriggeredTask = internalMutation({
  args: {
    eventType: v.string(), // 'breaking_news', 'market_volatility', 'competitor_action'
    source: v.string(),
    data: v.any(),
    priority: v.optional(v.union(v.literal("p0"), v.literal("p1"), v.literal("p2"))),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    
    // Determine task parameters based on event type
    const taskConfig = getEventTaskConfig(args.eventType, args.data);
    const priority = args.priority || taskConfig.priority;
    
    // Calculate high priority score for events
    const priorityScore = calculateEventPriorityScore(priority, args.eventType);

    // Create the pipeline job
    const jobId = await ctx.db.insert("pipelineJobs", {
      type: taskConfig.taskType,
      status: "pending",
      priority: priorityScore,
      priorityLevel: priority,
      createdAt: now,
      deadline: now + taskConfig.deadlineMinutes * 60 * 1000,
      retryCount: 0,
      maxRetries: 3,
      context: taskConfig.context,
      triggerType: "event",
      triggerSource: `${args.eventType}:${args.source}`,
    });

    // Log the event trigger
    await ctx.db.insert("activities", {
      type: "task_created",
      message: `Event-triggered task created: ${taskConfig.taskType} from ${args.source}`,
      pipelineJobId: jobId,
      metadata: {
        eventType: args.eventType,
        source: args.source,
        priority,
        data: args.data,
      },
      timestamp: now,
    });

    // If high priority, attempt immediate assignment
    if (priority === "p0") {
      await ctx.runMutation(api.pipeline.router.assignHighPriorityTask, {
        jobId,
      });
    }

    return { jobId, priority, taskType: taskConfig.taskType };
  },
});

/**
 * Create a goal-based task
 */
export const createGoalBasedTask = internalMutation({
  args: {
    goalType: v.string(), // 'revenue_target', 'growth_metric', 'quality_improvement'
    target: v.string(),
    currentValue: v.optional(v.number()),
    targetValue: v.optional(v.number()),
    deadline: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    
    const taskConfig = getGoalTaskConfig(args.goalType, args);
    const priorityScore = calculateGoalPriorityScore(args);

    const jobId = await ctx.db.insert("pipelineJobs", {
      type: taskConfig.taskType,
      status: "pending",
      priority: priorityScore,
      priorityLevel: taskConfig.priority,
      createdAt: now,
      deadline: args.deadline || calculateDeadline(taskConfig.priority),
      retryCount: 0,
      maxRetries: 3,
      context: taskConfig.context,
      triggerType: "goal",
      triggerSource: args.goalType,
    });

    await ctx.db.insert("activities", {
      type: "task_created",
      message: `Goal-based task created: ${args.goalType}`,
      pipelineJobId: jobId,
      metadata: {
        goalType: args.goalType,
        target: args.target,
        currentValue: args.currentValue,
        targetValue: args.targetValue,
      },
      timestamp: now,
    });

    return { jobId };
  },
});

/**
 * Initialize default task templates
 */
export const initializeDefaultTemplates = internalMutation({
  args: {},
  handler: async (ctx) => {
    const templates = getDefaultTemplates();
    const created: string[] = [];

    for (const template of templates) {
      // Check if template already exists
      const existing = await ctx.db.query("taskTemplates")
        .filter((q) => q.eq(q.field("name"), template.name))
        .first();

      if (!existing) {
        const id = await ctx.db.insert("taskTemplates", {
          ...template,
          isEnabled: true,
          runCount: 0,
          nextRun: calculateNextRun(template),
        });
        created.push(id);
      }
    }

    return { created: created.length, templates: created };
  },
});

/**
 * Create a manual task (for UI/admin use)
 */
export const createManualTask = internalMutation({
  args: {
    type: v.string(),
    priority: v.union(v.literal("p0"), v.literal("p1"), v.literal("p2")),
    context: v.string(),
    agentRole: v.optional(v.string()),
    deadline: v.optional(v.number()),
    workflowId: v.optional(v.string()),
    workflowStep: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    const priorityScore = calculateManualPriorityScore(args.priority);

    const jobId = await ctx.db.insert("pipelineJobs", {
      type: args.type,
      status: "pending",
      assignedAgent: undefined,
      agentRole: args.agentRole,
      priority: priorityScore,
      priorityLevel: args.priority,
      createdAt: now,
      deadline: args.deadline || calculateDeadline(args.priority),
      retryCount: 0,
      maxRetries: 3,
      context: args.context,
      workflowId: args.workflowId,
      workflowStep: args.workflowStep,
      triggerType: "manual",
    });

    await ctx.db.insert("activities", {
      type: "task_created",
      message: `Manual task created: ${args.type}`,
      pipelineJobId: jobId,
      metadata: {
        type: args.type,
        priority: args.priority,
        agentRole: args.agentRole,
      },
      timestamp: now,
    });

    return { jobId };
  },
});

// ==================== HELPER FUNCTIONS ====================

function shouldRunTemplate(template: any, now: number): boolean {
  if (!template.nextRun) return true;
  if (now >= template.nextRun) return true;
  return false;
}

function calculateNextRun(template: any): number {
  const now = Date.now();
  
  if (template.cronExpression) {
    // Parse cron and calculate next run
    return parseCronExpression(template.cronExpression, now);
  }
  
  if (template.intervalMinutes) {
    return now + template.intervalMinutes * 60 * 1000;
  }
  
  // Default: 24 hours
  return now + 24 * 60 * 60 * 1000;
}

function parseCronExpression(cron: string, baseTime: number): number {
  // Simplified cron parser for common patterns
  // For production, use a proper cron library
  
  const parts = cron.split(" ");
  if (parts.length !== 5) return baseTime + 24 * 60 * 60 * 1000;
  
  const [minute, hour, day, month, dayOfWeek] = parts;
  const date = new Date(baseTime);
  
  // Handle "0 0 * * *" - daily at midnight
  if (minute === "0" && hour === "0" && day === "*") {
    date.setDate(date.getDate() + 1);
    date.setHours(0, 0, 0, 0);
    return date.getTime();
  }
  
  // Handle "0 */2 * * *" - every 2 hours
  if (minute === "0" && hour.startsWith("*/")) {
    const interval = parseInt(hour.replace("*/", ""));
    return baseTime + interval * 60 * 60 * 1000;
  }
  
  // Default: next day
  return baseTime + 24 * 60 * 60 * 1000;
}

function calculatePriorityScore(template: any, now: number): number {
  let score = 50; // Base score
  
  // Priority level
  if (template.priority === "p0") score += 40;
  else if (template.priority === "p1") score += 20;
  
  // Time sensitivity - overdue templates get boost
  if (template.nextRun && now > template.nextRun) {
    const overdueHours = (now - template.nextRun) / (60 * 60 * 1000);
    score += Math.min(overdueHours * 5, 20);
  }
  
  // Category weighting
  if (template.category === "revenue") score += 10;
  if (template.category === "critical") score += 15;
  
  return Math.min(score, 100);
}

function calculateEventPriorityScore(priority: string, eventType: string): number {
  let score = 70; // Events start higher than scheduled tasks
  
  if (priority === "p0") score = 95;
  else if (priority === "p1") score = 80;
  
  // Event type weighting
  if (eventType === "breaking_news") score += 5;
  if (eventType === "market_volatility") score += 3;
  if (eventType === "system_alert") score += 10;
  
  return Math.min(score, 100);
}

function calculateGoalPriorityScore(args: any): number {
  let score = 60;
  
  // Urgency based on deadline proximity
  if (args.deadline) {
    const daysUntil = (args.deadline - Date.now()) / (24 * 60 * 60 * 1000);
    if (daysUntil < 1) score += 30;
    else if (daysUntil < 3) score += 20;
    else if (daysUntil < 7) score += 10;
  }
  
  // Gap between current and target
  if (args.currentValue !== undefined && args.targetValue !== undefined) {
    const gap = Math.abs(args.targetValue - args.currentValue);
    const percentGap = gap / args.targetValue;
    score += percentGap * 20;
  }
  
  return Math.min(score, 100);
}

function calculateManualPriorityScore(priority: string): number {
  if (priority === "p0") return 90;
  if (priority === "p1") return 70;
  return 50;
}

function calculateDeadline(priority: string): number {
  const now = Date.now();
  switch (priority) {
    case "p0": return now + 4 * 60 * 60 * 1000; // 4 hours
    case "p1": return now + 24 * 60 * 60 * 1000; // 24 hours
    case "p2": return now + 72 * 60 * 60 * 1000; // 3 days
    default: return now + 24 * 60 * 60 * 1000;
  }
}

function getEventTaskConfig(eventType: string, data: any): any {
  const configs: Record<string, any> = {
    breaking_news: {
      taskType: "research",
      priority: "p0",
      deadlineMinutes: 60,
      context: `Breaking news detected: ${data?.headline || "Unknown"}. Research implications immediately.`,
    },
    market_volatility: {
      taskType: "analysis",
      priority: "p1",
      deadlineMinutes: 120,
      context: `Market volatility detected. Analyze impact on our positions and prepare response.`,
    },
    competitor_action: {
      taskType: "research",
      priority: "p1",
      deadlineMinutes: 180,
      context: `Competitor activity detected: ${data?.competitor || "Unknown"}. Analyze their move.`,
    },
    social_trend: {
      taskType: "content",
      priority: "p1",
      deadlineMinutes: 90,
      context: `Trending topic detected: ${data?.trend || "Unknown"}. Prepare rapid response content.`,
    },
    system_alert: {
      taskType: "maintenance",
      priority: "p0",
      deadlineMinutes: 30,
      context: `System alert: ${data?.alert || "Unknown issue"}. Address immediately.`,
    },
  };
  
  return configs[eventType] || {
    taskType: "analysis",
    priority: "p2",
    deadlineMinutes: 240,
    context: `Event received: ${eventType}. Review and take appropriate action.`,
  };
}

function getGoalTaskConfig(goalType: string, args: any): any {
  const configs: Record<string, any> = {
    revenue_target: {
      taskType: "analysis",
      priority: "p1",
      context: `Revenue goal analysis: Current ${args.currentValue}, Target ${args.targetValue}. Develop strategy to close gap.`,
    },
    growth_metric: {
      taskType: "analysis",
      priority: "p1",
      context: `Growth metric review: ${args.target}. Current: ${args.currentValue}. Identify growth opportunities.`,
    },
    quality_improvement: {
      taskType: "review",
      priority: "p2",
      context: `Quality improvement initiative: ${args.target}. Review current outputs and suggest improvements.`,
    },
    market_expansion: {
      taskType: "research",
      priority: "p1",
      context: `Market expansion research for: ${args.target}. Prepare market entry analysis.`,
    },
  };
  
  return configs[goalType] || {
    taskType: "analysis",
    priority: "p2",
    context: `Goal-based task: ${goalType} - ${args.target}`,
  };
}

function getDefaultTemplates(): any[] {
  return [
    // Daily tasks (00:00 Berlin time)
    {
      name: "morning_brief",
      description: "Generate daily morning brief with overnight news and priorities",
      type: "daily_brief",
      agentRole: "research-associate",
      priority: "p1",
      cronExpression: "0 0 * * *", // Midnight daily
      contextTemplate: "Generate morning brief: summarize overnight news in fashion/luxury, identify key priorities for today, prepare briefing document",
      category: "daily_ops",
    },
    {
      name: "social_content_prep",
      description: "Prepare next day's social media content",
      type: "content",
      agentRole: "cmo",
      priority: "p1",
      cronExpression: "0 1 * * *", // 1 AM daily
      contextTemplate: "Prepare tomorrow's content: 3 X posts, 3 Threads posts, ensure variety in topics, schedule in Postiz",
      category: "marketing",
    },
    {
      name: "competitor_scan",
      description: "Scan competitor news and announcements",
      type: "research",
      agentRole: "research-associate",
      priority: "p1",
      cronExpression: "0 2 * * *", // 2 AM daily
      contextTemplate: "Scan key competitors for news, product launches, and announcements. Compile summary report.",
      category: "research",
    },
    
    // Continuous tasks (every 2 hours)
    {
      name: "fashion_news_monitor",
      description: "Monitor fashion and luxury news",
      type: "monitoring",
      agentRole: "research-associate",
      priority: "p2",
      intervalMinutes: 120, // Every 2 hours
      contextTemplate: "Scan fashion/luxury news sources for breaking stories. Flag important items for immediate attention.",
      category: "monitoring",
    },
    {
      name: "social_engagement_check",
      description: "Monitor social engagement metrics",
      type: "monitoring",
      agentRole: "cmo",
      priority: "p2",
      intervalMinutes: 120,
      contextTemplate: "Check social engagement on recent posts. Identify high-performing content and opportunities for engagement.",
      category: "monitoring",
    },
    {
      name: "tool_health_check",
      description: "Check all tools and integrations health",
      type: "maintenance",
      agentRole: "engineer",
      priority: "p1",
      intervalMinutes: 120,
      contextTemplate: "Run health checks on all integrated tools and systems. Report any issues found.",
      category: "maintenance",
    },
    
    // Weekly tasks (Sunday 20:00)
    {
      name: "weekly_strategy_digest",
      description: "Compile weekly strategy digest",
      type: "analysis",
      agentRole: "senior-analyst",
      priority: "p1",
      cronExpression: "0 20 * * 0", // Sunday 8 PM
      contextTemplate: "Compile Weekly Strategy Digest: summarize week's activities, analyze performance metrics, identify trends, prepare recommendations for next week",
      category: "strategy",
    },
    {
      name: "content_theme_planning",
      description: "Plan next week's content themes",
      type: "content",
      agentRole: "cmo",
      priority: "p2",
      cronExpression: "0 21 * * 0", // Sunday 9 PM
      contextTemplate: "Plan content themes for upcoming week based on: calendar events, trending topics, brand priorities, audience engagement patterns",
      category: "marketing",
    },
    {
      name: "performance_metrics_review",
      description: "Review weekly performance metrics",
      type: "analysis",
      agentRole: "senior-analyst",
      priority: "p1",
      cronExpression: "0 22 * * 0", // Sunday 10 PM
      contextTemplate: "Review all performance metrics for the week. Identify patterns, anomalies, and areas for improvement.",
      category: "analytics",
    },
    
    // Monthly tasks
    {
      name: "monthly_deep_dive",
      description: "Monthly strategic deep-dive analysis",
      type: "analysis",
      agentRole: "senior-analyst",
      priority: "p1",
      cronExpression: "0 9 1 * *", // 1st of month at 9 AM
      contextTemplate: "Conduct monthly strategic deep-dive: comprehensive market analysis, competitive landscape review, opportunity identification, risk assessment",
      category: "strategy",
    },
    
    // Maintenance tasks
    {
      name: "tool_maintenance",
      description: "Regular tool maintenance and updates",
      type: "maintenance",
      agentRole: "engineer",
      priority: "p2",
      intervalMinutes: 1440, // Daily
      contextTemplate: "Perform routine maintenance: check for tool updates, review error logs, optimize performance, update documentation",
      category: "maintenance",
    },
  ];
}

/**
 * Get all task templates (for UI)
 */
export const getTaskTemplates = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("taskTemplates").collect();
  },
});

/**
 * Enable/disable a task template
 */
export const setTemplateEnabled = internalMutation({
  args: {
    templateId: v.id("taskTemplates"),
    enabled: v.boolean(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.templateId, {
      isEnabled: args.enabled,
    });
  },
});

/**
 * Update task template
 */
export const updateTemplate = internalMutation({
  args: {
    templateId: v.id("taskTemplates"),
    updates: v.object({
      priority: v.optional(v.union(v.literal("p0"), v.literal("p1"), v.literal("p2"))),
      cronExpression: v.optional(v.string()),
      intervalMinutes: v.optional(v.number()),
      isEnabled: v.optional(v.boolean()),
    }),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.templateId, args.updates);
  },
});
