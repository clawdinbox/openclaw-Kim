/**
 * LOAD BALANCER - Agent Capacity Management System
 * 
 * Rules:
 * - Max 2 concurrent tasks per agent
 * - Kim (CSO/COO/CFO/CCO): Only review/approval tasks, no execution
 * - Research Associate: 80% reactive (news), 20% proactive (deep dives)
 * - Sales Executive: Always reactive (leads come in)
 */

import { AgentRole, AgentStatus, AgentDepartment, AgentPod, AgentCapacity, CapacityReport } from "@/types";
import { Id } from "@/convex/_generated/dataModel";

// ==================== CAPACITY CONFIGURATION ====================

export const CAPACITY_RULES: Record<AgentRole, {
  maxConcurrent: number;
  allowedTaskTypes: ("execution" | "review" | "approval")[];
  workloadSplit?: { reactive: number; proactive: number };
  alwaysReactive?: boolean;
}> = {
  // Executive - Kim handles 4 roles, only review/approval
  "cso": {
    maxConcurrent: 3, // Slightly higher for multi-role
    allowedTaskTypes: ["review", "approval"],
  },
  "ceo": {
    maxConcurrent: 1,
    allowedTaskTypes: ["review", "approval"],
  },
  
  // Strategy Pod
  "product-manager": {
    maxConcurrent: 2,
    allowedTaskTypes: ["execution", "review"],
  },
  
  // Research Pod
  "senior-analyst": {
    maxConcurrent: 2,
    allowedTaskTypes: ["execution"],
  },
  "research-associate": {
    maxConcurrent: 2,
    allowedTaskTypes: ["execution"],
    workloadSplit: { reactive: 80, proactive: 20 },
  },
  
  // Content Pod (Creative)
  "cmo": {
    maxConcurrent: 2,
    allowedTaskTypes: ["execution", "review", "approval"],
  },
  "content-designer": {
    maxConcurrent: 2,
    allowedTaskTypes: ["execution"],
  },
  "copywriter": {
    maxConcurrent: 2,
    allowedTaskTypes: ["execution"],
  },
  
  // Revenue Pod (Commercial)
  "sales-executive": {
    maxConcurrent: 2,
    allowedTaskTypes: ["execution"],
    alwaysReactive: true,
  },
  "pricing-analyst": {
    maxConcurrent: 2,
    allowedTaskTypes: ["execution", "review"],
  },
  "launch-manager": {
    maxConcurrent: 2,
    allowedTaskTypes: ["execution"],
  },
  
  // Engineering Pod
  "engineer": {
    maxConcurrent: 2,
    allowedTaskTypes: ["execution", "review"],
  },
  "automation-engineer": {
    maxConcurrent: 2,
    allowedTaskTypes: ["execution"],
  },
  
  // Operations Pod
  "operations-assistant": {
    maxConcurrent: 2,
    allowedTaskTypes: ["execution"],
  },
  "data-analyst": {
    maxConcurrent: 2,
    allowedTaskTypes: ["execution", "review"],
  },
};

// ==================== POD DEFINITIONS ====================

export const AGENT_PODS: Record<AgentPod, AgentRole[]> = {
  "strategy-pod": ["cso", "product-manager"],
  "research-pod": ["senior-analyst", "research-associate"],
  "content-pod": ["cmo", "content-designer", "copywriter"],
  "revenue-pod": ["cmo", "sales-executive", "pricing-analyst", "launch-manager"],
  "engineering-pod": ["engineer", "automation-engineer"],
  "operations-pod": ["operations-assistant", "data-analyst"],
};

// ==================== LOAD BALANCER CLASS ====================

export class LoadBalancer {
  private agentCapacities: Map<AgentRole, AgentCapacity>;
  private lastUpdate: number;

  constructor() {
    this.agentCapacities = new Map();
    this.lastUpdate = Date.now();
  }

  /**
   * Update agent capacity from database
   */
  updateAgentCapacity(
    role: AgentRole,
    currentTasks: number,
    status: AgentStatus,
    lastActive: number,
    avgTaskDuration: number = 60
  ): void {
    const rules = CAPACITY_RULES[role];
    const capacity: AgentCapacity = {
      role,
      currentTasks,
      maxTasks: rules.maxConcurrent,
      isAvailable: status !== "offline" && currentTasks < rules.maxConcurrent,
      workloadPercentage: (currentTasks / rules.maxConcurrent) * 100,
      lastActive,
      avgTaskDuration,
    };
    this.agentCapacities.set(role, capacity);
    this.lastUpdate = Date.now();
  }

