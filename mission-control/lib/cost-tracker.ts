/**
 * COST TRACKER - CFO Dashboard & Model Optimization
 * 
 * Model Assignment Strategy:
 * - Simple tasks (formatting, summaries): Ollama local (free)
 * - Standard tasks (writing, analysis): Kimi K2.5 ($0.14/$0.28 per 1M tokens)
 * - Complex tasks (architecture, debugging): Opus 4.6 ($15/$75 per 1M tokens)
 * - Emergency tasks: Fastest available
 * 
 * Daily budget tracking:
 * - Track token usage per agent
 * - Alert if >$10/day
 * - Weekly cost reports
 */

import { AgentRole, ModelPricing, AgentCostRecord, DailyCostSummary, CFOReport } from "@/types";
import { Id } from "@/convex/_generated/dataModel";

// ==================== MODEL PRICING (per 1M tokens) ====================

export const MODEL_PRICING: Record<string, ModelPricing> = {
  "ollama": {
    name: "Ollama (Local)",
    inputCostPer1M: 0,
    outputCostPer1M: 0,
    avgSpeed: "medium",
    useCase: "Simple tasks: formatting, summaries, basic queries",
  },
  "kimi-k2.5": {
    name: "Kimi K2.5",
    inputCostPer1M: 0.14,
    outputCostPer1M: 0.28,
    avgSpeed: "fast",
    useCase: "Standard tasks: writing, analysis, research",
  },
  "kimi-k2.5-long": {
    name: "Kimi K2.5 Long Context",
    inputCostPer1M: 0.14,
    outputCostPer1M: 0.28,
    avgSpeed: "medium",
    useCase: "Long document processing",
  },
  "opus-4.6": {
    name: "Opus 4.6",
    inputCostPer1M: 15.00,
    outputCostPer1M: 75.00,
    avgSpeed: "slow",
    useCase: "Complex tasks: architecture, debugging, deep analysis",
  },
  "gemini-flash": {
    name: "Gemini Flash",
    inputCostPer1M: 0.075,
    outputCostPer1M: 0.30,
    avgSpeed: "fast",
    useCase: "Fast, cheap tasks with quality trade-off",
  },
};

// ==================== BUDGET CONFIGURATION ====================

export const BUDGET_CONFIG = {
  dailyLimit: 10.00,        // USD per day
  weeklyLimit: 50.00,       // USD per week
  monthlyLimit: 200.00,     // USD per month
  alertThresholds: {
    warning: 0.7,           // 70% of budget
    critical: 0.9,          // 90% of budget
    exceeded: 1.0,          // 100% of budget
  },
};

// ==================== MODEL ASSIGNMENT RULES ====================

export interface TaskModelAssignment {
  taskType: string;
  recommendedModel: string;
  fallbackModels: string[];
  maxBudget?: number;
  rationale: string;
}

export const MODEL_ASSIGNMENT_RULES: TaskModelAssignment[] = [
  {
    taskType: "formatting",
    recommendedModel: "ollama",
    fallbackModels: ["kimi-k2.5"],
    rationale: "Simple formatting doesn't need cloud models",
  },
  {
    taskType: "summarization",
    recommendedModel: "ollama",
    fallbackModels: ["kimi-k2.5"],
    rationale: "Summaries are straightforward - use local first",
  },
  {
    taskType: "research",
    recommendedModel: "kimi-k2.5",
    fallbackModels: ["gemini-flash"],
    rationale: "Research needs reliable web search and analysis",
  },
  {
    taskType: "writing",
    recommendedModel: "kimi-k2.5",
    fallbackModels: ["gemini-flash", "ollama"],
    rationale: "Writing needs quality but doesn't require Opus",
  },
  {
    taskType: "analysis",
    recommendedModel: "kimi-k2.5",
    fallbackModels: ["opus-4.6"],
    maxBudget: 2.00,
    rationale: "Most analysis is fine with Kimi; escalate to Opus for complex cases",
  },
  {
    taskType: "architecture",
    recommendedModel: "opus-4.6",
    fallbackModels: ["kimi-k2.5"],
    maxBudget: 5.00,
    rationale: "Architecture decisions are high-stakes - use best model",
  },
  {
    taskType: "debugging",
    recommendedModel: "opus-4.6",
    fallbackModels: ["kimi-k2.5"],
    maxBudget: 3.00,
    rationale: "Complex debugging benefits from strongest reasoning",
  },
  {
    taskType: "design",
    recommendedModel: "kimi-k2.5",
    fallbackModels: ["ollama"],
    rationale: "Design guidance works well with Kimi",
  },
  {
    taskType: "emergency",
    recommendedModel: "kimi-k2.5",
    fallbackModels: ["gemini-flash", "ollama"],
    rationale: "Emergency = fastest available that can do the job",
  },
];

