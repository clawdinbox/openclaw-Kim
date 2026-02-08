/**
 * Priority Engine - Intelligent Task Ranking
 * 
 * Scores tasks based on:
 * - Revenue impact (high = priority)
 * - Time sensitivity (deadlines)
 * - Agent availability
 * - Task dependencies
 * - Strategic goals alignment
 */

import { internalMutation, query } from "../_generated/server";
import { v } from "convex/values";

// Weight factors for priority calculation
const WEIGHTS = {
  REVENUE_IMPACT: 0.25,
  TIME_SENSITIVITY: 0.25,
  STRATEGIC_ALIGNMENT: 0.20,
  AGENT_AVAILABILITY: 0.15,
  DEPENDENCY_STATUS: 0.10,
  QUALITY_RISK: 0.05,
};

// Task categories and their revenue impact scores
const REVENUE_CATEGORIES: Record<string, number> = {
  "revenue": 100,
  "sales": 95,
  "marketing": 80,
  "content": 75,
  "customer_acquisition": 90,
  "partnerships": 85,
  "strategy": 70,
  "research": 60,
  "analysis": 65,
  "daily_ops": 50,
  "monitoring": 40,
  "maintenance": 30,
  "review": 45,
};

// Priority base scores
const PRIORITY_BASE: Record<string, number> = {
  "p0": 90,
  "p1": 70,
  "p2": 50,
};

/**
 * Recalculate priority scores for all pending jobs
 */
export const recalculateAllPriorities = internalMutation({
  args: {},
  handler: async (ctx) => {
    const pendingJobs = await ctx.db.query("pipelineJobs")
      .withIndex("by_status", (q) => q.eq("status", "pending"))
      .collect();

    const results = {
      recalculated: 0,
      boosted: 0,
      lowered: 0,
    };

    for (const job of pendingJobs) {
      const newScore = await calculateJobPriority(ctx, job);
      
      if (newScore !== job.priority) {
        await ctx.db.patch(job._id, { priority: newScore });
        results.recalculated++;
        
        if (newScore > job.priority) results.boosted++;
        else results.lowered++;
      }
    }

    return results;
  },
});

/**
 * Calculate priority for a single job
 */
export const calculateJobPriority = internalMutation({
  args: { jobId: v.id("pipelineJobs") },
  handler: async (ctx, args) => {
    const job = await ctx.db.get(args.jobId);
    if (!job) throw new Error("Job not found");

    const score = await calculateJobPriorityScore(ctx, job);
    await ctx.db.patch(args.jobId, { priority: score });

    return { jobId: args.jobId, score };
  },
});

/**
 * Boost priority of urgent jobs approaching deadline
 */
export const boostUrgentJobs = internalMutation({
  args: {},
  handler: async (ctx) => {
    const now = Date.now();
    const pendingJobs = await ctx.db.query("pipelineJobs")
      .withIndex("by_status", (q) => q.eq("status", "pending"))
      .collect();

    let boosted = 0;

    for (const job of pendingJobs) {
      if (!job.deadline) continue;

      const timeUntilDeadline = job.deadline - now;
      const hoursUntil = timeUntilDeadline / (60 * 60 * 1000);

      let boost = 0;

      // Critical: < 4 hours
      if (hoursUntil < 4) {
        boost = 20;
      }
      // Urgent: < 12 hours
      else if (hoursUntil < 12) {
        boost = 15;
      }
      // Approaching: < 24 hours
      else if (hoursUntil < 24) {
        boost = 10;
      }
      // Due soon: < 48 hours
      else if (hoursUntil < 48) {
        boost = 5;
      }

      if (boost > 0) {
        const newScore = Math.min(job.priority + boost, 100);
        await ctx.db.patch(job._id, { priority: newScore });
        boosted++;
      }
    }

    return { boosted };
  },
});

/**
 * Get prioritized queue for an agent
 */
export const getPrioritizedQueueForAgent = query({
  args: { agentRole: v.string() },
  handler: async (ctx, args) => {
    // Get jobs that match this agent's role or are unassigned
    const pendingJobs = await ctx.db.query("pipelineJobs")
      .withIndex("by_status", (q) => q.eq("status", "pending"))
      .collect();

    // Filter and score for this specific agent
    const scoredJobs = await Promise.all(
      pendingJobs
        .filter(job => !job.agentRole || job.agentRole === args.agentRole)
        .map(async (job) => {
          const agentFitScore = await calculateAgentFitScore(ctx, job, args.agentRole);
          return {
            ...job,
            agentFitScore,
            finalScore: job.priority * 0.7 + agentFitScore * 0.3,
          };
        })
    );

    // Sort by final score (highest first)
    return scoredJobs.sort((a, b) => b.finalScore - a.finalScore);
  },
});

/**
 * Adjust priority based on strategic goals
 */
