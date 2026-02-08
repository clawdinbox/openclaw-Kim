/**
 * Agent Spawner Module
 * 
 * Allows the CSO to programmatically spawn sub-agents with specific roles.
 * This is the core delegation mechanism for the AI company.
 */

import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";

// Role definition file paths
const ROLE_PROMPTS = {
  "senior-analyst": "/mission-control/agents/senior-research-analyst.md",
  "research-associate": "/mission-control/agents/research-associate.md",
  cmo: "/mission-control/agents/cmo-social.md",
  engineer: "/mission-control/agents/lead-software-engineer.md",
  "content-designer": "/mission-control/agents/content-designer.md",
  copywriter: "/mission-control/agents/copywriter.md",
  "pricing-analyst": "/mission-control/agents/pricing-analyst.md",
  "launch-manager": "/mission-control/agents/launch-manager.md",
  "operations-assistant": "/mission-control/agents/operations-assistant.md",
  "sales-executive": "/mission-control/agents/sales-executive.md",
} as const;

type AgentRole = keyof typeof ROLE_PROMPTS;

export interface SpawnAgentParams {
  role: AgentRole;
  task: string;
  priority: "p0" | "p1" | "p2";
  deadline?: number; // timestamp
  context?: string; // additional context
  deliverables?: string[]; // expected outputs
}

export interface AgentSession {
  sessionId: string;
  taskId: Id<"tasks">;
  role: AgentRole;
  status: "spawned" | "working" | "complete" | "error";
  spawnTime: number;
  estimatedCompletion?: number;
}

// Task templates by role for common operations
export const TASK_TEMPLATES: Record<
  AgentRole,
  Record<string, { title: string; description: string; category: string }>
