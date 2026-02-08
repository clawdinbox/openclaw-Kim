#!/usr/bin/env node
/**
 * Setup Script for AI Agent Company
 * 
 * Seeds the Convex database with initial agent records and sample tasks.
 * Idempotent - can be run multiple times safely.
 * 
 * Run with:
 *   npx tsx scripts/setup-agents.ts
 *   npx tsx scripts/setup-agents.ts --verbose
 *   npx tsx scripts/setup-agents.ts --skip-tasks
 */

import { ConvexClient } from "convex/browser";

// Parse arguments
const args = process.argv.slice(2);
const verbose = args.includes('--verbose') || args.includes('-v');
const skipTasks = args.includes('--skip-tasks');
const skipAgents = args.includes('--skip-agents');
const dryRun = args.includes('--dry-run');

// Configuration
const CONVEX_URL = process.env.NEXT_PUBLIC_CONVEX_URL || "http://127.0.0.1:3210";
const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 2000;

// Logger
const log = {
  info: (msg: string) => console.log(`ℹ️  ${msg}`),
  success: (msg: string) => console.log(`✅ ${msg}`),
  warning: (msg: string) => console.log(`⚠️  ${msg}`),
  error: (msg: string) => console.error(`❌ ${msg}`),
  verbose: (msg: string) => { if (verbose) console.log(`📝 ${msg}`); },
  step: (num: number, msg: string) => console.log(`\n🔷 Step ${num}: ${msg}`),
  divider: () => console.log("─".repeat(50)),
};

// Banner
function printBanner() {
  console.log("");
  console.log("╔════════════════════════════════════════════════════╗");
  console.log("║     🤖 MISSION CONTROL - DATABASE SETUP           ║");
  console.log("║     AI Agent Company Seeding Script               ║");
  console.log("╚════════════════════════════════════════════════════╝");
  console.log("");
  log.info(`Convex URL: ${CONVEX_URL}`);
  if (dryRun) log.warning("DRY RUN MODE - No changes will be made");
  console.log("");
}

// Check if Convex is reachable
async function checkConvexConnection(): Promise<boolean> {
  log.verbose("Checking Convex connection...");
  
  for (let i = 0; i < MAX_RETRIES; i++) {
    try {
      const response = await fetch(`${CONVEX_URL}/api/health`, { 
        method: 'GET',
        signal: AbortSignal.timeout(5000)
      });
      if (response.ok || response.status === 404) {
        log.verbose("Convex is reachable");
        return true;
      }
    } catch (e) {
      log.verbose(`Connection attempt ${i + 1} failed, retrying...`);
      if (i < MAX_RETRIES - 1) {
        await new Promise(r => setTimeout(r, RETRY_DELAY_MS));
      }
    }
  }
  
  return false;
}

