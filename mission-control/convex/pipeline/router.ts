/**
 * Assignment Router - Smart Agent Matching
 * 
 * Handles:
 * - Match task type to agent capability
 * - Check agent workload (max 3 concurrent tasks)
 * - Balance across team
 * - Escalate if blocked
 */

import { internalMutation, query } from "../_generated/server";
import { v } from "convex/values";
import { api } from "../_generated/api";

const MAX_WORKLOAD = 3; // Maximum concurrent tasks per agent
const WORKLOAD_THRESHOLDS = {
  IDLE: 0,
  LIGHT: 1,
  MODERATE: 2,
  HEAVY: 3,
};

// Agent role capabilities mapping
const ROLE_CAPABILITIES: Record<string, string[]> = {
  "senior-analyst": ["analysis", "research", "strategy", "deep_dive", "review"],
  "research-associate": ["research", "monitoring", "daily_brief", "news_scan"],
  "cmo": ["content", "marketing", "social_media", "branding", "campaign"],
  "engineer": ["build", "maintenance", "tool_development", "automation", "integration"],
  "cso": ["strategy", "review", "coordination", "analysis"],
};

// Task type to preferred agent role mapping
const TASK_ROLE_MAPPING: Record<string, string[]> = {
  "daily_brief": ["research-associate", "senior-analyst"],
  "research": ["research-associate", "senior-analyst"],
  "content": ["cmo"],
  "analysis": ["senior-analyst", "research-associate"],
  "build": ["engineer"],
  "monitoring": ["research-associate"],
  "review": ["senior-analyst", "cso"],
  "maintenance": ["engineer"],
  "strategy": ["cso", "senior-analyst"],
};

/**
 * Assign pending tasks to available agents
 */
export const assignPendingTasks = internalMutation({
  args: {
    maxAssignments: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const maxAssignments = args.maxAssignments || 5;
    const assignments: Array<{ jobId: string; agentId: string; role: string }> = [];

    // Get highest priority pending jobs
    const pendingJobs = await ctx.db.query("pipelineJobs")
      .withIndex("by_status", (q) => q.eq("status", "pending"))
      .collect();

    // Sort by priority (highest first)
    const sortedJobs = pendingJobs.sort((a, b) => b.priority - a.priority);

    for (const job of sortedJobs) {
      if (assignments.length >= maxAssignments) break;

      // Skip if job has dependencies that aren't complete
      if (job.dependencies && job.dependencies.length > 0) {
        const depsComplete = await checkDependenciesComplete(ctx, job.dependencies);
        if (!depsComplete) continue;
      }

      // Find best agent for this job
      const assignment = await findAndAssignAgent(ctx, job);
      
      if (assignment) {
        assignments.push(assignment);
      }
    }

    return {
      count: assignments.length,
      assignments,
    };
  },
});

/**
 * Assign a specific high-priority task immediately
 */
export const assignHighPriorityTask = internalMutation({
  args: {
    jobId: v.id("pipelineJobs"),
  },
  handler: async (ctx, args) => {
    const job = await ctx.db.get(args.jobId);
    if (!job) throw new Error("Job not found");
    if (job.status !== "pending") return { assigned: false, reason: "Job not pending" };

    // Check dependencies
    if (job.dependencies && job.dependencies.length > 0) {
      const depsComplete = await checkDependenciesComplete(ctx, job.dependencies);
      if (!depsComplete) {
        return { assigned: false, reason: "Dependencies not complete" };
      }
    }

    const assignment = await findAndAssignAgent(ctx, job, true); // true = force assignment

    if (assignment) {
      return {
        assigned: true,
        agentId: assignment.agentId,
        role: assignment.role,
      };
    }

    return { assigned: false, reason: "No agents available" };
  },
});

/**
 * Force assign a task to a specific agent (admin override)
 */