> = {
  "senior-analyst": {
    "market-analysis": {
      title: "Market Analysis: {topic}",
      description:
        "Conduct a comprehensive market analysis on {topic}. Include market size, growth projections, key players, competitive dynamics, and strategic recommendations. Use Porter's Five Forces and other relevant frameworks.",
      category: "Research",
    },
    "company-deep-dive": {
      title: "Company Deep Dive: {company}",
      description:
        "Analyze {company}'s business model, financial performance, competitive positioning, and strategic outlook. Include SWOT analysis and investment thesis.",
      category: "Analysis",
    },
    "trend-report": {
      title: "Trend Report: {trend}",
      description:
        "Research and document the {trend} trend in fashion/luxury. Cover market implications, key players, timeline, and strategic opportunities.",
      category: "Research",
    },
  },
  "research-associate": {
    "daily-brief": {
      title: "Daily Intelligence Brief - {date}",
      description:
        "Compile today's key signals from BoF, WWD, Vogue Business, and FT. Focus on: earnings announcements, executive moves, M&A activity, and emerging trends. Deliver by 9am.",
      category: "Data Collection",
    },
    "competitor-monitoring": {
      title: "Competitor Monitoring: {company}",
      description:
        "Monitor {company}'s recent activities: product launches, marketing campaigns, executive changes, and financial updates. Provide structured summary.",
      category: "Intelligence",
    },
    "data-package": {
      title: "Data Package: {topic}",
      description:
        "Gather market data on {topic}. Include: market size, growth rates, consumer surveys, and relevant statistics. Format as JSON/markdown.",
      category: "Data Collection",
    },
  },
  cmo: {
    "content-calendar": {
      title: "Weekly Content Calendar - Week of {date}",
      description:
        "Plan content for the week. Include: daily post topics, hooks, key insights, and strategic alignment with industry calendar. Map to business goals.",
      category: "Content",
    },
    "campaign-plan": {
      title: "Campaign Plan: {campaign}",
      description:
        "Develop a comprehensive campaign plan for {campaign}. Include: objectives, target audience, content pillars, distribution strategy, and success metrics.",
      category: "Strategy",
    },
    "performance-report": {
      title: "Weekly Performance Report - {date}",
      description:
        "Analyze content performance for the past week. Identify high-performing content, engagement patterns, and recommendations for optimization.",
      category: "Analysis",
    },
  },
  engineer: {
    "tool-development": {
      title: "Build Tool: {tool}",
      description:
        "Develop {tool} to automate/improve our workflow. Requirements: {requirements}. Include error handling, documentation, and tests.",
      category: "Development",
    },
    "integration": {
      title: "Integration: {service}",
      description:
        "Integrate with {service} API. Set up authentication, implement key endpoints, handle webhooks, and document usage.",
      category: "Integration",
    },
    "automation": {
      title: "Automation: {workflow}",
      description:
        "Automate the {workflow} workflow. Reduce manual steps, add error handling, and create monitoring/alerting.",
      category: "Development",
    },
  },
  // Digital Products Team
  "content-designer": {
    "ebook-design": {
      title: "Design Ebook: {product}",
      description:
        "Create a professional visual design for {product}. Include: cover design, chapter layouts, typography system, color palette, and all supporting graphics. Deliver print-ready PDF assets.",
      category: "Design",
    },
    "template-creation": {
      title: "Create Template: {type}",
      description:
        "Design a reusable {type} template with consistent branding. Include master pages, styles, placeholder content, and documentation for customization.",
      category: "Design",
    },
    "brand-refresh": {
      title: "Brand Refresh: Digital Assets",
      description:
        "Update visual branding across all digital product assets. Ensure consistency in typography, colors, and design elements. Deliver updated asset library.",
      category: "Branding",
    },
  },
  copywriter: {
    "sales-page": {
      title: "Write Sales Page: {product}",
      description:
        "Craft a high-converting sales page for {product}. Include: compelling headline, problem-agitation-solution framework, benefit bullets, social proof sections, and strong call-to-action.",
      category: "Copywriting",
    },
    "email-sequence": {
      title: "Email Launch Sequence: {product}",
      description:
        "Write a 5-7 email launch sequence for {product}. Include: teaser, announcement, value education, social proof, urgency/scarcity, and final call emails.",
      category: "Copywriting",
    },
    "product-description": {
      title: "Product Description: {product}",
      description:
        "Create compelling product descriptions for {product}. Write short (50 words), medium (150 words), and long (300 words) versions optimized for different channels.",
      category: "Copywriting",
    },
  },
  "pricing-analyst": {
    "price-optimization": {
      title: "Price Strategy: {product}",
      description:
        "Develop optimal pricing strategy for {product}. Analyze competitor pricing, market positioning, and price elasticity. Recommend base price, bundle options, and promotional pricing.",
      category: "Pricing",
    },
    "bundle-design": {
      title: "Design Bundle: {product}",
      description:
        "Create attractive bundle packages for {product}. Design 2-3 tiers (basic/premium/complete) with clear value propositions and strategic pricing anchors.",
      category: "Pricing",
    },
    "competitor-pricing": {
      title: "Competitor Pricing Analysis",
      description:
        "Analyze competitor pricing in the {market} market. Document pricing tiers, discount strategies, and value metrics. Identify pricing gaps and opportunities.",
      category: "Analysis",
    },
  },
  "launch-manager": {
    "gumroad-setup": {
      title: "Setup Gumroad: {product}",
      description:
        "Configure {product} on Gumroad. Set up product page, upload assets, configure pricing/tiers, enable analytics, and test checkout flow end-to-end.",
      category: "Launch",
    },
    "launch-coordination": {
      title: "Launch: {product}",
      description:
        "Orchestrate the launch of {product}. Coordinate all assets, schedule announcements, set up tracking, and manage the go-live process.",
      category: "Launch",
    },
    "promotion-strategy": {
      title: "Promotion Strategy: {product}",
      description:
        "Develop promotion strategy for {product}. Plan channel mix, timing, budget allocation, and key metrics to track. Create promotion calendar.",
      category: "Strategy",
    },
  },
  // Operations Support
  "operations-assistant": {
    "process-documentation": {
      title: "Document Process: {process}",
      description:
        "Create comprehensive documentation for the {process} process. Include step-by-step instructions, decision trees, responsible parties, and quality checkpoints.",
      category: "Documentation",
    },
    "metrics-report": {
      title: "Weekly Metrics Report - {date}",
      description:
        "Compile weekly operations metrics across all teams. Include task completion rates, quality scores, bottlenecks, and recommendations for improvement.",
      category: "Reporting",
    },
    "workflow-automation": {
      title: "Automate Workflow: {workflow}",
      description:
        "Design and implement automation for the {workflow} workflow. Identify manual steps that can be automated, select appropriate tools, and document the new process.",
      category: "Automation",
    },
    "meeting-notes": {
      title: "Meeting Notes: {meeting}",
      description:
        "Document key discussion points, decisions, and action items from {meeting}. Distribute to stakeholders and track action item completion.",
      category: "Documentation",
    },
    "quality-audit": {
      title: "Quality Audit: {area}",
      description:
        "Conduct quality audit of {area}. Review recent deliverables against standards, identify gaps, and recommend corrective actions.",
      category: "Quality Control",
    },
  },
  // Sales Support
  "sales-executive": {
    "lead-qualification": {
      title: "Qualify Leads: {campaign}",
      description:
        "Review and qualify incoming leads for {campaign}. Score based on BANT criteria (Budget, Authority, Need, Timeline) and prioritize for outreach.",
      category: "Sales",
    },
    "outreach-sequence": {
      title: "Outreach Sequence: {prospect}",
      description:
        "Create personalized multi-touch outreach sequence for {prospect}. Include LinkedIn connection, emails, and value-added touchpoints over 2-week period.",
      category: "Outreach",
    },
    "proposal-writing": {
      title: "Proposal: {opportunity}",
      description:
        "Write compelling sales proposal for {opportunity}. Include executive summary, scope of work, pricing, timeline, and case studies. Address prospect's specific pain points.",
      category: "Sales",
    },
    "crm-management": {
      title: "CRM Cleanup & Update",
      description:
        "Audit and update CRM records. Ensure all opportunities have accurate stage, value, and close date. Identify stale opportunities for follow-up or closure.",
      category: "CRM",
    },
    "deal-tracking": {
      title: "Deal Review: {deal}",
      description:
        "Conduct detailed review of {deal} opportunity. Assess probability of close, identify blockers, and recommend next steps to advance the deal.",
      category: "Sales",
    },
    "follow-up-sequence": {
      title: "Follow-up Sequence: {prospect}",
      description:
        "Design follow-up sequence for {prospect} who has gone silent. Create value-add touchpoints to re-engage without being pushy.",
      category: "Outreach",
    },
  },
};