export const adjustForStrategicGoals = internalMutation({
  args: {
    activeGoals: v.array(v.string()), // e.g., ['revenue_growth', 'market_expansion']
  },
  handler: async (ctx, args) => {
    const pendingJobs = await ctx.db.query("pipelineJobs")
      .withIndex("by_status", (q) => q.eq("status", "pending"))
      .collect();

    let adjusted = 0;

    for (const job of pendingJobs) {
      const alignmentScore = calculateStrategicAlignment(job, args.activeGoals);
      
      if (alignmentScore > 0) {
        const boost = alignmentScore * WEIGHTS.STRATEGIC_ALIGNMENT;
        const newScore = Math.min(job.priority + boost, 100);
        await ctx.db.patch(job._id, { priority: newScore });
        adjusted++;
      }
    }

    return { adjusted };
  },
});

// ==================== CALCULATION FUNCTIONS ====================

async function calculateJobPriorityScore(ctx: any, job: any): Promise<number> {
  const scores = {
    base: PRIORITY_BASE[job.priorityLevel || "p2"] || 50,
    revenueImpact: calculateRevenueImpact(job),
    timeSensitivity: calculateTimeSensitivity(job),
    strategicAlignment: await calculateStrategicAlignmentScore(ctx, job),
    agentAvailability: await calculateAgentAvailabilityScore(ctx, job),
    dependencyStatus: await calculateDependencyScore(ctx, job),
    qualityRisk: calculateQualityRisk(job),
  };

  // Weighted sum
  const finalScore = 
    scores.base * 0.3 +
    scores.revenueImpact * WEIGHTS.REVENUE_IMPACT +
    scores.timeSensitivity * WEIGHTS.TIME_SENSITIVITY +
    scores.strategicAlignment * WEIGHTS.STRATEGIC_ALIGNMENT +
    scores.agentAvailability * WEIGHTS.AGENT_AVAILABILITY +
    scores.dependencyStatus * WEIGHTS.DEPENDENCY_STATUS +
    scores.qualityRisk * WEIGHTS.QUALITY_RISK;

  return Math.round(Math.min(Math.max(finalScore, 0), 100));
}

function calculateRevenueImpact(job: any): number {
  let score = 50; // Default

  // Check job type/category
  if (job.category && REVENUE_CATEGORIES[job.category]) {
    score = REVENUE_CATEGORIES[job.category];
  }

  // Boost for direct revenue tasks
  if (job.type === "content" && job.context?.includes("conversion")) {
    score += 10;
  }

  // Boost for customer-facing tasks
  if (job.context?.includes("customer") || job.context?.includes("client")) {
    score += 5;
  }

  return Math.min(score, 100);
}

function calculateTimeSensitivity(job: any): number {
  if (!job.deadline) return 50;

  const now = Date.now();
  const timeRemaining = job.deadline - now;
  const totalTime = job.deadline - job.createdAt;
  
  if (totalTime <= 0) return 100;

  const timeRatio = timeRemaining / totalTime;

  // Higher score = more urgent
  if (timeRatio < 0.1) return 100; // < 10% time remaining
  if (timeRatio < 0.25) return 90;
  if (timeRatio < 0.5) return 75;
  if (timeRatio < 0.75) return 60;
  return 50;
}

async function calculateStrategicAlignmentScore(ctx: any, job: any): Promise<number> {
  // Get current strategic goals from config
  const config = await ctx.db.query("pipelineConfig").first();
  
  if (!config?.activeProject) return 50;

  // Check if job aligns with active project
  if (job.context?.toLowerCase().includes(config.activeProject.toLowerCase())) {
    return 90;
  }

  // Check for keyword alignment
  const strategicKeywords = ["growth", "expansion", "revenue", "strategy", "market"];
  const alignment = strategicKeywords.filter(kw => 
    job.context?.toLowerCase().includes(kw)
  ).length;

  return 50 + (alignment * 10);
}

async function calculateAgentAvailabilityScore(ctx: any, job: any): Promise<number> {
  if (!job.agentRole) return 50;

  // Find agents matching this role
  const agents = await ctx.db.query("agents")
    .withIndex("by_role", (q) => q.eq("role", job.agentRole))
    .collect();

  if (agents.length === 0) return 0; // No agents available

  // Calculate average availability
  const totalWorkload = agents.reduce((sum, agent) => 
    sum + (agent.workload || 0), 0
  );
  const maxWorkload = agents.length * 3; // 3 max concurrent tasks per agent
  const availabilityRatio = 1 - (totalWorkload / maxWorkload);

  // Higher score = more agents available
  return Math.round(availabilityRatio * 100);
}