// ==================== COST TRACKER CLASS ====================

export class CostTracker {
  private records: AgentCostRecord[];
  private dailySummaries: Map<string, DailyCostSummary>;

  constructor() {
    this.records = [];
    this.dailySummaries = new Map();
  }

  /**
   * Record a cost event
   */
  recordCost(
    agentRole: AgentRole,
    taskId: Id<"tasks">,
    model: string,
    inputTokens: number,
    outputTokens: number
  ): AgentCostRecord {
    const pricing = MODEL_PRICING[model] || MODEL_PRICING["kimi-k2.5"];
    
    const inputCost = (inputTokens / 1_000_000) * pricing.inputCostPer1M;
    const outputCost = (outputTokens / 1_000_000) * pricing.outputCostPer1M;
    const totalCost = inputCost + outputCost;

    const record: AgentCostRecord = {
      agentRole,
      taskId,
      model,
      inputTokens,
      outputTokens,
      totalTokens: inputTokens + outputTokens,
      cost: Math.round(totalCost * 1000) / 1000, // Round to 3 decimal places
      timestamp: Date.now(),
    };

    this.records.push(record);
    this.updateDailySummary(record);

    return record;
  }

  /**
   * Update daily summary with new record
   */
  private updateDailySummary(record: AgentCostRecord): void {
    const date = new Date(record.timestamp).toISOString().split('T')[0];
    
    let summary = this.dailySummaries.get(date);
    if (!summary) {
      summary = {
        date,
        totalCost: 0,
        byAgent: {} as Record<AgentRole, number>,
        byModel: {},
        taskCount: 0,
        avgCostPerTask: 0,
        alerts: [],
      };
      this.dailySummaries.set(date, summary);
    }

    // Update totals
    summary.totalCost += record.cost;
    summary.taskCount++;
    summary.avgCostPerTask = summary.totalCost / summary.taskCount;

    // Update by agent
    summary.byAgent[record.agentRole] = (summary.byAgent[record.agentRole] || 0) + record.cost;

    // Update by model
    summary.byModel[record.model] = (summary.byModel[record.model] || 0) + record.cost;

    // Check alerts
    summary.alerts = this.checkBudgetAlerts(summary.totalCost);
  }

  /**
   * Check budget alerts
   */
  private checkBudgetAlerts(dailyCost: number): string[] {
    const alerts: string[] = [];
    const ratio = dailyCost / BUDGET_CONFIG.dailyLimit;

    if (ratio >= BUDGET_CONFIG.alertThresholds.exceeded) {
      alerts.push(`🚨 DAILY BUDGET EXCEEDED: $${dailyCost.toFixed(2)} / $${BUDGET_CONFIG.dailyLimit}`);
    } else if (ratio >= BUDGET_CONFIG.alertThresholds.critical) {
      alerts.push(`⚠️ Daily budget at 90%: $${dailyCost.toFixed(2)} / $${BUDGET_CONFIG.dailyLimit}`);
    } else if (ratio >= BUDGET_CONFIG.alertThresholds.warning) {
      alerts.push(`💡 Daily budget at 70%: $${dailyCost.toFixed(2)} / $${BUDGET_CONFIG.dailyLimit}`);
    }

    return alerts;
  }