// Agent definitions
const AGENTS = [
  {
    role: "ceo" as const,
    name: "Marcel",
    displayName: "Marcel (CEO)",
    department: "strategy" as const,
    description: "Strategic decision maker. Sets vision and priorities. Observer role - oversees operations.",
    capabilities: ["strategy", "vision", "decisions", "oversight"],
    avatar: "👔",
  },
  {
    role: "cso" as const,
    name: "Kim",
    displayName: "Kim 🦞 (CSO)",
    department: "strategy" as const,
    description: "Chief Strategy Officer. Coordinates agents, quality control, and task delegation.",
    capabilities: ["coordination", "quality-control", "delegation", "strategy"],
    avatar: "🦞",
  },
  {
    role: "senior-analyst" as const,
    name: "Senior Analyst",
    displayName: "Senior Research Analyst",
    department: "research" as const,
    description: "Deep analysis and research. McKinsey-grade deliverables and strategic frameworks.",
    capabilities: ["deep-research", "financial-modeling", "strategic-frameworks", "industry-analysis"],
    avatar: "📊",
  },
  {
    role: "research-associate" as const,
    name: "Research Associate",
    displayName: "Research Associate",
    department: "research" as const,
    description: "Daily intelligence and signal detection. Market monitoring and trend identification.",
    capabilities: ["intelligence", "data-collection", "trend-monitoring", "news-tracking"],
    avatar: "🔍",
  },
  {
    role: "cmo" as const,
    name: "CMO Social",
    displayName: "CMO Social",
    department: "marketing" as const,
    description: "Content strategy and social media campaigns. Audience growth and engagement.",
    capabilities: ["content-strategy", "campaigns", "audience-growth", "social-media"],
    avatar: "📢",
  },
  {
    role: "newsletter-editor" as const,
    name: "Newsletter Editor",
    displayName: "Newsletter Editor",
    department: "marketing" as const,
    description: "Produces Market Pulse biweekly newsletter. Writes Substack and LinkedIn versions from research intelligence.",
    capabilities: ["newsletter-writing", "content-curation", "audience-segmentation", "send-time-optimization", "performance-analysis"],
    avatar: "📨",
  },
  {
    role: "engineer" as const,
    name: "Lead Engineer",
    displayName: "Lead Software Engineer",
    department: "engineering" as const,
    description: "Tools, automation, and infrastructure. Building the technical foundation.",
    capabilities: ["tool-building", "integrations", "automation", "infrastructure"],
    avatar: "⚡",
  },
  // Operations Support (reports to CSO/COO)
  {
    role: "operations-assistant" as const,
    name: "Operations Assistant",
    displayName: "Operations Assistant",
    department: "strategy" as const,
    description: "Keeps operations running smoothly. Documents processes, tracks metrics, prepares reports, and ensures nothing falls through the cracks.",
    capabilities: ["process-optimization", "workflow-automation", "quality-control", "reporting", "meeting-notes"],
    avatar: "📋",
  },
  // Digital Products Team (reports to CMO)
  {
    role: "content-designer" as const,
    name: "Content Designer",
    displayName: "Content Designer",
    department: "marketing" as const,
    description: "Creates professional layouts for ebooks, guides, and digital products. Expert in typography, color systems, and brand-consistent design.",
    capabilities: ["ebook-layout", "pdf-design", "template-creation", "visual-branding"],
    avatar: "🎨",
  },
  {
    role: "copywriter" as const,
    name: "Copywriter",
    displayName: "Copywriter",
    department: "marketing" as const,
    description: "Writes persuasive copy that converts. Crafts product descriptions, sales pages, and launch email sequences.",
    capabilities: ["sales-copy", "product-descriptions", "email-sequences", "landing-pages"],
    avatar: "✍️",
  },
  {
    role: "pricing-analyst" as const,
    name: "Pricing Analyst",
    displayName: "Pricing Analyst",
    department: "marketing" as const,
    description: "Optimizes pricing strategies. Analyzes competitor pricing, designs product bundles, and recommends price points.",
    capabilities: ["price-strategy", "competitor-analysis", "bundle-design", "a-b-testing"],
    avatar: "💰",
  },
  {
    role: "launch-manager" as const,
    name: "Launch Manager",
    displayName: "Launch Manager",
    department: "marketing" as const,
    description: "Orchestrates product launches. Manages Gumroad setup, tracks analytics, and coordinates promotion timing.",
    capabilities: ["launch-planning", "gumroad-setup", "analytics", "promotion-strategy"],
    avatar: "🚀",
  },
  // Sales Support (reports to CCO)
  {
    role: "sales-executive" as const,
    name: "Sales Executive",
    displayName: "Sales Executive",
    department: "marketing" as const,
    description: "Drives revenue growth. Qualifies leads, manages outreach, writes proposals, and tracks deals from first contact to close.",
    capabilities: ["lead-qualification", "outreach", "proposal-writing", "crm-management", "deal-tracking", "follow-up-sequences"],
    avatar: "💼",
  },
];