export const forceAssignToAgent = internalMutation({
  args: {
    jobId: v.id("pipelineJobs"),
    agentId: v.id("agents"),
    reason: v.string(),
    initiatedBy: v.string(),
  },
  handler: async (ctx, args) => {
    const job = await ctx.db.get(args.jobId);
    const agent = await ctx.db.get(args.agentId);

    if (!job) throw new Error("Job not found");
    if (!agent) throw new Error("Agent not found");

    // Check if agent is at max workload
    const currentWorkload = agent.workload || 0;
    if (currentWorkload >= MAX_WORKLOAD) {
      // Force assignment anyway - will be overloaded
      console.warn(`Agent ${agent.displayName} is being overloaded with forced assignment`);
    }

    // Assign the job
    await assignJobToAgent(ctx, job, agent);

    // Log the force assignment
    await ctx.db.insert("activities", {
      type: "task_auto_assigned",
      agentId: agent._id,
      pipelineJobId: job._id,
      message: `Job force-assigned to ${agent.displayName}: ${args.reason}`,
      metadata: {
        action: "force_assign",
        reason: args.reason,
        initiatedBy: args.initiatedBy,
        previousStatus: job.status,
        agentWorkload: currentWorkload,
      },
      timestamp: Date.now(),
    });

    return {
      success: true,
      jobId: args.jobId,
      agentId: args.agentId,
      agentName: agent.displayName,
    };
  },
});

/**
 * Reassign a job to a different agent
 */
export const reassignJob = internalMutation({
  args: {
    jobId: v.id("pipelineJobs"),
    newAgentId: v.id("agents"),
    reason: v.string(),
  },
  handler: async (ctx, args) => {
    const job = await ctx.db.get(args.jobId);
    const newAgent = await ctx.db.get(args.newAgentId);

    if (!job) throw new Error("Job not found");
    if (!newAgent) throw new Error("Agent not found");

    // If job is currently assigned, free up the old agent
    if (job.assignedAgent) {
      const oldAgent = await ctx.db.get(job.assignedAgent);
      if (oldAgent) {
        await ctx.db.patch(oldAgent._id, {
          workload: Math.max((oldAgent.workload || 0) - 1, 0),
          status: (oldAgent.workload || 0) <= 1 ? "idle" : "working",
        });
      }
    }

    // Assign to new agent
    await assignJobToAgent(ctx, job, newAgent);

    await ctx.db.insert("activities", {
      type: "task_auto_assigned",
      agentId: newAgent._id,
      pipelineJobId: job._id,
      message: `Job reassigned to ${newAgent.displayName}: ${args.reason}`,
      metadata: {
        action: "reassign",
        reason: args.reason,
        previousAgent: job.assignedAgent,
      },
      timestamp: Date.now(),
    });

    return { success: true };
  },
});

/**
 * Balance workload across agents
 */
export const balanceWorkload = internalMutation({
  args: {},
  handler: async (ctx) => {
    const agents = await ctx.db.query("agents").collect();
    const reassignments: any[] = [];

    // Find overloaded agents
    const overloadedAgents = agents.filter(a => (a.workload || 0) >= MAX_WORKLOAD);
    const underloadedAgents = agents.filter(a => (a.workload || 0) < MAX_WORKLOAD - 1);

    for (const overloaded of overloadedAgents) {
      // Get their assigned jobs
      const assignedJobs = await ctx.db.query("pipelineJobs")
        .withIndex("by_agent", (q) => q.eq("assignedAgent", overloaded._id))
        .filter((q) => q.eq(q.field("status"), "pending"))
        .collect();

      // Find jobs that can be reassigned
      for (const job of assignedJobs) {
        if (underloadedAgents.length === 0) break;

        // Find a compatible underloaded agent
        const compatibleAgent = underloadedAgents.find(agent => 
          isAgentCompatibleForJob(agent, job)
        );

        if (compatibleAgent) {
          // Reassign
          await reassignJobInternal(ctx, job, overloaded, compatibleAgent);
          
          reassignments.push({
            jobId: job._id,
            fromAgent: overloaded.displayName,
            toAgent: compatibleAgent.displayName,
          });

          // Update workloads
          overloaded.workload = (overloaded.workload || 0) - 1;
          compatibleAgent.workload = (compatibleAgent.workload || 0) + 1;

          // Remove from underloaded if now at threshold
          if (compatibleAgent.workload >= MAX_WORKLOAD - 1) {
            const idx = underloadedAgents.indexOf(compatibleAgent);
            if (idx > -1) underloadedAgents.splice(idx, 1);
          }
        }
      }
    }

    return {
      reassignments: reassignments.length,
      details: reassignments,
    };
  },
});

/**
 * Get agent availability status
 */