  /**
   * Check if agent can accept new task
   */
  canAcceptTask(role: AgentRole, taskType: "execution" | "review" | "approval"): boolean {
    const rules = CAPACITY_RULES[role];
    const capacity = this.agentCapacities.get(role);
    
    if (!rules.allowedTaskTypes.includes(taskType)) {
      return false; // Agent not allowed this task type
    }
    
    if (!capacity) {
      return false; // No capacity data
    }
    
    return capacity.isAvailable;
  }

  /**
   * Get best available agent for a task
   */
  getBestAgent(
    preferredRole: AgentRole,
    fallbackRoles: AgentRole[],
    taskType: "execution" | "review" | "approval"
  ): { role: AgentRole; confidence: number } | null {
    // Check preferred role first
    if (this.canAcceptTask(preferredRole, taskType)) {
      const capacity = this.agentCapacities.get(preferredRole)!;
      return { 
        role: preferredRole, 
        confidence: 1 - (capacity.currentTasks / capacity.maxTasks) 
      };
    }

    // Check fallbacks in order
    for (const role of fallbackRoles) {
      if (this.canAcceptTask(role, taskType)) {
        const capacity = this.agentCapacities.get(role)!;
        return { 
          role, 
          confidence: 0.8 * (1 - (capacity.currentTasks / capacity.maxTasks))
        };
      }
    }

    return null;
  }

  /**
   * Get least loaded agent in a pod
   */
  getLeastLoadedInPod(pod: AgentPod, taskType: "execution" | "review" | "approval"): AgentRole | null {
    const podRoles = AGENT_PODS[pod];
    let bestRole: AgentRole | null = null;
    let lowestWorkload = Infinity;

    for (const role of podRoles) {
      if (!this.canAcceptTask(role, taskType)) continue;
      
      const capacity = this.agentCapacities.get(role);
      if (capacity && capacity.workloadPercentage < lowestWorkload) {
        lowestWorkload = capacity.workloadPercentage;
        bestRole = role;
      }
    }

    return bestRole;
  }

  /**
   * Get any available agent in a pod
   */
  getAnyAvailableInPod(pod: AgentPod, taskType: "execution" | "review" | "approval"): AgentRole | null {
    const podRoles = AGENT_PODS[pod];
    
    for (const role of podRoles) {
      if (this.canAcceptTask(role, taskType)) {
        return role;
      }
    }

    return null;
  }

  /**
   * Generate full capacity report
   */
  generateReport(): CapacityReport {
    const capacities = Array.from(this.agentCapacities.values());
    
    const byDepartment: Record<AgentDepartment, AgentCapacity[]> = {
      strategy: [],
      research: [],
      marketing: [],
      engineering: [],
      operations: [],
    };

    const byPod: Record<AgentPod, AgentCapacity[]> = {
      "strategy-pod": [],
      "research-pod": [],
      "content-pod": [],
      "revenue-pod": [],
      "engineering-pod": [],
      "operations-pod": [],
    };

    // Categorize by department and pod
    for (const capacity of capacities) {
      const role = capacity.role;
      
      // Determine department
      let dept: AgentDepartment;
      if (role === "ceo" || role === "cso" || role === "product-manager") {
        dept = "strategy";
      } else if (role === "senior-analyst" || role === "research-associate") {
        dept = "research";
      } else if (["cmo", "content-designer", "copywriter", "sales-executive", "pricing-analyst", "launch-manager"].includes(role)) {
        dept = "marketing";
      } else if (role === "engineer" || role === "automation-engineer") {
        dept = "engineering";
      } else {
        dept = "operations";
      }
      
      byDepartment[dept].push(capacity);

      // Determine pod
      for (const [podName, podRoles] of Object.entries(AGENT_PODS)) {
        if (podRoles.includes(role)) {
          byPod[podName as AgentPod].push(capacity);
          break;
        }
      }
    }

    // Generate recommendations
    const recommendations: string[] = [];
    
    // Check for overloaded pods
    for (const [pod, podCapacities] of Object.entries(byPod)) {
      const avgWorkload = podCapacities.reduce((sum, c) => sum + c.workloadPercentage, 0) / podCapacities.length;
      if (avgWorkload > 80) {
        recommendations.push(`⚠️ ${pod} is at ${avgWorkload.toFixed(0)}% capacity - consider redistributing tasks`);
      }
    }

    // Check for idle agents
    const idleAgents = capacities.filter(c => c.currentTasks === 0);
    if (idleAgents.length > 4) {
      recommendations.push(`💡 ${idleAgents.length} agents are idle - could take on more proactive work`);
    }

    return {
      timestamp: Date.now(),
      totalAgents: capacities.length,
      availableAgents: capacities.filter(c => c.isAvailable).length,
      atCapacityAgents: capacities.filter(c => c.currentTasks >= c.maxTasks).length,
      overloadedAgents: capacities.filter(c => c.currentTasks > c.maxTasks).length,
      byDepartment,
      byPod,
      recommendations,
    };
  }