  /**
   * Get cost for a specific task
   */
  getTaskCost(taskId: Id<"tasks">): number {
    return this.records
      .filter(r => r.taskId === taskId)
      .reduce((sum, r) => sum + r.cost, 0);
  }

  /**
   * Get daily summary
   */
  getDailySummary(date?: string): DailyCostSummary | null {
    const targetDate = date || new Date().toISOString().split('T')[0];
    return this.dailySummaries.get(targetDate) || null;
  }

  /**
   * Get weekly report
   */
  getWeeklyReport(endDate?: Date): CFOReport {
    const end = endDate || new Date();
    const start = new Date(end);
    start.setDate(start.getDate() - 7);

    const startStr = start.toISOString().split('T')[0];
    const endStr = end.toISOString().split('T')[0];

    // Collect all records in date range
    const records = this.records.filter(r => {
      const date = new Date(r.timestamp).toISOString().split('T')[0];
      return date >= startStr && date <= endStr;
    });

    // Calculate totals
    const totalSpend = records.reduce((sum, r) => sum + r.cost, 0);
    
    // By agent
    const byAgent: Record<AgentRole, { cost: number; tasks: number }> = {} as any;
    for (const record of records) {
      if (!byAgent[record.agentRole]) {
        byAgent[record.agentRole] = { cost: 0, tasks: 0 };
      }
      byAgent[record.agentRole].cost += record.cost;
      byAgent[record.agentRole].tasks++;
    }

    // Top costs
    const topCosts = Object.entries(byAgent)
      .map(([agent, data]) => ({ agent: agent as AgentRole, ...data }))
      .sort((a, b) => b.cost - a.cost)
      .slice(0, 5);

    // Generate recommendations
    const recommendations: string[] = [];
    
    // Check for expensive agents
    for (const { agent, cost, tasks } of topCosts) {
      if (cost > BUDGET_CONFIG.weeklyLimit * 0.3) {
        recommendations.push(`${agent} used 30%+ of budget ($${cost.toFixed(2)}) - review model assignments`);
      }
      const avgCost = cost / tasks;
      if (avgCost > 0.50) {
        recommendations.push(`${agent} avg $${avgCost.toFixed(2)}/task - consider Ollama for simpler tasks`);
      }
    }

    // Check budget utilization
    const utilization = totalSpend / BUDGET_CONFIG.weeklyLimit;
    if (utilization > 1) {
      recommendations.push(`Weekly budget exceeded by ${((utilization - 1) * 100).toFixed(0)}% - implement stricter model routing`);
    } else if (utilization > 0.8) {
      recommendations.push(`Weekly budget at ${(utilization * 100).toFixed(0)}% - monitor closely`);
    }

    return {
      period: "weekly",
      startDate: startStr,
      endDate: endStr,
      totalSpend: Math.round(totalSpend * 100) / 100,
      budgetRemaining: Math.round((BUDGET_CONFIG.weeklyLimit - totalSpend) * 100) / 100,
      budgetUtilization: utilization,
      topCosts,
      efficiencyScore: Math.max(0, 100 - (utilization * 50)), // Simple efficiency score
      recommendations,
    };
  }

