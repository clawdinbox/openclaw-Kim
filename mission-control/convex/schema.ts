import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  agents: defineTable({
    role: v.union(
      // Executive
      v.literal("ceo"),
      // Strategy Pod
      v.literal("cso"),
      v.literal("product-manager"),
      // Research Pod
      v.literal("senior-analyst"),
      v.literal("research-associate"),
      // Content Pod
      v.literal("cmo"),
      v.literal("newsletter-editor"),
      v.literal("content-designer"),
      v.literal("copywriter"),
      // Revenue Pod
      v.literal("sales-executive"),
      v.literal("pricing-analyst"),
      v.literal("launch-manager"),
      // Engineering Pod
      v.literal("engineer"),
      v.literal("automation-engineer"),
      // Operations Pod
      v.literal("operations-assistant"),
      v.literal("data-analyst")
    ),
    name: v.string(),
    displayName: v.string(),
    avatar: v.optional(v.string()),
    department: v.union(
      v.literal("strategy"),
      v.literal("research"),
      v.literal("marketing"),
      v.literal("engineering"),
      v.literal("operations")
    ),
    pod: v.optional(v.union(
      v.literal("strategy-pod"),
      v.literal("research-pod"),
      v.literal("content-pod"),
      v.literal("revenue-pod"),
      v.literal("engineering-pod"),
      v.literal("operations-pod")
    )),
    status: v.union(
      v.literal("idle"),
      v.literal("working"),
      v.literal("blocked"),
      v.literal("offline")
    ),
    // Workload management (max 2 concurrent tasks)
    workload: v.number(), // current concurrent tasks (0-2)
    maxWorkload: v.number(), // usually 2
    currentTask: v.optional(v.string()),
    currentTaskId: v.optional(v.id("tasks")),
    lastAssignment: v.optional(v.number()),
    lastOutput: v.optional(v.string()),
    lastOutputPath: v.optional(v.string()),
    performance: v.object({
      tasksCompleted: v.number(),
      avgQuality: v.number(), // 1-5
      lastActive: v.optional(v.number()),
    }),
    capabilities: v.array(v.string()),
    description: v.string(),
    // Reporting structure
    reportsTo: v.optional(v.union(
      v.literal("ceo"),
      v.literal("cso"),
      v.literal("cmo"),
      v.literal("engineer"),
      v.literal("senior-analyst")
    )),
    createdAt: v.number(),
    // Cost tracking per agent
    totalCostToDate: v.optional(v.number()),
  })
    .index("by_role", ["role"])
    .index("by_status", ["status"])
    .index("by_department", ["department"])
    .index("by_pod", ["pod"]),

  tasks: defineTable({
    title: v.string(),
    description: v.string(),
    assignedTo: v.string(), // agent role
    assignedToId: v.optional(v.id("agents")),
    delegatedBy: v.string(),
    status: v.union(
      v.literal("pending"),
      v.literal("in-progress"),
      v.literal("review"),
      v.literal("complete"),
      v.literal("cancelled"),
      v.literal("stuck"),
      v.literal("escalated")
    ),
    priority: v.union(v.literal("p0"), v.literal("p1"), v.literal("p2")),
    category: v.optional(v.string()),
    // Workflow tracking
    workflowId: v.optional(v.string()),
    workflowStep: v.optional(v.number()),
    workflowType: v.optional(v.union(
      v.literal("morning-intelligence"),
      v.literal("content-factory"),
      v.literal("product-launch"),
      v.literal("revenue-optimization")
    )),
    // Quality gates
    qualityGates: v.optional(v.array(v.object({
      stage: v.string(),
      status: v.union(v.literal("pending"), v.literal("passed"), v.literal("failed")),
      reviewer: v.optional(v.string()),
      feedback: v.optional(v.string()),
      score: v.optional(v.number()),
      timestamp: v.optional(v.number()),
    }))),
    currentGate: v.optional(v.string()),
    retryCount: v.optional(v.number()),
    // Timing
    createdAt: v.number(),
    startedAt: v.optional(v.number()),
    dueAt: v.optional(v.number()),
    completedAt: v.optional(v.number()),
    stuckSince: v.optional(v.number()),
    escalatedAt: v.optional(v.number()),
    // Output
    output: v.optional(v.string()),
    outputSummary: v.optional(v.string()),
    notes: v.array(
      v.object({
        text: v.string(),
        author: v.string(),
        timestamp: v.number(),
      })
    ),
    quality: v.optional(v.number()),
    reviewFeedback: v.optional(v.string()),
    // Cost tracking
    modelUsed: v.optional(v.string()),
    tokensUsed: v.optional(v.number()),
    estimatedCost: v.optional(v.number()),
    actualCost: v.optional(v.number()),
    // Source
    source: v.optional(v.union(
      v.literal("manual"),
      v.literal("auto-scheduled"),
      v.literal("event-triggered"),
      v.literal("webhook"),
      v.literal("workflow")
    )),
    pipelineJobId: v.optional(v.id("pipelineJobs")),
  })
    .index("by_assigned", ["assignedTo"])
    .index("by_status", ["status"])
    .index("by_priority", ["priority"])
    .index("by_created", ["createdAt"])
    .index("by_workflow", ["workflowId"])
    .index("by_pipeline_job", ["pipelineJobId"]),

  activities: defineTable({
    type: v.union(
      v.literal("agent_spawned"),
      v.literal("task_created"),
      v.literal("task_started"),
      v.literal("task_completed"),
      v.literal("task_reviewed"),
      v.literal("output_delivered"),
      v.literal("status_changed"),
      // Quality gate events
      v.literal("quality_gate_passed"),
      v.literal("quality_gate_failed"),
      v.literal("task_escalated"),
      v.literal("task_retried"),
      // Pipeline-specific
      v.literal("pipeline_tick"),
      v.literal("task_auto_assigned"),
      v.literal("task_retry"),
      v.literal("stuck_task_escalated"),
      v.literal("workflow_started"),
      v.literal("workflow_completed"),
      v.literal("workflow_step_completed"),
      // Cost tracking
      v.literal("cost_threshold_alert"),
      v.literal("daily_budget_exceeded"),
      v.literal("weekly_budget_report")
    ),
    agentId: v.optional(v.id("agents")),
    agentRole: v.optional(v.string()),
    taskId: v.optional(v.id("tasks")),
    pipelineJobId: v.optional(v.id("pipelineJobs")),
    workflowId: v.optional(v.string()),
    message: v.string(),
    metadata: v.optional(v.any()),
    timestamp: v.number(),
  })
    .index("by_timestamp", ["timestamp"])
    .index("by_agent", ["agentId"])
    .index("by_task", ["taskId"])
    .index("by_workflow", ["workflowId"]),

  delegations: defineTable({
    fromAgent: v.string(),
    toAgent: v.string(),
    taskId: v.id("tasks"),
    context: v.string(),
    spawnedSessionId: v.optional(v.string()),
    createdAt: v.number(),
    completedAt: v.optional(v.number()),
  }).index("by_task", ["taskId"]),

  // ==================== PIPELINE TABLES ====================

  pipelineJobs: defineTable({
    type: v.string(),
    status: v.union(
      v.literal("pending"),
      v.literal("running"),
      v.literal("complete"),
      v.literal("failed"),
      v.literal("stuck"),
      v.literal("retrying")
    ),
    assignedAgent: v.optional(v.id("agents")),
    agentRole: v.optional(v.string()),
    priority: v.number(),
    priorityLevel: v.optional(v.union(v.literal("p0"), v.literal("p1"), v.literal("p2"))),
    createdAt: v.number(),
    startedAt: v.optional(v.number()),
    completedAt: v.optional(v.number()),
    deadline: v.optional(v.number()),
    output: v.optional(v.string()),
    outputPath: v.optional(v.string()),
    error: v.optional(v.string()),
    retryCount: v.number(),
    maxRetries: v.optional(v.number()),
    context: v.optional(v.string()),
    dependencies: v.optional(v.array(v.id("pipelineJobs"))),
    workflowId: v.optional(v.string()),
    workflowStep: v.optional(v.number()),
    workflowType: v.optional(v.string()),
    cronExpression: v.optional(v.string()),
    nextRunAt: v.optional(v.number()),
    lastRunAt: v.optional(v.number()),
    triggerType: v.union(
      v.literal("time"),
      v.literal("event"),
      v.literal("goal"),
      v.literal("manual"),
      v.literal("webhook")
    ),
    triggerSource: v.optional(v.string()),
    // Cost tracking
    estimatedCost: v.optional(v.number()),
    actualCost: v.optional(v.number()),
    modelUsed: v.optional(v.string()),
  })
    .index("by_status", ["status"])
    .index("by_agent", ["assignedAgent"])
    .index("by_priority", ["priority"])
    .index("by_workflow", ["workflowId"])
    .index("by_next_run", ["nextRunAt"])
    .index("by_trigger", ["triggerType"]),

  pipelineConfig: defineTable({
    mode: v.union(
      v.literal("proactive"),
      v.literal("reactive"),
      v.literal("project")
    ),
    activeProject: v.optional(v.string()),
    lastTick: v.number(),
    tickInterval: v.optional(v.number()),
    isPaused: v.optional(v.boolean()),
    pausedAt: v.optional(v.number()),
    pausedBy: v.optional(v.string()),
    operatingHours: v.optional(v.object({
      start: v.number(),
      end: v.number(),
      timezone: v.string(),
    })),
    metrics: v.object({
      tasksCompleted24h: v.number(),
      tasksFailed24h: v.number(),
      avgTaskDuration: v.number(),
      successRate: v.number(),
      lastCalculated: v.number(),
    }),
    enabledTemplates: v.optional(v.array(v.string())),
    notifyOn: v.optional(v.object({
      taskComplete: v.boolean(),
      taskFailed: v.boolean(),
      stuckTask: v.boolean(),
      dailyDigest: v.boolean(),
      costAlert: v.boolean(),
    })),
    // Budget settings
    dailyBudgetLimit: v.optional(v.number()),
    weeklyBudgetLimit: v.optional(v.number()),
    currentDailySpend: v.optional(v.number()),
    currentWeeklySpend: v.optional(v.number()),
  }),

  // Swarm workflows
  workflows: defineTable({
    name: v.string(),
    type: v.union(
      v.literal("morning-intelligence"),
      v.literal("content-factory"),
      v.literal("product-launch"),
      v.literal("revenue-optimization")
    ),
    description: v.optional(v.string()),
    status: v.union(
      v.literal("pending"),
      v.literal("running"),
      v.literal("complete"),
      v.literal("failed"),
      v.literal("cancelled")
    ),
    steps: v.array(v.object({
      step: v.number(),
      agentRole: v.string(),
      task: v.string(),
      duration: v.optional(v.number()),
      dependsOn: v.optional(v.array(v.number())),
      jobId: v.optional(v.id("pipelineJobs")),
      completedAt: v.optional(v.number()),
    })),
    currentStep: v.number(),
    createdAt: v.number(),
    startedAt: v.optional(v.number()),
    completedAt: v.optional(v.number()),
    triggeredBy: v.optional(v.string()),
    // Cost tracking
    totalEstimatedCost: v.optional(v.number()),
    totalActualCost: v.optional(v.number()),
  })
    .index("by_status", ["status"])
    .index("by_type", ["type"])
    .index("by_created", ["createdAt"]),

  // Scheduled task templates
  taskTemplates: defineTable({
    name: v.string(),
    description: v.string(),
    type: v.string(),
    agentRole: v.string(),
    priority: v.union(v.literal("p0"), v.literal("p1"), v.literal("p2")),
    cronExpression: v.optional(v.string()),
    intervalMinutes: v.optional(v.number()),
    contextTemplate: v.string(),
    isEnabled: v.boolean(),
    lastRun: v.optional(v.number()),
    nextRun: v.optional(v.number()),
    runCount: v.optional(v.number()),
    category: v.optional(v.string()),
    workflowType: v.optional(v.string()),
  })
    .index("by_enabled", ["isEnabled", "nextRun"])
    .index("by_type", ["type"]),

  // Cost tracking table
  costRecords: defineTable({
    agentRole: v.string(),
    taskId: v.id("tasks"),
    pipelineJobId: v.optional(v.id("pipelineJobs")),
    model: v.string(),
    inputTokens: v.number(),
    outputTokens: v.number(),
    totalTokens: v.number(),
    cost: v.number(), // USD
    timestamp: v.number(),
    date: v.string(), // YYYY-MM-DD for easy querying
  })
    .index("by_date", ["date"])
    .index("by_agent", ["agentRole"])
    .index("by_task", ["taskId"]),
});