/**
 * Generate a task from template with variable substitution
 */
export function generateTaskFromTemplate(
  role: AgentRole,
  templateKey: string,
  variables: Record<string, string>,
  priority: "p0" | "p1" | "p2" = "p1",
  deadline?: number
): Omit<SpawnAgentParams, "role"> {
  const template = TASK_TEMPLATES[role][templateKey];
  if (!template) {
    throw new Error(`Unknown template: ${templateKey} for role ${role}`);
  }

  let title = template.title;
  let description = template.description;

  // Replace variables
  Object.entries(variables).forEach(([key, value]) => {
    title = title.replace(`{${key}}`, value);
    description = description.replace(`{${key}}`, value);
  });

  return {
    task: `${title}\n\n${description}`,
    priority,
    deadline,
    context: `Category: ${template.category}`,
  };
}

/**
 * Hook for spawning agents from React components
 */
export function useAgentSpawner() {
  const createTask = useMutation(api.tasks.create);
  const agents = useQuery(api.agents.list);

  const spawnAgent = async (params: SpawnAgentParams): Promise<AgentSession> => {
    const now = Date.now();
    
    // Create the task in Convex
    const taskId = await createTask({
      title: params.task.split("\n")[0],
      description: params.task,
      assignedTo: params.role,
      delegatedBy: "cso",
      priority: params.priority,
      dueAt: params.deadline,
      context: params.context,
    });

    // Start the task automatically
    // Note: In a real implementation, this would trigger a sub-agent session
    // For now, we mark it as created and the agent can pick it up

    return {
      sessionId: `session-${taskId}-${now}`,
      taskId,
      role: params.role,
      status: "spawned",
      spawnTime: now,
      estimatedCompletion: params.deadline,
    };
  };

  const spawnFromTemplate = async (
    role: AgentRole,
    templateKey: string,
    variables: Record<string, string>,
    priority: "p0" | "p1" | "p2" = "p1",
    deadline?: number
  ): Promise<AgentSession> => {
    const taskParams = generateTaskFromTemplate(role, templateKey, variables, priority, deadline);
    return spawnAgent({ role, ...taskParams });
  };

  return {
    spawnAgent,
    spawnFromTemplate,
    getRolePromptPath: (role: AgentRole) => ROLE_PROMPTS[role],
    getAvailableTemplates: (role: AgentRole) => Object.keys(TASK_TEMPLATES[role]),
  };
}

