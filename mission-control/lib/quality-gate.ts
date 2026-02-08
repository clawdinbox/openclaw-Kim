/**
 * QUALITY GATE SYSTEM - Review & Escalation Management
 * 
 * Before any deliverable reaches CEO:
 * 1. Self-review by agent
 * 2. Peer review (if available)
 * 3. Kim review (CSO/COO/CFO/CCO)
 * 4. Final delivery
 * 
 * Auto-escalation:
 * - Task stuck >2h → escalate to Kim
 * - Quality score <3/5 → send back for revision
 * - Failed 3x → escalate to Kim + notify CEO
 */

import { AgentRole, TaskStatus, QualityGate } from "@/types";
import { Id } from "@/convex/_generated/dataModel";
import { LOAD_BALANCER_CONSTANTS } from "./load-balancer";

// ==================== QUALITY GATE CONFIGURATION ====================

export interface QualityGateStage {
  name: string;
  required: boolean;
  reviewer?: AgentRole;
  reviewerPod?: string;
  autoEscalateOnFailure: boolean;
  maxWaitTimeMs?: number;
}

export const QUALITY_GATE_PIPELINE: QualityGateStage[] = [
  {
    name: "self-review",
    required: true,
    autoEscalateOnFailure: false,
  },
  {
    name: "peer-review",
    required: false,
    reviewerPod: "same-pod",
    autoEscalateOnFailure: false,
    maxWaitTimeMs: 30 * 60 * 1000, // 30 minutes
  },
  {
    name: "kim-review",
    required: true,
    reviewer: "cso",
    autoEscalateOnFailure: true,
    maxWaitTimeMs: 60 * 60 * 1000, // 1 hour
  },
  {
    name: "ceo-delivery",
    required: false,
    reviewer: "ceo",
    autoEscalateOnFailure: false,
    maxWaitTimeMs: 2 * 60 * 60 * 1000, // 2 hours
  },
];

// ==================== QUALITY SCORING ====================

export interface QualityCriteria {
  name: string;
  weight: number; // 0-1
  description: string;
}

export const QUALITY_CRITERIA: QualityCriteria[] = [
  {
    name: "accuracy",
    weight: 0.25,
    description: "Facts are correct, sources verified",
  },
  {
    name: "completeness",
    weight: 0.20,
    description: "All requirements met, nothing missing",
  },
  {
    name: "clarity",
    weight: 0.20,
    description: "Easy to understand, well structured",
  },
  {
    name: "actionability",
    weight: 0.20,
    description: "Clear next steps or recommendations",
  },
  {
    name: "timeliness",
    weight: 0.15,
    description: "Delivered on time, within scope",
  },
];

export interface QualityScore {
  overall: number; // 1-5
  byCriteria: Record<string, number>;
  feedback: string;
  scoredBy: AgentRole;
  timestamp: number;
}

/**
 * Calculate weighted quality score
 */
export function calculateQualityScore(scores: Record<string, number>): number {
  let weightedSum = 0;
  let totalWeight = 0;

  for (const criterion of QUALITY_CRITERIA) {
    const score = scores[criterion.name] || 3;
    weightedSum += score * criterion.weight;
    totalWeight += criterion.weight;
  }

  return Math.round((weightedSum / totalWeight) * 10) / 10;
}

// ==================== QUALITY GATE MANAGER ====================

export class QualityGateManager {
  private gates: Map<string, QualityGate[]>; // taskId -> gates
  private scores: Map<string, QualityScore[]>; // taskId -> scores

  constructor() {
    this.gates = new Map();
    this.scores = new Map();
  }

  /**
   * Initialize quality gates for a task
   */
  initializeGates(
    taskId: string,
    requirePeerReview: boolean = false,
    requireCeoDelivery: boolean = false
  ): QualityGate[] {
    const gates: QualityGate[] = [];

    for (const stage of QUALITY_GATE_PIPELINE) {
      // Skip peer review if not required
      if (stage.name === "peer-review" && !requirePeerReview) continue;
      
      // Skip CEO delivery if not required
      if (stage.name === "ceo-delivery" && !requireCeoDelivery) continue;

      gates.push({
        stage: stage.name as QualityGate["stage"],
        status: "pending",
      });
    }

    this.gates.set(taskId, gates);
    return gates;
  }

  /**
   * Get current active gate for a task
   */
  getCurrentGate(taskId: string): QualityGate | null {
    const gates = this.gates.get(taskId);
    if (!gates) return null;

    // Find first pending gate
    return gates.find(g => g.status === "pending") || null;
  }

