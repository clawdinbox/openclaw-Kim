/**
 * Digital Product Launch Workflow
 * 
 * Orchestrates the complete digital product creation and launch pipeline.
 * Research → Content Designer (Layout) → Copywriter (Text) → Pricing Analyst (Price) → CMO Review → Launch Manager (Live)
 * 
 * Trigger: "digital product" tasks or manual initiation
 * Duration: Typically 3-5 days depending on complexity
 */

import { Id } from "@/convex/_generated/dataModel";

export type DigitalProductStep =
  | "research"
  | "design"
  | "copywriting"
  | "pricing"
  | "cmo-review"
  | "launch-setup"
  | "complete";

export interface DigitalProductWorkflowContext {
  productId?: string;
  productName: string;
  productType: "ebook" | "guide" | "template" | "course" | "toolkit" | "other";
  targetAudience?: string;
  estimatedPageCount?: number;
  deadline?: number; // timestamp
  researchNotes?: string;
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
  launchConfig?: {
    platform: "gumroad" | "stan-store" | "other";
    launchDate?: number;
    promoChannels?: string[];
  };
}

export interface WorkflowStep {
  step: number;
  key: DigitalProductStep;
  agentRole: string;
  title: string;
  description: string;
  estimatedDuration: number; // minutes
  dependsOn: number[];
  outputType?: string;
  reviewRequired: boolean;
}

export const DIGITAL_PRODUCT_WORKFLOW: WorkflowStep[] = [
  {
    step: 1,
    key: "research",
    agentRole: "research-associate",
    title: "Market Research & Competitor Analysis",
    description: "Research target market, analyze competitor products, identify gaps and opportunities. Gather pricing benchmarks and positioning data.",
    estimatedDuration: 120,
    dependsOn: [],
    outputType: "research-report",
    reviewRequired: false,
  },
  {
    step: 2,
    key: "design",
    agentRole: "content-designer",
    title: "Visual Design & Layout",
    description: "Create professional layout, design cover, establish visual hierarchy, ensure brand consistency. Produce print-ready PDF assets.",
    estimatedDuration: 240,
    dependsOn: [1],
    outputType: "design-assets",
    reviewRequired: true,
  },
  {
    step: 3,
    key: "copywriting",
    agentRole: "copywriter",
    title: "Sales Copy & Product Content",
    description: "Write compelling product title, description, sales page copy, and launch email sequence. Optimize for conversion.",
    estimatedDuration: 180,
    dependsOn: [2],
    outputType: "copy-package",
    reviewRequired: true,
  },
  {
    step: 4,
    key: "pricing",
    agentRole: "pricing-analyst",
    title: "Pricing Strategy & Bundle Design",
    description: "Analyze market positioning, recommend optimal price point, design bundle options, set up A/B test parameters.",
    estimatedDuration: 90,
    dependsOn: [2, 3], // Can start once design and copy are underway
    outputType: "pricing-strategy",
    reviewRequired: true,
  },
  {
    step: 5,
    key: "cmo-review",
    agentRole: "cmo",
    title: "CMO Review & Approval",
    description: "Review all assets, ensure brand alignment, approve pricing, validate launch readiness. Provide final sign-off.",
    estimatedDuration: 60,
    dependsOn: [3, 4],
    outputType: "approval-decision",
    reviewRequired: true,
  },
  {
    step: 6,
    key: "launch-setup",
    agentRole: "launch-manager",
    title: "Platform Setup & Go-Live",
    description: "Configure Gumroad product page, set up analytics tracking, schedule launch, coordinate promotion timing. Push live.",
    estimatedDuration: 120,
    dependsOn: [5],
    outputType: "live-product",
    reviewRequired: false,
  },
];

/**
 * Task templates for each workflow step
 */
