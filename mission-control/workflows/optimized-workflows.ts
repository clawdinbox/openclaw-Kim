/**
 * OPTIMIZED WORKFLOWS - 14 Agent Team
 * 
 * Workflow A: Morning Intelligence (Daily 06:00)
 * Workflow B: Content Factory (Daily)
 * Workflow C: Product Launch (Project Mode)
 * Workflow D: Revenue Optimization (Weekly)
 */

import { Id } from "@/convex/_generated/dataModel";
import { AgentRole, WorkflowStep } from "@/types";

// ==================== WORKFLOW A: MORNING INTELLIGENCE ====================

export type MorningIntelligenceStep =
  | "scan"
  | "analysis"
  | "product-implications"
  | "cso-brief"
  | "complete";

export interface MorningIntelligenceContext {
  date: string;
  scanResults?: string[];
  analysisReport?: string;
  productImplications?: string;
  csoBrief?: string;
  keySignals?: string[];
}

export const MORNING_INTELLIGENCE_WORKFLOW: WorkflowStep[] = [
  {
    step: 1,
    key: "scan",
    agentRole: "research-associate",
    title: "Daily Intelligence Scan (30min)",
    description: "Quick scan of Business of Fashion, WWD, Vogue Business, Financial Times. Identify 5-10 key signals. 80% reactive (news), 20% proactive (deep dive triggers).",
    estimatedDuration: 30,
    dependsOn: [],
    outputType: "intelligence-scan",
    reviewRequired: false,
  },
  {
    step: 2,
    key: "analysis",
    agentRole: "senior-analyst",
    title: "Deep Analysis",
    description: "Analyze signals identified by Research Associate. Provide context, connect dots, identify patterns. Output: Structured analysis with strategic implications.",
    estimatedDuration: 45,
    dependsOn: [1],
    outputType: "analysis-report",
    reviewRequired: false,
  },
  {
    step: 3,
    key: "product-implications",
    agentRole: "product-manager",
    title: "Product Implications Assessment",
    description: "Translate market intelligence into product opportunities and roadmap adjustments. Identify what we should build or pivot based on signals.",
    estimatedDuration: 30,
    dependsOn: [2],
    outputType: "product-implications",
    reviewRequired: false,
  },
  {
    step: 4,
    key: "cso-brief",
    agentRole: "cso",
    title: "CSO Brief to CEO",
    description: "Consolidate intelligence, analysis, and product implications into executive brief. Flag urgent items for immediate attention.",
    estimatedDuration: 15,
    dependsOn: [3],
    outputType: "executive-brief",
    reviewRequired: true, // Kim review before CEO
    qualityGates: ["self-review", "kim-review"],
  },
];

// ==================== WORKFLOW B: CONTENT FACTORY ====================

export type ContentFactoryStep =
  | "topic-research"
  | "copy-draft"
  | "visual-design"
  | "cmo-approval"
  | "auto-post"
  | "complete";

export interface ContentFactoryContext {
  topic: string;
  targetPlatforms: string[];
  contentType: "carousel" | "single" | "thread" | "newsletter";
  researchNotes?: string;
  draftCopy?: string;
  visualAssets?: string[];
  approvedContent?: string;
  scheduledPosts?: string[];
}

export const CONTENT_FACTORY_WORKFLOW: WorkflowStep[] = [
  {
    step: 1,
    key: "topic-research",
    agentRole: "research-associate",
    title: "Topic Research",
    description: "Research topic, gather data points, identify key insights, find supporting evidence. Output: Research brief with angle recommendations.",
    estimatedDuration: 20,
    dependsOn: [],
    outputType: "topic-brief",
    reviewRequired: false,
  },
  {
    step: 2,
    key: "copy-draft",
    agentRole: "copywriter",
    title: "Copywriting - Text Draft",
    description: "Write compelling copy based on research brief. Create platform-specific versions. Output: Platform-optimized copy (LinkedIn, X, Instagram, etc.).",
    estimatedDuration: 30,
    dependsOn: [1],
    outputType: "copy-draft",
    reviewRequired: false,
  },
  {
    step: 3,
    key: "visual-design",
    agentRole: "content-designer",
    title: "Visual Asset Creation",
    description: "Create visual assets matching copy. Design carousel slides, image layouts, or single graphics. Ensure brand consistency.",
    estimatedDuration: 45,
    dependsOn: [2],
    outputType: "visual-assets",
    reviewRequired: false,
  },
  {
    step: 4,
    key: "cmo-approval",
    agentRole: "cmo",
    title: "CMO Review & Approval",
    description: "Review copy and visuals for brand alignment, strategic fit, and quality. Approve or request revisions. Gate before scheduling.",
    estimatedDuration: 15,
    dependsOn: [3],
    outputType: "approval-decision",
    reviewRequired: true,
    qualityGates: ["peer-review", "cmo-review"],
  },
  {
    step: 5,
    key: "auto-post",
    agentRole: "launch-manager",
    title: "Schedule & Auto-Post",
    description: "Schedule content across platforms using Postiz. Set optimal timing. Configure tracking. Confirm posting.",
    estimatedDuration: 10,
    dependsOn: [4],
    outputType: "scheduled-posts",
    reviewRequired: false,
  },
];