export const getAgentAvailability = query({
  args: {},
  handler: async (ctx) => {
    const agents = await ctx.db.query("agents").collect();

    return agents.map(agent => {
      const workload = agent.workload || 0;
      let availability: "available" | "busy" | "overloaded" | "offline";

      if (agent.status === "offline") availability = "offline";
      else if (workload >= MAX_WORKLOAD) availability = "overloaded";
      else if (workload >= MAX_WORKLOAD - 1) availability = "busy";
      else availability = "available";

      return {
        id: agent._id,
        role: agent.role,
        name: agent.displayName,
        status: agent.status,
        workload,
        maxWorkload: MAX_WORKLOAD,
        availability,
        capabilities: agent.capabilities || ROLE_CAPABILITIES[agent.role] || [],
        currentTask: agent.currentTask,
      };
    });
  },
});

// ==================== HELPER FUNCTIONS ====================

async function findAndAssignAgent(
  ctx: any, 
  job: any, 
  force: boolean = false
): Promise<{ jobId: string; agentId: string; role: string } | null> {
  
  // Determine preferred agent roles for this job
  const preferredRoles = job.agentRole 
    ? [job.agentRole]
    : TASK_ROLE_MAPPING[job.type] || ["research-associate"];

  // Find available agents for these roles
  let availableAgents = await ctx.db.query("agents")
    .filter((q) => 
      q.or(...preferredRoles.map(role => q.eq(q.field("role"), role)))
    )
    .collect();

  // Filter by availability (unless forcing)
  if (!force) {
    availableAgents = availableAgents.filter(a => 
      (a.workload || 0) < MAX_WORKLOAD && a.status !== "offline"
    );
  }

  if (availableAgents.length === 0) {
    // No agents in preferred roles available - try escalation
    if (job.priorityLevel === "p0" || job.priority > 80) {
      availableAgents = await findEscalationAgent(ctx, job);
    }
    
    if (availableAgents.length === 0) {
      return null;
    }
  }

  // Score and rank agents
  const scoredAgents = availableAgents.map(agent => ({
    agent,
    score: calculateAgentScore(agent, job),
  }));

  // Sort by score (highest first)
  scoredAgents.sort((a, b) => b.score - a.score);

  // Assign to best agent
  const bestAgent = scoredAgents[0].agent;
  await assignJobToAgent(ctx, job, bestAgent);

  return {
    jobId: job._id,
    agentId: bestAgent._id,
    role: bestAgent.role,
  };
}

async function assignJobToAgent(ctx: any, job: any, agent: any) {
  const now = Date.now();

  // Update job
  await ctx.db.patch(job._id, {
    status: "running",
    assignedAgent: agent._id,
    agentRole: agent.role,
    startedAt: now,
  });

  // Update agent
  const newWorkload = (agent.workload || 0) + 1;
  await ctx.db.patch(agent._id, {
    status: "working",
    workload: newWorkload,
    currentTask: job.type,
    lastAssignment: now,
    currentTaskId: job._id,
  });

  // Create the actual task in the tasks table
  const taskId = await ctx.db.insert("tasks", {
    title: `${job.type}: ${job.triggerSource || "Pipeline Task"}`,
    description: job.context || "No description provided",
    assignedTo: agent.role,
    assignedToId: agent._id,
    delegatedBy: "pipeline",
    status: "in-progress",
    priority: job.priorityLevel || "p2",
    createdAt: now,
    startedAt: now,
    dueAt: job.deadline,
    notes: [],
    source: "auto-scheduled",
    pipelineJobId: job._id,
  });

  // Log assignment
  await ctx.db.insert("activities", {
    type: "task_auto_assigned",
    agentId: agent._id,
    pipelineJobId: job._id,
    taskId: taskId,
    message: `Job assigned to ${agent.displayName}: ${job.type}`,
    metadata: {
      jobType: job.type,
      priority: job.priority,
      agentRole: agent.role,
      workload: newWorkload,
    },
    timestamp: now,
  });

  // Spawn the sub-agent for this task
  await ctx.runMutation(api.pipeline.router.spawnAgentForTask, {
    jobId: job._id,
    taskId: taskId,
    agentRole: agent.role,
    context: job.context,
  });
}

async function spawnAgentForTask(ctx: any, args: any) {
  // This would integrate with the spawner system
  // For now, we just log that the agent would be spawned
  console.log(`[SPAWN] Would spawn ${args.agentRole} for job ${args.jobId}`);
  
  // In a real implementation, this would:
  // 1. Call the spawner API
  // 2. Create a delegation record
  // 3. Set up monitoring for the spawned session
}