export const WORKFLOW_TASK_TEMPLATES: Record<DigitalProductStep, {
  title: string;
  description: string;
  priority: "p0" | "p1" | "p2";
}> = {
  research: {
    title: "🔍 Research: {productName}",
    description: "Conduct comprehensive market research for {productName}.\n\nDeliverables:\n• Competitor product analysis (top 5)\n• Market positioning recommendations\n• Pricing benchmarks\n• Target audience insights\n• Gap analysis and opportunities",
    priority: "p1",
  },
  design: {
    title: "🎨 Design Layout: {productName}",
    description: "Create professional visual design for {productName}.\n\nDeliverables:\n• Complete layout design (cover, chapters, back matter)\n• Typography system and color palette\n• All image assets optimized for print/PDF\n• Brand-consistent styling\n• Source files and export package",
    priority: "p1",
  },
  copywriting: {
    title: "✍️ Write Copy: {productName}",
    description: "Craft persuasive copy for {productName}.\n\nDeliverables:\n• Product title and tagline (3 options)\n• Product description (short + long)\n• Complete sales page copy\n• 5-email launch sequence\n• Social media snippets (10x)",
    priority: "p1",
  },
  pricing: {
    title: "💰 Pricing Strategy: {productName}",
    description: "Develop optimal pricing strategy for {productName}.\n\nDeliverables:\n• Recommended price point with justification\n• 2-3 bundle package options\n• Launch promo pricing suggestion\n• A/B test plan for price optimization\n• Revenue projections at different price points",
    priority: "p1",
  },
  "cmo-review": {
    title: "📢 CMO Review: {productName} Launch Ready",
    description: "Review and approve all assets for {productName} launch.\n\nReview checklist:\n□ Visual design aligns with brand standards\n□ Copy is compelling and error-free\n□ Pricing strategy is sound\n□ All assets are complete\n□ Launch timeline is realistic\n\nDecision: APPROVE / REQUEST CHANGES",
    priority: "p0",
  },
  "launch-setup": {
    title: "🚀 Launch: {productName}",
    description: "Execute product launch for {productName}.\n\nTasks:\n• Configure Gumroad product page\n• Upload all digital assets\n• Set up checkout and delivery\n• Configure analytics and tracking\n• Schedule launch announcement\n• Coordinate promotion timing\n• Verify everything works end-to-end",
    priority: "p0",
  },
  complete: {
    title: "✅ Complete: {productName}",
    description: "Workflow complete for {productName}.",
    priority: "p1",
  },
};

/**
 * Calculate workflow timeline
 */
export function calculateWorkflowTimeline(
  workflow: WorkflowStep[],
  startTime: number = Date.now()
): Array<{ step: number; key: DigitalProductStep; scheduledStart: number; scheduledEnd: number }> {
  const stepTimes: Map<number, { start: number; end: number }> = new Map();
  
  for (const step of workflow) {
    // Calculate earliest start based on dependencies
    let earliestStart = startTime;
    for (const dep of step.dependsOn) {
      const depTime = stepTimes.get(dep);
      if (depTime && depTime.end > earliestStart) {
        earliestStart = depTime.end;
      }
    }
    
    const endTime = earliestStart + step.estimatedDuration * 60 * 1000; // convert minutes to ms
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
 * Generate task title and description from template
 */
export function generateTaskFromWorkflowStep(
  stepKey: DigitalProductStep,
  context: DigitalProductWorkflowContext
): { title: string; description: string; priority: "p0" | "p1" | "p2" } {
  const template = WORKFLOW_TASK_TEMPLATES[stepKey];
  
  const title = template.title.replace("{productName}", context.productName);
  const description = template.description.replace(/{productName}/g, context.productName);
  
  return {
    title,
    description,
    priority: template.priority,
  };
}

/**
 * Check if workflow can auto-trigger for a task
 */
export function shouldAutoTriggerWorkflow(taskTitle: string, taskDescription: string): boolean {
  const keywords = [
    "digital product",
    "ebook",
    "guide",
    "template",
    "launch",
    "gumroad",
    "product launch",
    "create product",
  ];
  
  const text = `${taskTitle} ${taskDescription}`.toLowerCase();
  return keywords.some((kw) => text.includes(kw));
}

/**
 * Create initial workflow context from task
 */
export function createWorkflowContextFromTask(
  taskTitle: string,
  taskDescription: string,
  deadline?: number
): DigitalProductWorkflowContext {
  // Extract product name from title
  const productNameMatch = taskTitle.match(/[:\-](.+)$|"([^"]+)"|'([^']+)'/);
  const productName = productNameMatch 
    ? (productNameMatch[1] || productNameMatch[2] || productNameMatch[3] || taskTitle).trim()
    : taskTitle;
  
  // Detect product type
  const text = `${taskTitle} ${taskDescription}`.toLowerCase();
  let productType: DigitalProductWorkflowContext["productType"] = "other";
  if (text.includes("ebook")) productType = "ebook";
  else if (text.includes("guide")) productType = "guide";
  else if (text.includes("template")) productType = "template";
  else if (text.includes("course")) productType = "course";
  else if (text.includes("toolkit")) productType = "toolkit";
  
  return {
    productName,
    productType,
    deadline,
    researchNotes: taskDescription,
  };
}
