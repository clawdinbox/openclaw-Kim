/**
 * TypeScript types for Mission Control AI Agent Company
 * OPTIMIZED VERSION - 14 Agent Team Structure
 */

import { Id } from "@/convex/_generated/dataModel";

// ==================== AGENT TYPES ====================

export type AgentRole =
  // Executive (1)
  | "ceo"
  // Strategy (2 - Kim + Product Manager)
  | "cso"
  | "product-manager"
  // Research (2)
  | "senior-analyst"
  | "research-associate"
  // Marketing - Content Pod (4: CCO oversight + Newsletter + Designer + Copywriter)
  | "cmo"              // Also acts as CCO for content oversight
  | "newsletter-editor"
  | "content-designer"
  | "copywriter"
  // Marketing - Revenue Pod (3: CMO strategy + Sales + Pricing + Launch)
  | "sales-executive"
  | "pricing-analyst"
  | "launch-manager"
  // Engineering (2)
  | "engineer"
  | "automation-engineer"
  // Operations (2 - COO function)
  | "operations-assistant"
  | "data-analyst";

export type AgentDepartment = "strategy" | "research" | "marketing" | "engineering" | "operations";

export type AgentStatus = "idle" | "working" | "blocked" | "offline";

// Agent pods for workflow routing
export type AgentPod = 
  | "content-pod"      // Creative: CCO oversight, Designer, Copywriter
  | "revenue-pod"      // Commercial: CMO, Sales, Pricing, Launch
  | "strategy-pod"     // CSO, Product Manager
  | "research-pod"     // Senior Analyst, Research Associate
  | "engineering-pod"  // Lead Engineer, Automation Engineer
  | "operations-pod";  // Operations Assistant, Data Analyst

export interface Agent {
  _id: Id<"agents">;
  role: AgentRole;
  name: string;
  displayName: string;
  avatar?: string;
  department: AgentDepartment;
  pod?: AgentPod;
  status: AgentStatus;
  currentTask?: string;
  currentTaskId?: Id<"tasks">;
  // Workload management (max 2 concurrent tasks)
  workload: number; // current concurrent tasks (0-2)
  maxWorkload: number; // always 2
  lastAssignment?: number;
  lastOutput?: string;
  lastOutputPath?: string;
  performance: {
    tasksCompleted: number;
    avgQuality: number; // 1-5
    lastActive?: number;
  };
  capabilities: string[];
  description: string;
  // Reporting structure
  reportsTo?: AgentRole;
  createdAt: number;
}

export interface AgentWithTask extends Agent {
  currentTaskDetails?: Task;
}

// ==================== CAPACITY MANAGEMENT ====================

export interface AgentCapacity {
  role: AgentRole;
  currentTasks: number;
  maxTasks: number;
  isAvailable: boolean;
  workloadPercentage: number;
  lastActive: number;
  avgTaskDuration: number; // minutes
}

export interface CapacityReport {
  timestamp: number;
  totalAgents: number;
  availableAgents: number;
  atCapacityAgents: number;
  overloadedAgents: number;
  byDepartment: Record<AgentDepartment, AgentCapacity[]>;
  byPod: Record<AgentPod, AgentCapacity[]>;
  recommendations: string[];
}

// ==================== TASK TYPES ====================

export type TaskStatus = "pending" | "in-progress" | "review" | "complete" | "cancelled" | "stuck" | "escalated";

export type TaskPriority = "p0" | "p1" | "p2";

export interface TaskNote {
  text: string;
  author: string;
  timestamp: number;
}

export interface QualityGate {
  stage: "self-review" | "peer-review" | "kim-review" | "ceo-delivery";
  status: "pending" | "passed" | "failed";
  reviewer?: AgentRole;
  feedback?: string;
  score?: number; // 1-5
  timestamp?: number;
}

export interface Task {
  _id: Id<"tasks">;
  title: string;
  description: string;
  assignedTo: AgentRole;
  assignedToId?: Id<"agents">;
  assignedAgent?: {
    id: Id<"agents">;
    name: string;
    avatar?: string;
  } | null;
  delegatedBy: string;
  status: TaskStatus;
  priority: TaskPriority;
  category?: string;
  // Workflow tracking
  workflowId?: string;
  workflowStep?: number;
  // Quality gates
  qualityGates?: QualityGate[];
  currentGate?: string;
  // Timing
  createdAt: number;
  startedAt?: number;
  dueAt?: number;
  completedAt?: number;
  stuckSince?: number;
  // Output
  output?: string;
  outputSummary?: string;
  notes: TaskNote[];
  quality?: number;
  reviewFeedback?: string;
  // Cost tracking
  modelUsed?: string;
  tokensUsed?: number;
  estimatedCost?: number;
  // Source
  source?: "manual" | "auto-scheduled" | "event-triggered" | "webhook" | "workflow";
  pipelineJobId?: Id<"pipelineJobs">;
}

export interface TaskDashboard {
  counts: {
    total: number;
    pending: number;
    inProgress: number;
    review: number;
    complete: number;
    stuck: number;
    escalated: number;
  };
  pending: Task[];
  inProgress: Task[];
  review: Task[];
  recentCompleted: Task[];
  stuck: Task[];
  escalated: Task[];
  byAssignee: Record<string, Task[]>;
}