async function checkDependenciesComplete(ctx: any, dependencies: string[]): Promise<boolean> {
  for (const depId of dependencies) {
    const depJob = await ctx.db.get(depId as any);
    if (!depJob || depJob.status !== "complete") {
      return false;
    }
  }
  return true;
}

function calculateAgentScore(agent: any, job: any): number {
  let score = 0;

  // Workload factor (lower is better)
  const workload = agent.workload || 0;
  score += (MAX_WORKLOAD - workload) * 20;

  // Role match
  const preferredRoles = TASK_ROLE_MAPPING[job.type] || [];
  if (preferredRoles.includes(agent.role)) {
    score += 30;
    // Bonus for primary role match
    if (preferredRoles[0] === agent.role) score += 10;
  }

  // Capability match
  const capabilities = agent.capabilities || ROLE_CAPABILITIES[agent.role] || [];
  if (capabilities.some((cap: string) => job.type?.includes(cap))) {
    score += 15;
  }

  // Recent activity (prefer agents who haven't been assigned recently)
  if (agent.lastAssignment) {
    const hoursSinceAssignment = (Date.now() - agent.lastAssignment) / (60 * 60 * 1000);
    score += Math.min(hoursSinceAssignment, 24); // Up to 24 points for idle time
  } else {
    score += 25; // Bonus for never assigned
  }

  // Performance factor
  const performance = agent.performance;
  if (performance) {
    score += performance.avgQuality * 5; // Up to 25 points for 5-star average
  }

  return score;
}

async function findEscalationAgent(ctx: any, job: any): Promise<any[]> {
  // For P0 tasks, try to find any available agent even if not ideal
  const allAgents = await ctx.db.query("agents")
    .filter((q) => q.neq(q.field("status"), "offline"))
    .collect();

  // Sort by workload (lowest first)
  return allAgents
    .sort((a, b) => (a.workload || 0) - (b.workload || 0))
    .slice(0, 3); // Return top 3 candidates
}

function isAgentCompatibleForJob(agent: any, job: any): boolean {
  // Check if agent can handle this job type
  const preferredRoles = TASK_ROLE_MAPPING[job.type] || [];
  return preferredRoles.includes(agent.role) || 
         agent.role === job.agentRole ||
         !job.agentRole; // No specific role required
}

async function reassignJobInternal(ctx: any, job: any, fromAgent: any, toAgent: any) {
  await ctx.db.patch(job._id, {
    assignedAgent: toAgent._id,
    agentRole: toAgent.role,
  });

  await ctx.db.patch(fromAgent._id, {
    workload: Math.max((fromAgent.workload || 0) - 1, 0),
  });

  await ctx.db.patch(toAgent._id, {
    workload: (toAgent.workload || 0) + 1,
    status: "working",
  });
}

/**
 * Release agent from completed job
 */
export const releaseAgent = internalMutation({
  args: {
    agentId: v.id("agents"),
    jobId: v.id("pipelineJobs"),
  },
  handler: async (ctx, args) => {
    const agent = await ctx.db.get(args.agentId);
    if (!agent) return;

    const newWorkload = Math.max((agent.workload || 0) - 1, 0);
    
    await ctx.db.patch(args.agentId, {
      workload: newWorkload,
      status: newWorkload === 0 ? "idle" : "working",
      currentTask: newWorkload === 0 ? undefined : agent.currentTask,
      currentTaskId: newWorkload === 0 ? undefined : agent.currentTaskId,
    });

    return { newWorkload, status: newWorkload === 0 ? "idle" : "working" };
  },
});

/**
 * Get workload distribution across departments
 */
export const getWorkloadDistribution = query({
  args: {},
  handler: async (ctx) => {
    const agents = await ctx.db.query("agents").collect();
    
    const distribution: Record<string, { total: number; available: number; busy: number; overloaded: number }> = {};

    for (const agent of agents) {
      const dept = agent.department;
      if (!distribution[dept]) {
        distribution[dept] = { total: 0, available: 0, busy: 0, overloaded: 0 };
      }

      distribution[dept].total++;
      
      const workload = agent.workload || 0;
      if (workload >= MAX_WORKLOAD) {
        distribution[dept].overloaded++;
      } else if (workload >= MAX_WORKLOAD - 1) {
        distribution[dept].busy++;
      } else {
        distribution[dept].available++;
      }
    }

    return distribution;
  },
});