  /**
   * Pass a quality gate
   */
  passGate(
    taskId: string,
    stageName: string,
    reviewer: AgentRole,
    score?: number,
    feedback?: string
  ): { success: boolean; nextGate?: QualityGate; complete: boolean } {
    const gates = this.gates.get(taskId);
    if (!gates) return { success: false, complete: false };

    const gate = gates.find(g => g.stage === stageName);
    if (!gate) return { success: false, complete: false };

    // Update gate
    gate.status = "passed";
    gate.reviewer = reviewer;
    gate.score = score;
    gate.feedback = feedback;
    gate.timestamp = Date.now();

    // Record score if provided
    if (score !== undefined) {
      const scores = this.scores.get(taskId) || [];
      scores.push({
        overall: score,
        byCriteria: {},
        feedback: feedback || "",
        scoredBy: reviewer,
        timestamp: Date.now(),
      });
      this.scores.set(taskId, scores);
    }

    // Find next gate
    const nextGate = gates.find(g => g.status === "pending");
    const complete = !nextGate;

    return { success: true, nextGate: nextGate || undefined, complete };
  }

  /**
   * Fail a quality gate
   */
  failGate(
    taskId: string,
    stageName: string,
    reviewer: AgentRole,
    feedback: string,
    score?: number
  ): { success: boolean; shouldEscalate: boolean; shouldRetry: boolean } {
    const gates = this.gates.get(taskId);
    if (!gates) return { success: false, shouldEscalate: false, shouldRetry: false };

    const gate = gates.find(g => g.stage === stageName);
    if (!gate) return { success: false, shouldEscalate: false, shouldRetry: false };

    // Update gate
    gate.status = "failed";
    gate.reviewer = reviewer;
    gate.feedback = feedback;
    gate.score = score;
    gate.timestamp = Date.now();

    // Check stage configuration
    const stageConfig = QUALITY_GATE_PIPELINE.find(s => s.name === stageName);
    
    const shouldEscalate = stageConfig?.autoEscalateOnFailure || false;
    const shouldRetry = score !== undefined && score < 3; // Score < 3 requires revision

    return { success: true, shouldEscalate, shouldRetry };
  }

  /**
   * Reset gates for retry
   */
  resetForRetry(taskId: string): QualityGate[] {
    const gates = this.gates.get(taskId);
    if (!gates) return [];

    // Reset all gates to pending
    for (const gate of gates) {
      gate.status = "pending";
      gate.reviewer = undefined;
      gate.feedback = undefined;
      gate.score = undefined;
      gate.timestamp = undefined;
    }

    return gates;
  }

  /**
   * Get quality report for a task
   */
  getQualityReport(taskId: string): {
    gates: QualityGate[];
    overallScore?: number;
    isComplete: boolean;
    passedCount: number;
    failedCount: number;
  } {
    const gates = this.gates.get(taskId) || [];
    const scores = this.scores.get(taskId) || [];

    const passedCount = gates.filter(g => g.status === "passed").length;
    const failedCount = gates.filter(g => g.status === "failed").length;
    const isComplete = passedCount === gates.length && gates.length > 0;

    // Calculate average score
    const overallScore = scores.length > 0
      ? scores.reduce((sum, s) => sum + s.overall, 0) / scores.length
      : undefined;

    return {
      gates,
      overallScore,
      isComplete,
      passedCount,
      failedCount,
    };
  }

  /**
   * Check if task needs escalation
   */
  checkEscalationNeeded(
    taskId: string,
    stuckSince?: number,
    retryCount: number = 0
  ): { escalate: boolean; reason: string; notifyCeo: boolean } {
    // Check if stuck too long
    if (stuckSince) {
      const stuckDuration = Date.now() - stuckSince;
      if (stuckDuration > LOAD_BALANCER_CONSTANTS.STUCK_TASK_THRESHOLD_MS) {
        return {
          escalate: true,
          reason: `Task stuck for ${Math.round(stuckDuration / 60000)} minutes`,
          notifyCeo: false,
        };
      }
    }

    // Check if too many retries
    if (retryCount >= LOAD_BALANCER_CONSTANTS.MAX_RETRIES) {
      return {
        escalate: true,
        reason: `Failed ${retryCount} times - maximum retries exceeded`,
        notifyCeo: true,
      };
    }

    // Check current quality score
    const report = this.getQualityReport(taskId);
    if (report.overallScore !== undefined && report.overallScore < 3) {
      return {
        escalate: true,
        reason: `Quality score ${report.overallScore} below threshold (3.0)`,
        notifyCeo: retryCount >= 2,
      };
    }

    return { escalate: false, reason: "", notifyCeo: false };
  }
}