// ==================== ACTIVITY TYPES ====================

export type ActivityType =
  | "agent_spawned"
  | "task_created"
  | "task_started"
  | "task_completed"
  | "task_reviewed"
  | "output_delivered"
  | "status_changed"
  // Quality gate events
  | "quality_gate_passed"
  | "quality_gate_failed"
  | "task_escalated"
  // Pipeline-specific
  | "pipeline_tick"
  | "task_auto_assigned"
  | "task_retry"
  | "stuck_task_escalated"
  | "workflow_started"
  | "workflow_completed"
  // Cost tracking
  | "cost_threshold_alert"
  | "daily_budget_exceeded";

export interface Activity {
  _id: Id<"activities">;
  type: ActivityType;
  agentId?: Id<"agents">;
  agentRole?: AgentRole;
  agent?: {
    id: Id<"agents">;
    name: string;
    avatar?: string;
  } | null;
  taskId?: Id<"tasks">;
  task?: {
    id: Id<"tasks">;
    title: string;
  } | null;
  message: string;
  metadata?: Record<string, any>;
  timestamp: number;
}

// ==================== SPAWNER TYPES ====================

export type SpawnableRole = 
  | "senior-analyst" 
  | "research-associate"
  | "product-manager"
  | "data-analyst"
  | "cmo"
  | "newsletter-editor"
  | "engineer"
  | "automation-engineer"
  | "content-designer"
  | "copywriter"
  | "pricing-analyst"
  | "launch-manager"
  | "operations-assistant"
  | "sales-executive";

export interface SpawnAgentParams {
  role: SpawnableRole;
  task: string;
  priority: TaskPriority;
  deadline?: number;
  context?: string;
  deliverables?: string[];
  // Cost optimization
  modelPreference?: "ollama" | "kimi" | "opus" | "fastest";
  maxBudget?: number;
}

export interface AgentSession {
  sessionId: string;
  taskId: Id<"tasks">;
  role: SpawnableRole;
  status: "spawned" | "working" | "complete" | "error";
  spawnTime: number;
  estimatedCompletion?: number;
  modelUsed?: string;
  actualCost?: number;
}

// ==================== WORKFLOW TYPES ====================

export type WorkflowType = 
  | "morning-intelligence"
  | "content-factory"
  | "product-launch"
  | "revenue-optimization";

export interface WorkflowStep {
  step: number;
  key: string;
  agentRole: AgentRole;
  title: string;
  description: string;
  estimatedDuration: number; // minutes
  dependsOn: number[];
  outputType?: string;
  reviewRequired: boolean;
  // Quality gates for this step
  qualityGates?: string[];
}

export interface Workflow {
  _id: Id<"workflows">;
  type: WorkflowType;
  name: string;
  description: string;
  status: "pending" | "running" | "complete" | "failed" | "cancelled";
  steps: WorkflowStep[];
  currentStep: number;
  createdAt: number;
  startedAt?: number;
  completedAt?: number;
  triggeredBy?: string;
  // Cost tracking
  totalEstimatedCost?: number;
  totalActualCost?: number;
}

// ==================== COST TRACKING TYPES ====================

export interface ModelPricing {
  name: string;
  inputCostPer1M: number; // USD
  outputCostPer1M: number; // USD
  avgSpeed: "slow" | "medium" | "fast";
  useCase: string;
}

export interface AgentCostRecord {
  agentRole: AgentRole;
  taskId: Id<"tasks">;
  model: string;
  inputTokens: number;
  outputTokens: number;
  totalTokens: number;
  cost: number; // USD
  timestamp: number;
}

export interface DailyCostSummary {
  date: string;
  totalCost: number;
  byAgent: Record<AgentRole, number>;
  byModel: Record<string, number>;
  taskCount: number;
  avgCostPerTask: number;
  alerts: string[];
}

export interface CFOReport {
  period: "daily" | "weekly" | "monthly";
  startDate: string;
  endDate: string;
  totalSpend: number;
  budgetRemaining: number;
  budgetUtilization: number; // 0-1
  topCosts: Array<{ agent: AgentRole; cost: number; tasks: number }>;
  efficiencyScore: number; // 0-100
  recommendations: string[];
}

// ==================== UI TYPES ====================

export interface DepartmentConfig {
  border: string;
  bg: string;
  text: string;
  glow: string;
}

export interface StatusConfig {
  icon: React.ReactNode;
  label: string;
  color: string;
}

// ==================== API RESPONSE TYPES ====================

export interface AgentStatusResponse {
  total: number;
  idle: number;
  working: number;
  blocked: number;
  agents: Array<{
    id: Id<"agents">;
    role: AgentRole;
    name: string;
    status: AgentStatus;
    currentTask?: string;
    workload: number;
    lastActive?: number;
  }>;
}

export interface QualityGateConfig {
  enabled: boolean;
  stages: Array<{
    name: string;
    required: boolean;
    autoEscalateOnFailure: boolean;
  }>;
  autoEscalateThreshold: number; // quality score below this triggers escalation
  maxRetries: number;
}