  /**
   * Get recommended model for task
   */
  getRecommendedModel(taskType: string, urgency: "normal" | "high" | "emergency" = "normal"): {
    model: string;
    estimatedCost: number;
    rationale: string;
  } {
    // Emergency = fastest, cost secondary
    if (urgency === "emergency") {
      return {
        model: "kimi-k2.5",
        estimatedCost: 0.10,
        rationale: "Emergency task - prioritize speed over cost",
      };
    }

    // Find matching rule
    const normalizedType = taskType.toLowerCase();
    const rule = MODEL_ASSIGNMENT_RULES.find(r => 
      normalizedType.includes(r.taskType) || r.taskType.includes(normalizedType)
    );

    if (!rule) {
      // Default to Kimi
      return {
        model: "kimi-k2.5",
        estimatedCost: 0.10,
        rationale: "No specific rule matched - using default (Kimi K2.5)",
      };
    }

    // Check budget
    const today = new Date().toISOString().split('T')[0];
    const todayCost = this.dailySummaries.get(today)?.totalCost || 0;
    
    if (todayCost >= BUDGET_CONFIG.dailyLimit * 0.9) {
      // Budget tight - use fallback
      return {
        model: rule.fallbackModels[0] || "ollama",
        estimatedCost: 0.01,
        rationale: `Budget at ${(todayCost / BUDGET_CONFIG.dailyLimit * 100).toFixed(0)}% - using cost-saving fallback`,
      };
    }

    const pricing = MODEL_PRICING[rule.recommendedModel];
    const avgTokens = 100_000; // Assume 100K tokens average
    const estimatedCost = (avgTokens / 1_000_000) * (pricing.inputCostPer1M + pricing.outputCostPer1M);

    return {
      model: rule.recommendedModel,
      estimatedCost: Math.round(estimatedCost * 1000) / 1000,
      rationale: rule.rationale,
    };
  }

  /**
   * Estimate task cost before execution
   */
  estimateCost(model: string, estimatedInputTokens: number, estimatedOutputTokens: number): number {
    const pricing = MODEL_PRICING[model] || MODEL_PRICING["kimi-k2.5"];
    const inputCost = (estimatedInputTokens / 1_000_000) * pricing.inputCostPer1M;
    const outputCost = (estimatedOutputTokens / 1_000_000) * pricing.outputCostPer1M;
    return Math.round((inputCost + outputCost) * 1000) / 1000;
  }
}

// ==================== COST OPTIMIZATION UTILITIES ====================

/**
 * Suggest model switch to save costs
 */
export function suggestCostOptimization(
  currentModel: string,
  taskType: string,
  currentCost: number
): { suggestion: string; potentialSavings: number } | null {
  if (currentModel === "ollama") return null; // Already cheapest

  // Check if can downgrade
  const rule = MODEL_ASSIGNMENT_RULES.find(r => taskType.toLowerCase().includes(r.taskType));
  if (!rule) return null;

  const currentIndex = rule.fallbackModels.indexOf(currentModel);
  if (currentIndex === -1 || currentIndex === rule.fallbackModels.length - 1) return null;

  const cheaperModel = rule.fallbackModels[currentIndex + 1];
  const cheaperPricing = MODEL_PRICING[cheaperModel];
  
  if (!cheaperPricing) return null;

  // Assume similar token usage
  const potentialSavings = currentCost * 0.5; // Rough estimate

  return {
    suggestion: `Consider using ${cheaperPricing.name} for this ${taskType} task`,
    potentialSavings: Math.round(potentialSavings * 100) / 100,
  };
}

/**
 * Get cost-efficient alternative models
 */
export function getCostEfficientAlternatives(taskType: string): string[] {
  const rule = MODEL_ASSIGNMENT_RULES.find(r => taskType.toLowerCase().includes(r.taskType));
  if (!rule) return ["kimi-k2.5", "ollama"];

  return rule.fallbackModels.filter(m => m !== rule.recommendedModel);
}

// ==================== EXPORT CONSTANTS ====================

export const COST_CONSTANTS = {
  FREE_TIER: "ollama",
  STANDARD_TIER: "kimi-k2.5",
  PREMIUM_TIER: "opus-4.6",
  
  // Token estimates for common tasks
  TOKEN_ESTIMATES: {
    shortQuery: { input: 500, output: 1000 },
    researchTask: { input: 5000, output: 3000 },
    writingTask: { input: 2000, output: 5000 },
    analysisTask: { input: 10000, output: 5000 },
    codingTask: { input: 5000, output: 3000 },
  },
};

// Singleton instance
export const costTracker = new CostTracker();