// ==================== WORKFLOW C: PRODUCT LAUNCH ====================

export type ProductLaunchStep =
  | "market-validation"
  | "product-roadmap"
  | "asset-design"
  | "sales-copy"
  | "pricing-strategy"
  | "launch-execution"
  | "sales-outreach"
  | "complete";

export interface ProductLaunchContext {
  productName: string;
  productType: "ebook" | "guide" | "template" | "course" | "toolkit";
  targetAudience?: string;
  deadline?: number;
  marketValidation?: string;
  roadmap?: string;
  designAssets?: string[];
  copyContent?: {
    title?: string;
    description?: string;
    salesPage?: string;
    emailSequence?: string[];
  };
  pricing?: {
    recommendedPrice: number;
    bundleOptions?: string[];
    promoPrice?: number;
  };
  launchStatus?: string;
}

export const PRODUCT_LAUNCH_WORKFLOW: WorkflowStep[] = [
  {
    step: 1,
    key: "market-validation",
    agentRole: "research-associate",
    title: "Market Validation",
    description: "Research target market, analyze competitor products, validate demand signals. Output: Market validation report with competitor analysis.",
    estimatedDuration: 90,
    dependsOn: [],
    outputType: "validation-report",
    reviewRequired: false,
  },
  {
    step: 2,
    key: "product-roadmap",
    agentRole: "product-manager",
    title: "Product Roadmap & MVP Definition",
    description: "Define product scope, features, and development roadmap. Create user stories. Set success metrics.",
    estimatedDuration: 120,
    dependsOn: [1],
    outputType: "product-roadmap",
    reviewRequired: true,
    qualityGates: ["self-review", "kim-review"],
  },
  {
    step: 3,
    key: "asset-design",
    agentRole: "content-designer",
    title: "Asset Design & Layout",
    description: "Create all visual assets: product layout, cover design, marketing graphics. Ensure premium quality.",
    estimatedDuration: 240,
    dependsOn: [2],
    outputType: "design-assets",
    reviewRequired: true,
    qualityGates: ["peer-review"],
  },
  {
    step: 4,
    key: "sales-copy",
    agentRole: "copywriter",
    title: "Sales Copy & Content",
    description: "Write all copy: product title, description, sales page, email sequences, social snippets.",
    estimatedDuration: 180,
    dependsOn: [2],
    outputType: "copy-package",
    reviewRequired: true,
    qualityGates: ["peer-review"],
  },
  {
    step: 5,
    key: "pricing-strategy",
    agentRole: "pricing-analyst",
    title: "Pricing Strategy & Bundles",
    description: "Analyze market positioning, recommend price point, design bundle options. A/B test plan.",
    estimatedDuration: 90,
    dependsOn: [3, 4],
    outputType: "pricing-strategy",
    reviewRequired: true,
    qualityGates: ["kim-review"],
  },
  {
    step: 6,
    key: "launch-execution",
    agentRole: "launch-manager",
    title: "Launch Execution",
    description: "Configure Gumroad, upload assets, set up analytics, coordinate promotion timing. Push live.",
    estimatedDuration: 120,
    dependsOn: [5],
    outputType: "live-product",
    reviewRequired: true,
    qualityGates: ["cmo-review"],
  },
  {
    step: 7,
    key: "sales-outreach",
    agentRole: "sales-executive",
    title: "Sales Outreach & Lead Gen",
    description: "Begin outreach to qualified leads. Track pipeline. Follow up on launch. Report conversions.",
    estimatedDuration: 60,
    dependsOn: [6],
    outputType: "sales-activities",
    reviewRequired: false,
  },
];

// ==================== WORKFLOW D: REVENUE OPTIMIZATION ====================

export type RevenueOptimizationStep =
  | "metrics-analysis"
  | "price-testing"
  | "pipeline-review"
  | "strategy-alignment"
  | "cfo-decisions"
  | "complete";

export interface RevenueOptimizationContext {
  weekOf: string;
  metricsReport?: string;
  priceTestResults?: string;
  pipelineStatus?: string;
  strategyRecommendations?: string;
  decisions?: string[];
}

