import { v } from "convex/values";
import {
  query,
  mutation,
  internalQuery,
  internalMutation,
} from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

// ==================== QUERIES ====================

export const list = query({
  args: {},
  handler: async (ctx) => {
    const agents = await ctx.db
      .query("agents")
      .withIndex("by_role")
      .collect();
    // Optimized sort order for 14-agent structure
    const order = [
      "ceo",
      "cso", 
      "product-manager",
      "senior-analyst",
      "research-associate",
      "cmo",
      "newsletter-editor",
      "content-designer",
      "copywriter",
      "sales-executive",
      "pricing-analyst",
      "launch-manager",
      "engineer",
      "automation-engineer",
      "operations-assistant",
      "data-analyst"
    ];
    return agents.sort((a, b) => {
      return order.indexOf(a.role) - order.indexOf(b.role);
    });
  },
});

export const getByRole = query({
  args: { role: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("agents")
      .withIndex("by_role", (q) => q.eq("role", args.role))
      .first();
  },
});

export const getById = query({
  args: { id: v.id("agents") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

export const getByPod = query({
  args: { pod: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("agents")
      .withIndex("by_pod", (q) => q.eq("pod", args.pod))
      .collect();
  },
});

export const getStatus = query({
  args: {},
  handler: async (ctx) => {
    const agents = await ctx.db.query("agents").collect();
    return {
      total: agents.length,
      idle: agents.filter((a) => a.status === "idle").length,
      working: agents.filter((a) => a.status === "working").length,
      blocked: agents.filter((a) => a.status === "blocked").length,
      byPod: {
        strategy: agents.filter((a) => a.pod === "strategy-pod"),
        research: agents.filter((a) => a.pod === "research-pod"),
        content: agents.filter((a) => a.pod === "content-pod"),
        revenue: agents.filter((a) => a.pod === "revenue-pod"),
        engineering: agents.filter((a) => a.pod === "engineering-pod"),
        operations: agents.filter((a) => a.pod === "operations-pod"),
      },
      agents: agents.map((a) => ({
        id: a._id,
        role: a.role,
        name: a.displayName,
        status: a.status,
        workload: a.workload || 0,
        maxWorkload: a.maxWorkload || 2,
        currentTask: a.currentTask,
        lastActive: a.performance.lastActive,
      })),
    };
  },
});

export const getAvailableAgents = query({
  args: { taskType: v.optional(v.string()) },
  handler: async (ctx, args) => {
    const agents = await ctx.db.query("agents").collect();
    
    // Filter by capacity rules based on task type
    return agents.filter((a) => {
      const workload = a.workload || 0;
      const maxWorkload = a.maxWorkload || 2;
      
      // Kim only does review/approval
      if (a.role === "cso" && args.taskType !== "review" && args.taskType !== "approval") {
        return false;
      }
      
      return a.status !== "offline" && workload < maxWorkload;
    }).map((a) => ({
      id: a._id,
      role: a.role,
      name: a.displayName,
      avatar: a.avatar,
      pod: a.pod,
      availableCapacity: (a.maxWorkload || 2) - (a.workload || 0),
    }));
  },
});

// ==================== MUTATIONS ====================

export const create = mutation({
  args: {
    role: v.union(
      v.literal("ceo"),
      v.literal("cso"),
      v.literal("product-manager"),
      v.literal("senior-analyst"),
      v.literal("research-associate"),
      v.literal("cmo"),
      v.literal("newsletter-editor"),
      v.literal("engineer"),
      v.literal("automation-engineer"),
      v.literal("content-designer"),
      v.literal("copywriter"),
      v.literal("pricing-analyst"),
      v.literal("launch-manager"),
      v.literal("operations-assistant"),
      v.literal("sales-executive"),
      v.literal("data-analyst")
    ),
    name: v.string(),
    displayName: v.string(),
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
    description: v.string(),
    capabilities: v.array(v.string()),
    avatar: v.optional(v.string()),
    reportsTo: v.optional(v.union(
      v.literal("ceo"),
      v.literal("cso"),
      v.literal("cmo"),
      v.literal("engineer")
    )),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    return await ctx.db.insert("agents", {
      ...args,
      status: "idle",
      workload: 0,
      maxWorkload: 2,
      performance: {
        tasksCompleted: 0,
        avgQuality: 0,
        lastActive: now,
      },
      createdAt: now,
    });
  },
});

export const updateStatus = mutation({
  args: {
    id: v.id("agents"),
    status: v.union(
      v.literal("idle"),
      v.literal("working"),
      v.literal("blocked"),
      v.literal("offline")
    ),
    currentTask: v.optional(v.string()),
    currentTaskId: v.optional(v.id("tasks")),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;
    await ctx.db.patch(id, {
      ...updates,
      "performance.lastActive": Date.now(),
    });
    return true;
  },
});

export const updateWorkload = mutation({
  args: {
    id: v.id("agents"),
    workload: v.number(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, {
      workload: Math.max(0, Math.min(args.workload, 2)), // Clamp 0-2
      "performance.lastActive": Date.now(),
    });
    return true;
  },
});

export const updateOutput = mutation({
  args: {
    id: v.id("agents"),
    output: v.string(),
    outputPath: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { id, output, outputPath } = args;
    await ctx.db.patch(id, {
      lastOutput: output,
      lastOutputPath: outputPath,
      "performance.lastActive": Date.now(),
    });
    return true;
  },
});

export const completeTask = mutation({
  args: {
    id: v.id("agents"),
    quality: v.optional(v.number()),
    cost: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const agent = await ctx.db.get(args.id);
    if (!agent) return false;

    const completed = agent.performance.tasksCompleted + 1;
    const currentAvg = agent.performance.avgQuality;
    const newQuality = args.quality || 4;
    const newAvg = (currentAvg * (completed - 1) + newQuality) / completed;

    await ctx.db.patch(args.id, {
      status: "idle",
      workload: Math.max(0, (agent.workload || 0) - 1),
      currentTask: undefined,
      currentTaskId: undefined,
      "performance.tasksCompleted": completed,
      "performance.avgQuality": newAvg,
      "performance.lastActive": Date.now(),
    });
    return true;
  },
});

export const deleteAll = mutation({
  args: {},
  handler: async (ctx) => {
    const agents = await ctx.db.query("agents").collect();
    for (const agent of agents) {
      await ctx.db.delete(agent._id);
    }
    return agents.length;
  },
});

// ==================== SEED DATA - 14 AGENT OPTIMIZED TEAM ====================

export const seed = mutation({
  args: {},
  handler: async (ctx) => {
    const now = Date.now();
    
    const agents = [
      // ========== EXECUTIVE ==========
      {
        role: "ceo" as const,
        name: "Marcel",
        displayName: "Marcel (CEO)",
        department: "strategy" as const,
        pod: undefined,
        description: "Strategic decision maker. Sets vision and priorities. Final approval on all major initiatives.",
        capabilities: ["strategy", "vision", "decisions", "final-approval"],
        avatar: "👔",
        reportsTo: undefined,
        maxWorkload: 1,
      },
      
      // ========== STRATEGY POD ==========
      {
        role: "cso" as const,
        name: "Kim",
        displayName: "Kim 🦞 (CSO/COO/CFO/CCO)",
        department: "strategy" as const,
        pod: "strategy-pod" as const,
        description: "Chief Strategy Officer + COO + CFO + CCO. Coordinates agents, quality control, cost optimization, and final review before CEO.",
        capabilities: ["coordination", "quality-control", "delegation", "cost-optimization", "review", "approval"],
        avatar: "🦞",
        reportsTo: "ceo" as const,
        maxWorkload: 3,
      },
      {
        role: "product-manager" as const,
        name: "Product Manager",
        displayName: "Product Manager",
        department: "strategy" as const,
        pod: "strategy-pod" as const,
        description: "Bridges research and engineering. Defines roadmaps, prioritizes features, validates MVPs, translates market intelligence into product opportunities.",
        capabilities: ["roadmap-planning", "feature-prioritization", "user-research", "mvp-definition", "product-strategy"],
        avatar: "📱",
        reportsTo: "cso" as const,
        maxWorkload: 2,
      },
      
      // ========== RESEARCH POD ==========
      {
        role: "senior-analyst" as const,
        name: "Senior Analyst",
        displayName: "Senior Research Analyst",
        department: "research" as const,
        pod: "research-pod" as const,
        description: "Deep analysis and research. McKinsey-grade deliverables. Strategic frameworks and competitive intelligence.",
        capabilities: ["deep-research", "financial-modeling", "strategic-frameworks", "competitive-analysis"],
        avatar: "📊",
        reportsTo: "cso" as const,
        maxWorkload: 2,
      },
      {
        role: "research-associate" as const,
        name: "Research Associate",
        displayName: "Research Associate",
        department: "research" as const,
        pod: "research-pod" as const,
        description: "Daily intelligence and signal detection. 80% reactive (news monitoring), 20% proactive (deep dive triggers). Early warning system.",
        capabilities: ["intelligence", "data-collection", "trend-monitoring", "news-tracking"],
        avatar: "🔍",
        reportsTo: "senior-analyst" as const,
        maxWorkload: 2,
      },
      
      // ========== CONTENT POD (Creative) ==========
      {
        role: "cmo" as const,
        name: "CMO Social",
        displayName: "CMO Social (CCO)",
        department: "marketing" as const,
        pod: "content-pod" as const,
        description: "Chief Marketing Officer + Chief Content Officer. Content strategy, brand oversight, campaign planning, and approval authority for creative work.",
        capabilities: ["content-strategy", "campaigns", "audience-growth", "brand-oversight", "approval"],
        avatar: "📢",
        reportsTo: "cso" as const,
        maxWorkload: 2,
      },
      {
        role: "newsletter-editor" as const,
        name: "Newsletter Editor",
        displayName: "Newsletter Editor",
        department: "marketing" as const,
        pod: "content-pod" as const,
        description: "Produces Market Pulse biweekly newsletter. Writes Substack (long-form) and LinkedIn (condensed) versions. Transforms research into compelling, data-driven content.",
        capabilities: ["newsletter-writing", "content-curation", "audience-segmentation", "send-time-optimization", "performance-analysis"],
        avatar: "📨",
        reportsTo: "cmo" as const,
        maxWorkload: 2,
      },
      {
        role: "content-designer" as const,
        name: "Content Designer",
        displayName: "Content Designer",
        department: "marketing" as const,
        pod: "content-pod" as const,
        description: "Creates professional layouts for ebooks, guides, and digital products. Expert in typography, color systems, and brand-consistent visual design.",
        capabilities: ["ebook-layout", "pdf-design", "template-creation", "visual-branding", "asset-creation"],
        avatar: "🎨",
        reportsTo: "cmo" as const,
        maxWorkload: 2,
      },
      {
        role: "copywriter" as const,
        name: "Copywriter",
        displayName: "Copywriter",
        department: "marketing" as const,
        pod: "content-pod" as const,
        description: "Writes persuasive copy that converts. Crafts product descriptions, sales pages, launch email sequences, and social content.",
        capabilities: ["sales-copy", "product-descriptions", "email-sequences", "landing-pages", "social-content"],
        avatar: "✍️",
        reportsTo: "cmo" as const,
        maxWorkload: 2,
      },
      
      // ========== REVENUE POD (Commercial) ==========
      {
        role: "sales-executive" as const,
        name: "Sales Executive",
        displayName: "Sales Executive",
        department: "marketing" as const,
        pod: "revenue-pod" as const,
        description: "Drives revenue growth. Always reactive (leads come in). Qualifies leads, manages outreach, writes proposals, tracks deals from first contact to close.",
        capabilities: ["lead-qualification", "outreach", "proposal-writing", "crm-management", "deal-tracking"],
        avatar: "💼",
        reportsTo: "cmo" as const,
        maxWorkload: 2,
      },
      {
        role: "pricing-analyst" as const,
        name: "Pricing Analyst",
        displayName: "Pricing Analyst",
        department: "marketing" as const,
        pod: "revenue-pod" as const,
        description: "Optimizes pricing strategies. Analyzes competitor pricing, designs product bundles, recommends price points, plans A/B tests.",
        capabilities: ["price-strategy", "competitor-analysis", "bundle-design", "a-b-testing", "revenue-optimization"],
        avatar: "💰",
        reportsTo: "cmo" as const,
        maxWorkload: 2,
      },
      {
        role: "launch-manager" as const,
        name: "Launch Manager",
        displayName: "Launch Manager",
        department: "marketing" as const,
        pod: "revenue-pod" as const,
        description: "Orchestrates product launches. Manages Gumroad setup, tracks analytics, coordinates promotion timing, executes go-live.",
        capabilities: ["launch-planning", "gumroad-setup", "analytics", "promotion-strategy", "platform-management"],
        avatar: "🚀",
        reportsTo: "cmo" as const,
        maxWorkload: 2,
      },
      
      // ========== ENGINEERING POD ==========
      {
        role: "engineer" as const,
        name: "Lead Engineer",
        displayName: "Lead Software Engineer",
        department: "engineering" as const,
        pod: "engineering-pod" as const,
        description: "Tools, automation, and infrastructure. Technical architecture, integrations, and complex development work.",
        capabilities: ["tool-building", "integrations", "automation", "architecture", "code-review"],
        avatar: "⚡",
        reportsTo: "cso" as const,
        maxWorkload: 2,
      },
      {
        role: "automation-engineer" as const,
        name: "Automation Engineer",
        displayName: "Automation Engineer",
        department: "engineering" as const,
        pod: "engineering-pod" as const,
        description: "Builds scripts and automation workflows. Focuses on efficiency, pipeline automation, and repetitive task elimination.",
        capabilities: ["scripting", "workflow-automation", "pipeline-building", "efficiency-optimization"],
        avatar: "🤖",
        reportsTo: "engineer" as const,
        maxWorkload: 2,
      },
      
      // ========== OPERATIONS POD ==========
      {
        role: "operations-assistant" as const,
        name: "Operations Assistant",
        displayName: "Operations Assistant",
        department: "operations" as const,
        pod: "operations-pod" as const,
        description: "Keeps operations running smoothly. Documents processes, tracks metrics, prepares reports, ensures nothing falls through the cracks.",
        capabilities: ["process-optimization", "workflow-automation", "quality-control", "reporting", "meeting-notes"],
        avatar: "📋",
        reportsTo: "cso" as const,
        maxWorkload: 2,
      },
      {
        role: "data-analyst" as const,
        name: "Data Analyst",
        displayName: "Data Analyst",
        department: "operations" as const,
        pod: "operations-pod" as const,
        description: "Tracks all KPIs and optimizes based on data. Metrics tracking, performance analysis, reporting, and insights extraction. CFO function support.",
        capabilities: ["metrics-tracking", "performance-analysis", "reporting", "insights-extraction", "kpi-dashboards"],
        avatar: "📈",
        reportsTo: "cso" as const,
        maxWorkload: 2,
      },
    ];

    const ids = [];
    for (const agent of agents) {
      const id = await ctx.db.insert("agents", {
        ...agent,
        status: "idle",
        workload: 0,
        performance: {
          tasksCompleted: 0,
          avgQuality: 0,
          lastActive: now,
        },
        createdAt: now,
      });
      ids.push({ role: agent.role, id });
    }

    return ids;
  },
});