// Sample tasks
const SAMPLE_TASKS = [
  {
    title: "📈 Analyze LVMH Q4 2025 Earnings",
    description:
      "Deep-dive analysis of LVMH's Q4 2025 earnings report.\n\n" +
      "Focus areas:\n" +
      "• Revenue breakdown by segment (Fashion & Leather Goods, Selective Retailing)\n" +
      "• Geographic performance (China, US, Europe, Japan)\n" +
      "• Margin trends and cost management\n" +
      "• Management guidance and strategic priorities\n" +
      "• Comparison with Hermès and Kering performance",
    assignedTo: "senior-analyst",
    priority: "p1" as const,
    category: "Analysis",
    dueInDays: 2,
  },
  {
    title: "📰 Daily Intelligence Brief - Feb 8, 2026",
    description:
      "Compile today's key signals from luxury industry sources:\n\n" +
      "Sources to monitor:\n" +
      "• Business of Fashion headlines\n" +
      "• WWD breaking news\n" +
      "• Vogue Business analysis\n" +
      "• Financial Times luxury coverage\n\n" +
      "Focus: M&A rumors, executive moves, earnings pre-announcements, emerging trends.",
    assignedTo: "research-associate",
    priority: "p0" as const,
    category: "Data Collection",
    dueInDays: 0.25,
  },
  {
    title: "📱 Content Strategy: Milan Fashion Week",
    description:
      "Plan content strategy for Milan Fashion Week (Feb 24 - Mar 2, 2026):\n\n" +
      "Deliverables:\n" +
      "• Daily post themes aligned with major shows\n" +
      "• Key designers/brands to watch (Prada, Gucci, Versace, etc.)\n" +
      "• Trend predictions and real-time commentary hooks\n" +
      "• LinkedIn post schedule with optimal timing\n" +
      "• Engagement tactics and hashtag strategy",
    assignedTo: "cmo",
    priority: "p1" as const,
    category: "Strategy",
    dueInDays: 7,
  },
  {
    title: "⚡ Build: Instagram Content Pipeline",
    description:
      "Develop an automated pipeline for Instagram content:\n\n" +
      "Features:\n" +
      "• Image sourcing from Unsplash/Pexels with keyword search\n" +
      "• Caption generation with brand voice\n" +
      "• Hashtag optimization\n" +
      "• Scheduling integration with Postiz API\n" +
      "• Performance tracking dashboard\n\n" +
      "Tech stack: TypeScript, Convex, Postiz API",
    assignedTo: "engineer",
    priority: "p2" as const,
    category: "Development",
    dueInDays: 14,
  },
  {
    title: "🔬 Research: Gen Z Luxury Consumption Patterns",
    description:
      "Research Gen Z (ages 18-27) luxury consumption patterns:\n\n" +
      "Research questions:\n" +
      "• Spending power and willingness to pay\n" +
      "• Preferred channels (online vs. retail)\n" +
      "• Brand preferences and entry-level luxury items\n" +
      "• Influence of social media and creators\n" +
      "• Secondhand and rental attitudes\n\n" +
      "Key data sources: Bain, McKinsey, BoF Insights",
    assignedTo: "senior-analyst",
    priority: "p1" as const,
    category: "Research",
    dueInDays: 5,
  },
  {
    title: "🎯 Swarm Coordination: Q1 Strategy Review",
    description:
      "Coordinate multi-agent review of Q1 2026 strategic initiatives:\n\n" +
      "Workflow:\n" +
      "1. Research Associate: Gather market intelligence\n" +
      "2. Senior Analyst: Analyze competitive landscape\n" +
      "3. CMO: Assess content performance\n" +
      "4. Engineer: Review automation progress\n" +
      "5. CSO: Synthesize findings and recommendations",
    assignedTo: "cso",
    priority: "p0" as const,
    category: "Coordination",
    dueInDays: 3,
  },
];