  /**
   * Check if workload split is balanced (for Research Associate)
   */
  isWorkloadSplitBalanced(role: AgentRole, reactiveCount: number, proactiveCount: number): boolean {
    const rules = CAPACITY_RULES[role];
    if (!rules.workloadSplit) return true;

    const total = reactiveCount + proactiveCount;
    if (total === 0) return true;

    const reactivePercentage = (reactiveCount / total) * 100;
    const targetReactive = rules.workloadSplit.reactive;
    
    // Allow 10% variance
    return Math.abs(reactivePercentage - targetReactive) <= 10;
  }
}

// ==================== TASK ROUTING ====================

export interface RoutingDecision {
  assignedTo: AgentRole;
  reason: string;
  confidence: number;
  alternatives: AgentRole[];
}

/**
 * Route task to best available agent
 */
export function routeTask(
  taskType: "execution" | "review" | "approval",
  preferredPod?: AgentPod,
  requiredCapability?: string,
  balancer: LoadBalancer = new LoadBalancer()
): RoutingDecision | null {
  
  // If pod specified, try pod members first
  if (preferredPod) {
    const podAgent = balancer.getLeastLoadedInPod(preferredPod, taskType);
    if (podAgent) {
      const alternatives = AGENT_PODS[preferredPod]
        .filter(r => r !== podAgent && balancer.canAcceptTask(r, taskType));
      
      return {
        assignedTo: podAgent,
        reason: `Least loaded agent in ${preferredPod}`,
        confidence: 0.9,
        alternatives,
      };
    }
  }

  // Find any available agent with right task type permission
  const allRoles = Object.keys(CAPACITY_RULES) as AgentRole[];
  const available = allRoles.filter(r => balancer.canAcceptTask(r, taskType));
  
  if (available.length === 0) {
    return null;
  }

  // Pick least loaded
  let bestRole = available[0];
  let lowestWorkload = 100;
  
  for (const role of available) {
    const capacity = balancer.agentCapacities.get(role);
    if (capacity && capacity.workloadPercentage < lowestWorkload) {
      lowestWorkload = capacity.workloadPercentage;
      bestRole = role;
    }
  }

  return {
    assignedTo: bestRole,
    reason: "Least loaded available agent",
    confidence: 0.7,
    alternatives: available.filter(r => r !== bestRole),
  };
}

// ==================== CONSTANTS ====================

export const LOAD_BALANCER_CONSTANTS = {
  // Escalation thresholds
  STUCK_TASK_THRESHOLD_MS: 2 * 60 * 60 * 1000, // 2 hours
  MAX_RETRIES: 3,
  
  // Capacity thresholds
  HIGH_CAPACITY_THRESHOLD: 80, // percentage
  CRITICAL_CAPACITY_THRESHOLD: 100, // percentage
  
  // Workload splits
  RESEARCH_ASSOCIATE_REACTIVE_PCT: 80,
  RESEARCH_ASSOCIATE_PROACTIVE_PCT: 20,
  
  // Task type routing
  EXECUTION_ROLES: [
    "product-manager",
    "senior-analyst",
    "research-associate",
    "content-designer",
    "copywriter",
    "sales-executive",
    "pricing-analyst",
    "launch-manager",
    "engineer",
    "automation-engineer",
    "operations-assistant",
    "data-analyst",
  ] as AgentRole[],
  
  REVIEW_ROLES: [
    "cso",
    "cmo",
    "product-manager",
    "pricing-analyst",
    "engineer",
    "data-analyst",
  ] as AgentRole[],
  
  APPROVAL_ROLES: [
    "cso",
    "cmo",
    "ceo",
  ] as AgentRole[],
};

// Singleton instance
export const loadBalancer = new LoadBalancer();