/**
 * Direct function for spawning agents (for use outside React)
 * This would need to be implemented with a Convex client
 */
export async function spawnAgentDirect(
  params: SpawnAgentParams,
  convexClient: any
): Promise<AgentSession> {
  const now = Date.now();

  // This is a placeholder - actual implementation would use convexClient.mutation
  console.log(`[AgentSpawner] Spawning ${params.role} for task:`, params.task.split("\n")[0]);

  return {
    sessionId: `session-${now}`,
    taskId: "placeholder" as Id<"tasks">,
    role: params.role,
    status: "spawned",
    spawnTime: now,
    estimatedCompletion: params.deadline,
  };
}

/**
 * Quick spawn helpers for common tasks
 */
export const QuickSpawns = {
  dailyBrief: () =>
    generateTaskFromTemplate(
      "research-associate",
      "daily-brief",
      { date: new Date().toISOString().split("T")[0] },
      "p1"
    ),
  
  marketAnalysis: (topic: string) =>
    generateTaskFromTemplate(
      "senior-analyst",
      "market-analysis",
      { topic },
      "p1",
      Date.now() + 3 * 24 * 60 * 60 * 1000 // 3 days
    ),
  
  contentCalendar: () =>
    generateTaskFromTemplate(
      "cmo",
      "content-calendar",
      { date: new Date().toISOString().split("T")[0] },
      "p1"
    ),
  
  buildTool: (tool: string, requirements: string) =>
    generateTaskFromTemplate(
      "engineer",
      "tool-development",
      { tool, requirements },
      "p1",
      Date.now() + 7 * 24 * 60 * 60 * 1000 // 1 week
    ),
  
  // Digital Products Quick Spawns
  designEbook: (product: string) =>
    generateTaskFromTemplate(
      "content-designer",
      "ebook-design",
      { product },
      "p1",
      Date.now() + 3 * 24 * 60 * 60 * 1000 // 3 days
    ),

  writeSalesPage: (product: string) =>
    generateTaskFromTemplate(
      "copywriter",
      "sales-page",
      { product },
      "p1",
      Date.now() + 2 * 24 * 60 * 60 * 1000 // 2 days
    ),

  optimizePricing: (product: string) =>
    generateTaskFromTemplate(
      "pricing-analyst",
      "price-optimization",
      { product },
      "p1",
      Date.now() + 2 * 24 * 60 * 60 * 1000 // 2 days
    ),

  launchProduct: (product: string) =>
    generateTaskFromTemplate(
      "launch-manager",
      "gumroad-setup",
      { product },
      "p0",
      Date.now() + 24 * 60 * 60 * 1000 // 1 day
    ),

  // Operations Quick Spawns
  documentProcess: (process: string) =>
    generateTaskFromTemplate(
      "operations-assistant",
      "process-documentation",
      { process },
      "p1",
      Date.now() + 2 * 24 * 60 * 60 * 1000 // 2 days
    ),

  weeklyMetrics: () =>
    generateTaskFromTemplate(
      "operations-assistant",
      "metrics-report",
      { date: new Date().toISOString().split("T")[0] },
      "p1"
    ),

  // Sales Quick Spawns
  qualifyLeads: (campaign: string) =>
    generateTaskFromTemplate(
      "sales-executive",
      "lead-qualification",
      { campaign },
      "p1",
      Date.now() + 24 * 60 * 60 * 1000 // 1 day
    ),

  writeProposal: (opportunity: string) =>
    generateTaskFromTemplate(
      "sales-executive",
      "proposal-writing",
      { opportunity },
      "p1",
      Date.now() + 2 * 24 * 60 * 60 * 1000 // 2 days
    ),
};