async function calculateDependencyScore(ctx: any, job: any): Promise<number> {
  if (!job.dependencies || job.dependencies.length === 0) return 100;

  // Check status of all dependencies
  let completedCount = 0;
  for (const depId of job.dependencies) {
    const depJob = await ctx.db.get(depId);
    if (depJob?.status === "complete") {
      completedCount++;
    }
  }

  const completionRatio = completedCount / job.dependencies.length;
  
  // Score based on dependency completion
  if (completionRatio === 1) return 100; // All deps complete
  if (completionRatio >= 0.75) return 80;
  if (completionRatio >= 0.5) return 60;
  if (completionRatio >= 0.25) return 40;
  return 20; // Mostly blocked
}

function calculateQualityRisk(job: any): number {
  let risk = 50;

  // Higher risk if many retries
  if (job.retryCount > 0) {
    risk -= job.retryCount * 15;
  }

  // Higher risk if past deadline
  if (job.deadline && Date.now() > job.deadline) {
    risk -= 20;
  }

  // Higher risk if complex (based on context length as proxy)
  if (job.context && job.context.length > 500) {
    risk -= 10;
  }

  return Math.max(risk, 0);
}

async function calculateAgentFitScore(ctx: any, job: any, agentRole: string): Promise<number> {
  let score = 50;

  // Exact role match
  if (job.agentRole === agentRole) {
    score = 100;
  }
  // Compatible roles
  else if (isCompatibleRole(agentRole, job.agentRole)) {
    score = 70;
  }
  // No specific role required
  else if (!job.agentRole) {
    score = 60;
  }
  // Mismatched role
  else {
    score = 20;
  }

  // Boost if agent has capability for this task type
  const agents = await ctx.db.query("agents")
    .withIndex("by_role", (q) => q.eq("role", agentRole))
    .collect();

  if (agents.length > 0) {
    const hasCapability = agents.some(agent => 
      agent.capabilities?.some(cap => 
        job.type?.toLowerCase().includes(cap.toLowerCase())
      )
    );
    if (hasCapability) score += 10;
  }

  return Math.min(score, 100);
}

function isCompatibleRole(agentRole: string, jobRole?: string): boolean {
  if (!jobRole) return true;

  const compatibility: Record<string, string[]> = {
    "senior-analyst": ["research-associate"],
    "cso": ["senior-analyst", "research-associate"],
    "cmo": ["research-associate"],
    "ceo": ["cso", "senior-analyst", "cmo"],
  };

  return compatibility[agentRole]?.includes(jobRole) || false;
}

function calculateStrategicAlignment(job: any, activeGoals: string[]): number {
  if (!activeGoals.length) return 0;

  const jobContext = (job.context || "").toLowerCase();
  const jobType = (job.type || "").toLowerCase();

  let alignment = 0;

  for (const goal of activeGoals) {
    const goalLower = goal.toLowerCase();
    
    if (jobContext.includes(goalLower) || jobType.includes(goalLower)) {
      alignment += 20;
    }
  }

  return Math.min(alignment, 50);
}

// ==================== PRIORITY UTILITIES ====================

/**
 * Get priority breakdown for a job (for UI display)
 */
export const getPriorityBreakdown = query({
  args: { jobId: v.id("pipelineJobs") },
  handler: async (ctx, args) => {
    const job = await ctx.db.get(args.jobId);
    if (!job) return null;

    return {
      totalScore: job.priority,
      breakdown: {
        basePriority: PRIORITY_BASE[job.priorityLevel || "p2"] || 50,
        revenueImpact: calculateRevenueImpact(job),
        timeSensitivity: calculateTimeSensitivity(job),
        qualityRisk: calculateQualityRisk(job),
      },
      factors: {
        deadline: job.deadline,
        category: job.category,
        type: job.type,
        retryCount: job.retryCount,
        triggerType: job.triggerType,
      },
    };
  },
});

/**
 * Manually adjust priority (for admin override)
 */
export const manualPriorityOverride = internalMutation({
  args: {
    jobId: v.id("pipelineJobs"),
    newPriority: v.number(),
    reason: v.string(),
    adjustedBy: v.string(),
  },
  handler: async (ctx, args) => {
    const job = await ctx.db.get(args.jobId);
    if (!job) throw new Error("Job not found");

    const oldPriority = job.priority;

    await ctx.db.patch(args.jobId, {
      priority: Math.min(Math.max(args.newPriority, 0), 100),
    });

    // Log the override
    await ctx.db.insert("activities", {
      type: "status_changed",
      pipelineJobId: args.jobId,
      message: `Priority manually adjusted from ${oldPriority} to ${args.newPriority}: ${args.reason}`,
      metadata: {
        action: "priority_override",
        oldPriority,
        newPriority: args.newPriority,
        reason: args.reason,
        adjustedBy: args.adjustedBy,
      },
      timestamp: Date.now(),
    });

    return { success: true, oldPriority, newPriority: args.newPriority };
  },
});
