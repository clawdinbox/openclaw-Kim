import { v } from "convex/values";
import { mutation } from "./_generated/server";

// ==================== PROJECT TEMPLATES ====================

export const initializeTemplates = mutation({
  args: {},
  handler: async (ctx) => {
    // Check if templates already exist
    const existing = await ctx.db.query("projectTemplates").collect();
    if (existing.length > 0) {
      return { message: "Templates already initialized", count: existing.length };
    }

    const templates = [
      // Content Campaign Template
      {
        name: "Content Campaign",
        description: "Template for content marketing campaigns",
        folder: "Content",
        defaultTasks: [
          {
            title: "Research & Strategy",
            description: "Research topic, audience, and competitive landscape",
            priority: "p1" as const,
            estimatedHours: 4,
            assigneeRole: "senior-analyst",
          },
          {
            title: "Draft Content",
            description: "Create initial draft based on research",
            priority: "p1" as const,
            estimatedHours: 6,
            assigneeRole: "content-designer",
          },
          {
            title: "Design Assets",
            description: "Create visual assets, graphics, and layouts",
            priority: "p1" as const,
            estimatedHours: 4,
            assigneeRole: "content-designer",
          },
          {
            title: "Review & Edit",
            description: "Review content for quality and brand alignment",
            priority: "p0" as const,
            estimatedHours: 2,
            assigneeRole: "cmo",
          },
          {
            title: "Publish & Distribute",
            description: "Publish content and execute distribution plan",
            priority: "p1" as const,
            estimatedHours: 2,
            assigneeRole: "cmo",
          },
        ],
        isEnabled: true,
      },

      // Product Launch Template
      {
        name: "Product Launch",
        description: "Template for launching new products or features",
        folder: "Product",
        defaultTasks: [
          {
            title: "Market Validation",
            description: "Validate product-market fit and pricing assumptions",
            priority: "p0" as const,
            estimatedHours: 8,
            assigneeRole: "senior-analyst",
          },
          {
            title: "Product Design",
            description: "Finalize product design and user experience",
            priority: "p0" as const,
            estimatedHours: 12,
            assigneeRole: "content-designer",
          },
          {
            title: "Copy & Messaging",
            description: "Create product copy, sales pages, and messaging",
            priority: "p1" as const,
            estimatedHours: 6,
            assigneeRole: "copywriter",
          },
          {
            title: "Pricing Strategy",
            description: "Finalize pricing tiers and promotional offers",
            priority: "p0" as const,
            estimatedHours: 4,
            assigneeRole: "pricing-analyst",
          },
          {
            title: "Launch Execution",
            description: "Execute launch plan and monitor metrics",
            priority: "p0" as const,
            estimatedHours: 8,
            assigneeRole: "launch-manager",
          },
          {
            title: "Sales Enablement",
            description: "Prepare sales team with materials and training",
            priority: "p1" as const,
            estimatedHours: 4,
            assigneeRole: "sales-executive",
          },
        ],
        isEnabled: true,
      },

      // Research Report Template
      {
        name: "Research Report",
        description: "Template for in-depth research reports",
        folder: "Research",
        defaultTasks: [
          {
            title: "Data Collection",
            description: "Gather data from primary and secondary sources",
            priority: "p1" as const,
            estimatedHours: 12,
            assigneeRole: "research-associate",
          },
          {
            title: "Data Analysis",
            description: "Analyze data and identify key insights",
            priority: "p0" as const,
            estimatedHours: 10,
            assigneeRole: "senior-analyst",
          },
          {
            title: "Report Writing",
            description: "Write comprehensive report with findings",
            priority: "p0" as const,
            estimatedHours: 12,
            assigneeRole: "senior-analyst",
          },
          {
            title: "Review & QA",
            description: "Review for accuracy, clarity, and completeness",
            priority: "p1" as const,
            estimatedHours: 4,
            assigneeRole: "cso",
          },
          {
            title: "Delivery & Presentation",
            description: "Deliver final report and present findings",
            priority: "p1" as const,
            estimatedHours: 3,
            assigneeRole: "senior-analyst",
          },
        ],
        isEnabled: true,
      },

      // Tool Build Template
      {
        name: "Tool Build",
        description: "Template for building internal tools and automation",
        folder: "Product",
        defaultTasks: [
          {
            title: "Technical Specification",
            description: "Define technical requirements and architecture",
            priority: "p0" as const,
            estimatedHours: 6,
            assigneeRole: "engineer",
          },
          {
            title: "Development",
            description: "Build the tool according to specifications",
            priority: "p0" as const,
            estimatedHours: 20,
            assigneeRole: "engineer",
          },
          {
            title: "Testing & QA",
            description: "Test functionality and fix bugs",
            priority: "p0" as const,
            estimatedHours: 8,
            assigneeRole: "engineer",
          },
          {
            title: "Deployment",
            description: "Deploy to production environment",
            priority: "p1" as const,
            estimatedHours: 4,
            assigneeRole: "engineer",
          },
          {
            title: "Monitoring Setup",
            description: "Set up monitoring, alerts, and documentation",
            priority: "p1" as const,
            estimatedHours: 4,
            assigneeRole: "engineer",
          },
        ],
        isEnabled: true,
      },

      // Operations Template
      {
        name: "Operations Initiative",
        description: "Template for operational improvements",
        folder: "Operations",
        defaultTasks: [
          {
            title: "Process Analysis",
            description: "Analyze current process and identify bottlenecks",
            priority: "p1" as const,
            estimatedHours: 4,
            assigneeRole: "operations-assistant",
          },
          {
            title: "Solution Design",
            description: "Design improved process or automation",
            priority: "p1" as const,
            estimatedHours: 6,
            assigneeRole: "operations-assistant",
          },
          {
            title: "Implementation",
            description: "Execute the solution",
            priority: "p1" as const,
            estimatedHours: 8,
            assigneeRole: "operations-assistant",
          },
          {
            title: "Validation",
            description: "Validate improvements and measure impact",
            priority: "p2" as const,
            estimatedHours: 3,
            assigneeRole: "cso",
          },
        ],
        isEnabled: true,
      },

      // Revenue Initiative Template
      {
        name: "Revenue Initiative",
        description: "Template for revenue-generating projects",
        folder: "Revenue",
        defaultTasks: [
          {
            title: "Opportunity Analysis",
            description: "Analyze revenue opportunity and market size",
            priority: "p0" as const,
            estimatedHours: 6,
            assigneeRole: "pricing-analyst",
          },
          {
            title: "Strategy Development",
            description: "Develop revenue strategy and action plan",
            priority: "p0" as const,
            estimatedHours: 8,
            assigneeRole: "cso",
          },
          {
            title: "Execution",
            description: "Execute revenue initiatives",
            priority: "p0" as const,
            estimatedHours: 15,
            assigneeRole: "sales-executive",
          },
          {
            title: "Performance Tracking",
            description: "Track metrics and optimize performance",
            priority: "p1" as const,
            estimatedHours: 4,
            assigneeRole: "pricing-analyst",
          },
        ],
        isEnabled: true,
      },
    ];

    const inserted = [];
    for (const template of templates) {
      const id = await ctx.db.insert("projectTemplates", template);
      inserted.push(id);
    }

    return { message: "Templates initialized", count: inserted.length, ids: inserted };
  },
});

export const list = mutation({
  args: {},
  handler: async (ctx) => {
    const templates = await ctx.db
      .query("projectTemplates")
      .filter((q) => q.eq(q.field("isEnabled"), true))
      .collect();
    return templates;
  },
});