// Setup function
async function setup() {
  printBanner();
  
  // Step 1: Check connection
  log.step(1, "Checking Convex Connection");
  const connected = await checkConvexConnection();
  if (!connected) {
    log.error("Cannot connect to Convex. Is it running?");
    log.info("Try: npx convex dev");
    process.exit(1);
  }
  log.success("Connected to Convex");
  
  const client = new ConvexClient(CONVEX_URL);
  
  try {
    // Step 2: Clear existing data (optional cleanup)
    if (!dryRun) {
      log.step(2, "Cleaning Existing Data");
      try {
        await client.mutation("agents:deleteAll" as any, {});
        log.success("Cleared existing agents");
      } catch (e: any) {
        log.verbose(`Note: ${e.message}`);
        log.warning("Could not clear agents (may not exist yet)");
      }
      
      try {
        await client.mutation("tasks:deleteAll" as any, {});
        log.success("Cleared existing tasks");
      } catch (e: any) {
        log.verbose(`Note: ${e.message}`);
        log.warning("Could not clear tasks (may not exist yet)");
      }
    } else {
      log.step(2, "Skipping data cleanup (dry run)");
    }
    
    // Step 3: Seed agents
    if (!skipAgents) {
      log.step(3, "Creating Agent Records");
      log.info(`Creating ${AGENTS.length} agents...`);
      
      if (!dryRun) {
        try {
          // Use the seed mutation for batch creation
          const result = await client.mutation("agents:seed" as any, {});
          log.success(`Created ${(result as any[]).length} agents via seed mutation`);
        } catch (e: any) {
          log.verbose(`Seed mutation failed: ${e.message}`);
          log.warning("Agents may already exist or seed mutation not available");
        }
      } else {
        console.log("");
        console.log("Agents to create:");
        AGENTS.forEach((agent, i) => {
          console.log(`  ${i + 1}. ${agent.avatar} ${agent.displayName}`);
          console.log(`     Role: ${agent.role} | Dept: ${agent.department}`);
          console.log(`     Capabilities: ${agent.capabilities.join(", ")}`);
          console.log("");
        });
      }
    } else {
      log.step(3, "Skipping agent creation (--skip-agents)");
    }
    
    // Step 4: Create sample tasks
    if (!skipTasks && !dryRun) {
      log.step(4, "Creating Sample Tasks");
      log.info(`Creating ${SAMPLE_TASKS.length} sample tasks...`);
      
      for (const task of SAMPLE_TASKS) {
        log.verbose(`Creating: ${task.title}`);
        
        try {
          await client.mutation("tasks:create" as any, {
            title: task.title,
            description: task.description,
            assignedTo: task.assignedTo,
            delegatedBy: "cso",
            priority: task.priority,
            category: task.category,
            dueAt: Date.now() + task.dueInDays * 24 * 60 * 60 * 1000,
          });
          log.success(`Created: ${task.title.substring(0, 50)}... (${task.priority})`);
        } catch (e: any) {
          log.error(`Failed to create task "${task.title}": ${e.message}`);
        }
      }
    } else if (dryRun && !skipTasks) {
      log.step(4, "Sample Tasks (Dry Run)");
      console.log("");
      console.log("Tasks to create:");
      SAMPLE_TASKS.forEach((task, i) => {
        console.log(`  ${i + 1}. [${task.priority}] ${task.title}`);
        console.log(`     Assigned to: ${task.assignedTo} | Due: ${task.dueInDays} days`);
        console.log("");
      });
    } else {
      log.step(4, "Skipping task creation (--skip-tasks)");
    }
    
    // Step 5: Verify setup
    log.step(5, "Verifying Setup");
    
    if (!dryRun) {
      try {
        const agentStatus: any = await client.query("agents:getStatus" as any, {});
        log.divider();
        console.log("📊 AGENT STATUS:");
        console.log(`   Total: ${agentStatus.total}`);
        console.log(`   Available: ${agentStatus.idle}`);
        console.log(`   Working: ${agentStatus.working}`);
        console.log(`   Blocked: ${agentStatus.blocked}`);
        
        if (agentStatus.agents?.length > 0) {
          console.log("");
          console.log("   Agents:");
          agentStatus.agents.forEach((a: any) => {
            const status = a.status === 'idle' ? '✅' : a.status === 'working' ? '🔥' : '⏸️';
            console.log(`     ${status} ${a.name} (${a.role})`);
          });
        }
      } catch (e: any) {
        log.warning(`Could not fetch agent status: ${e.message}`);
      }
      
      try {
        const taskDashboard: any = await client.query("tasks:getDashboard" as any, {});
        log.divider();
        console.log("📋 TASK STATUS:");
        console.log(`   Pending: ${taskDashboard.counts.pending}`);
        console.log(`   In Progress: ${taskDashboard.counts.inProgress}`);
        console.log(`   In Review: ${taskDashboard.counts.review}`);
        console.log(`   Complete: ${taskDashboard.counts.complete}`);
      } catch (e: any) {
        log.warning(`Could not fetch task status: ${e.message}`);
      }
    }
    
    // Final summary
    log.divider();
    console.log("");
    console.log("╔════════════════════════════════════════════════════╗");
    if (dryRun) {
      console.log("║     ✅ DRY RUN COMPLETE - No changes made          ║");
    } else {
      console.log("║     ✅ SETUP COMPLETE!                             ║");
    }
    console.log("╚════════════════════════════════════════════════════╝");
    console.log("");
    
    if (!dryRun) {
      console.log("🚀 Next steps:");
      console.log("   1. Start the dev server: npm run dev");
      console.log("   2. Open Mission Control: http://localhost:3000");
      console.log("   3. Navigate to Organization tab to see agents");
      console.log("   4. Navigate to Task Management to delegate");
      console.log("");
      console.log("📚 Need help? See README-QUICKSTART.md");
    }
    
    log.success("All done! 🎉");
    
  } catch (error: any) {
    log.error(`Setup failed: ${error.message}`);
    if (verbose && error.stack) {
      console.error(error.stack);
    }
    process.exit(1);
  } finally {
    client.close();
  }
}

// Run setup
setup();