// ==================== AUTO-ESCALATION ====================

export interface EscalationEvent {
  taskId: string;
  reason: string;
  severity: "low" | "medium" | "high" | "critical";
  notifyCeo: boolean;
  suggestedAction: string;
  timestamp: number;
}

/**
 * Check and create escalation events
 */
export function checkEscalationConditions(
  taskId: string,
  taskStatus: TaskStatus,
  startedAt?: number,
  retryCount: number = 0,
  qualityScore?: number
): EscalationEvent | null {
  
  // Check stuck tasks
  if (taskStatus === "in-progress" && startedAt) {
    const duration = Date.now() - startedAt;
    if (duration > LOAD_BALANCER_CONSTANTS.STUCK_TASK_THRESHOLD_MS) {
      return {
        taskId,
        reason: "Task exceeded time limit",
        severity: "medium",
        notifyCeo: false,
        suggestedAction: "Reassign to different agent or break into smaller tasks",
        timestamp: Date.now(),
      };
    }
  }

  // Check quality failures
  if (qualityScore !== undefined && qualityScore < 3) {
    const severity = retryCount >= 2 ? "high" : "medium";
    return {
      taskId,
      reason: `Quality score ${qualityScore} below acceptable threshold`,
      severity,
      notifyCeo: retryCount >= 2,
      suggestedAction: retryCount >= 2 
        ? "Escalate to Kim for direct intervention" 
        : "Return to agent for revision with specific feedback",
      timestamp: Date.now(),
    };
  }

  // Check max retries
  if (retryCount >= LOAD_BALANCER_CONSTANTS.MAX_RETRIES) {
    return {
      taskId,
      reason: `Task failed ${retryCount} times`,
      severity: "critical",
      notifyCeo: true,
      suggestedAction: "Kim to investigate and potentially reassign or break down task",
      timestamp: Date.now(),
    };
  }

  return null;
}

// ==================== SELF-REVIEW CHECKLIST ====================

export const SELF_REVIEW_CHECKLIST = {
  research: [
    "□ All facts verified with sources",
    "□ Data is current and relevant",
    "□ Contradictory information noted",
    "□ Methodology documented",
  ],
  writing: [
    "□ No grammar or spelling errors",
    "□ Clear structure with headings",
    "□ Tone appropriate for audience",
    "□ Call to action included",
  ],
  design: [
    "□ Brand guidelines followed",
    "□ Visual hierarchy clear",
    "□ All assets properly exported",
    "□ Responsive/adaptive if applicable",
  ],
  code: [
    "□ Error handling implemented",
    "□ Code is documented",
    "□ No hardcoded secrets",
    "□ Tests pass (if applicable)",
  ],
  analysis: [
    "□ Methodology explained",
    "□ Confidence intervals noted",
    "□ Limitations acknowledged",
    "□ Recommendations actionable",
  ],
};

/**
 * Get self-review checklist for task type
 */
export function getSelfReviewChecklist(taskCategory: string): string[] {
  const normalized = taskCategory.toLowerCase();
  
  if (normalized.includes("research")) return SELF_REVIEW_CHECKLIST.research;
  if (normalized.includes("write") || normalized.includes("copy")) return SELF_REVIEW_CHECKLIST.writing;
  if (normalized.includes("design")) return SELF_REVIEW_CHECKLIST.design;
  if (normalized.includes("code") || normalized.includes("engineer")) return SELF_REVIEW_CHECKLIST.code;
  if (normalized.includes("analy")) return SELF_REVIEW_CHECKLIST.analysis;
  
  // Default: combine all
  return [
    ...SELF_REVIEW_CHECKLIST.research.slice(0, 2),
    ...SELF_REVIEW_CHECKLIST.writing.slice(0, 2),
  ];
}

// ==================== PEER REVIEW ASSIGNMENT ====================

/**
 * Find appropriate peer reviewer
 */
export function findPeerReviewer(
  originalAgent: AgentRole,
  podMates: AgentRole[],
  unavailableAgents: AgentRole[] = []
): AgentRole | null {
  // Filter out original agent and unavailable
  const available = podMates.filter(
    r => r !== originalAgent && !unavailableAgents.includes(r)
  );

  if (available.length === 0) return null;

  // Prefer similar roles first
  const sameRole = available.find(r => r === originalAgent);
  if (sameRole) return sameRole;

  // Otherwise pick randomly to distribute load
  return available[Math.floor(Math.random() * available.length)];
}

// Singleton instance
export const qualityGateManager = new QualityGateManager();