export const REVENUE_OPTIMIZATION_WORKFLOW: WorkflowStep[] = [
  {
    step: 1,
    key: "metrics-analysis",
    agentRole: "data-analyst",
    title: "Weekly Metrics Analysis",
    description: "Analyze all KPIs: content performance, sales metrics, conversion rates, product usage. Identify trends and anomalies.",
    estimatedDuration: 120,
    dependsOn: [],
    outputType: "metrics-report",
    reviewRequired: false,
  },
  {
    step: 2,
    key: "price-testing",
    agentRole: "pricing-analyst",
    title: "Price Testing & Optimization",
    description: "Review A/B test results, analyze price elasticity, recommend adjustments. Test new bundle configurations.",
    estimatedDuration: 90,
    dependsOn: [1],
    outputType: "price-analysis",
    reviewRequired: false,
  },
  {
    step: 3,
    key: "pipeline-review",
    agentRole: "sales-executive",
    title: "Sales Pipeline Review",
    description: "Review all active deals, forecast accuracy, pipeline velocity. Identify stuck deals and next actions.",
    estimatedDuration: 60,
    dependsOn: [1],
    outputType: "pipeline-report",
    reviewRequired: false,
  },
  {
    step: 4,
    key: "strategy-alignment",
    agentRole: "cmo",
    title: "Marketing Strategy Alignment",
    description: "Align marketing strategy with metrics and pipeline status. Adjust campaigns. Optimize spend allocation.",
    estimatedDuration: 60,
    dependsOn: [2, 3],
    outputType: "strategy-adjustments",
    reviewRequired: false,
  },
  {
    step: 5,
    key: "cfo-decisions",
    agentRole: "cso",
    title: "CFO Strategic Decisions",
    description: "Review all revenue inputs, make strategic decisions on pricing, investment, and resource allocation. Final authority.",
    estimatedDuration: 30,
    dependsOn: [4],
    outputType: "strategic-decisions",
    reviewRequired: true,
    qualityGates: ["kim-review"],
  },
];

// ==================== WORKFLOW UTILITIES ====================

export const WORKFLOW_CONFIGS = {
  "morning-intelligence": {
    name: "Morning Intelligence",
    description: "Daily 06:00 intelligence briefing workflow",
    cronExpression: "0 6 * * *", // Daily at 6 AM
    estimatedDuration: 120, // 2 hours total
    priority: "p1" as const,
  },
  "content-factory": {
    name: "Content Factory",
    description: "Daily content production workflow",
    cronExpression: "0 9 * * *", // Daily at 9 AM
    estimatedDuration: 120, // 2 hours total
    priority: "p1" as const,
  },
  "product-launch": {
    name: "Product Launch",
    description: "End-to-end product launch workflow",
    estimatedDuration: 900, // 15 hours total (spread over days)
    priority: "p0" as const,
  },
  "revenue-optimization": {
    name: "Revenue Optimization",
    description: "Weekly revenue review and optimization",
    cronExpression: "0 10 * * 1", // Mondays at 10 AM
    estimatedDuration: 360, // 6 hours total
    priority: "p1" as const,
  },
};

/**
 * Get workflow by type
 */
export function getWorkflow(type: keyof typeof WORKFLOW_CONFIGS): WorkflowStep[] {
  switch (type) {
    case "morning-intelligence":
      return MORNING_INTELLIGENCE_WORKFLOW;
    case "content-factory":
      return CONTENT_FACTORY_WORKFLOW;
    case "product-launch":
      return PRODUCT_LAUNCH_WORKFLOW;
    case "revenue-optimization":
      return REVENUE_OPTIMIZATION_WORKFLOW;
    default:
      return [];
  }
}

/**
 * Calculate workflow timeline
 */
export function calculateWorkflowTimeline(
  workflow: WorkflowStep[],
  startTime: number = Date.now()
): Array<{ step: number; key: string; scheduledStart: number; scheduledEnd: number }> {
  const stepTimes: Map<number, { start: number; end: number }> = new Map();
  
  for (const step of workflow) {
    let earliestStart = startTime;
    for (const dep of step.dependsOn) {
      const depTime = stepTimes.get(dep);
      if (depTime && depTime.end > earliestStart) {
        earliestStart = depTime.end;
      }
    }
    
    const endTime = earliestStart + step.estimatedDuration * 60 * 1000;
    stepTimes.set(step.step, { start: earliestStart, end: endTime });
  }
  
  return workflow.map((step) => ({
    step: step.step,
    key: step.key,
    scheduledStart: stepTimes.get(step.step)!.start,
    scheduledEnd: stepTimes.get(step.step)!.end,
  }));
}

/**
 * Find next available agent in a pod
 */
export function findAvailableAgentInPod(
  podAgents: Array<{ role: AgentRole; workload: number; maxWorkload: number }>,
  preferredRole?: AgentRole
): AgentRole | null {
  // If preferred role specified and available, use it
  if (preferredRole) {
    const preferred = podAgents.find(a => a.role === preferredRole);
    if (preferred && preferred.workload < preferred.maxWorkload) {
      return preferredRole;
    }
  }
  
  // Otherwise, find least loaded agent
  const available = podAgents
    .filter(a => a.workload < a.maxWorkload)
    .sort((a, b) => a.workload - b.workload);
  
  return available.length > 0 ? available[0].role : null;
}
