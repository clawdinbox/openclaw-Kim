#!/usr/bin/env tsx
/**
 * Seed script to populate Mission Control with sample data
 * Run: npx tsx scripts/seed.ts
 */

import { fetchMutation } from "convex/nextjs";
import { api } from "../convex/_generated/api";

const SAMPLE_ACTIVITIES = [
  {
    type: "tool_call" as const,
    action: "web_search",
    description: "Searched for 'luxury fashion market trends 2025'",
    metadata: { query: "luxury fashion market trends 2025", results: 10 },
    sessionId: "session-001",
    status: "success" as const,
  },
  {
    type: "file_operation" as const,
    action: "write",
    description: "Created newsletter draft for Market Pulse",
    metadata: { path: "documents/newsletter/2026-02-08-market-pulse.md", size: 2450 },
    sessionId: "session-001",
    status: "success" as const,
  },
  {
    type: "cron_run" as const,
    action: "cron.run",
    description: "Morning Brief executed successfully",
    metadata: { jobName: "Morning Brief", jobId: "d90b169b-87e0-4810-85a8-aee0ae26fe96", output: "Sent 6 sections via Telegram" },
    sessionId: "cron-session",
    status: "success" as const,
  },
  {
    type: "sub_agent" as const,
    action: "spawn",
    description: "Spawned coding sub-agent for dashboard build",
    metadata: { task: "Build Mission Control Dashboard", model: "moonshot/kimi-k2.5" },
    sessionId: "session-002",
    status: "pending" as const,
  },
  {
    type: "message" as const,
    action: "send",
    description: "Sent Telegram message to Marcel",
    metadata: { channel: "telegram", messageType: "brief" },
    sessionId: "session-001",
    status: "success" as const,
  },
  {
    type: "tool_call" as const,
    action: "web_fetch",
    description: "Fetched article from Business of Fashion",
    metadata: { url: "https://www.businessoffashion.com/articles/luxury", title: "Luxury Market Analysis" },
    sessionId: "session-003",
    status: "success" as const,
  },
  {
    type: "file_operation" as const,
    action: "read",
    description: "Read memory file for context",
    metadata: { path: "memory/2026-02-07.md", lines: 45 },
    sessionId: "session-004",
    status: "success" as const,
  },
  {
    type: "cron_run" as const,
    action: "cron.run",
    description: "Daily X Post - 09:00 slot",
    metadata: { jobName: "Daily X Post", platform: "x", content: "AI in retail thread" },
    sessionId: "cron-session",
    status: "success" as const,
  },
  {
    type: "session" as const,
    action: "start",
    description: "New session started for Marcel",
    metadata: { channel: "telegram", model: "moonshot/kimi-k2.5" },
    sessionId: "session-005",
    status: "success" as const,
  },
  {
    type: "tool_call" as const,
    action: "exec",
    description: "Executed git status check",
    metadata: { command: "git status", cwd: "/workspace", output: "clean" },
    sessionId: "session-005",
    status: "success" as const,
  },
];

const SAMPLE_SEARCH_INDEX = [
  {
    type: "memory" as const,
    title: "February 7, 2026 - Daily Notes",
    content: "Discussed Mission Control dashboard requirements with Marcel. Key features needed: Activity Feed, Calendar View, Global Search. Tech stack: Next.js 14 + Convex + Tailwind. Dark mode with cyan accents.",
    path: "memory/2026-02-07.md",
    date: Date.now() - 86400000,
    tags: ["planning", "dashboard", "requirements"],
  },
  {
    type: "document" as const,
    title: "Nike Resale Strategy Analysis",
    content: "Nike's DTC push was supposed to capture resale margin. Instead it trained customers to wait for discounts. SNKRS app fatigue is real. Exclusive access became expected, not earned. Scarcity requires restraint. Algorithms don't have restraint.",
    path: "documents/concepts/nike-resale-strategy.md",
    date: Date.now() - 172800000,
    tags: ["nike", "resale", "strategy", "analysis"],
  },
  {
    type: "document" as const,
    title: "AI in Fashion Retail",
    content: "Zara's parent company Inditex invested €1B+ in AI-driven logistics. Result: 2-week design-to-shelf cycles. Competitors: 6 months. This isn't about replacing designers. It's about removing friction between insight and action. Speed is the new moat.",
    path: "documents/concepts/ai-fashion-retail.md",
    date: Date.now() - 259200000,
    tags: ["ai", "zara", "retail", "logistics"],
  },
  {
    type: "memory" as const,
    title: "Weekly Strategy Notes",
    content: "Key insights from Week 5: Sportswear M&A heating up, AI implementation faster than expected in mid-market, China travel patterns shifting to Japan for luxury shopping. Brands need geographic flexibility.",
    path: "memory/2026-02-02.md",
    date: Date.now() - 518400000,
    tags: ["weekly", "strategy", "insights"],
  },
  {
    type: "file" as const,
    title: "Instagram Content Pipeline",
    content: "Daily Instagram posting schedule. 16:00 Berlin time. Visual-first content with tight captions. Real photos from Unsplash with minimal brand overlay. No text-on-gradient.",
    path: "workspace/schedule-instagram.sh",
    date: Date.now() - 604800000,
    tags: ["content", "instagram", "schedule"],
  },
];

async function seed() {
  console.log("🌱 Seeding Mission Control with sample data...\n");

  // Seed activities
  console.log("Adding sample activities...");
  for (const activity of SAMPLE_ACTIVITIES) {
    try {
      await fetchMutation(api.activities.logActivity, activity);
      process.stdout.write(".");
    } catch (error) {
      console.error("\nFailed to add activity:", error);
    }
  }
  console.log(` ✓ Added ${SAMPLE_ACTIVITIES.length} activities\n`);

  // Seed search index
  console.log("Adding sample search index items...");
  for (const item of SAMPLE_SEARCH_INDEX) {
    try {
      await fetchMutation(api.search.indexDocument, item);
      process.stdout.write(".");
    } catch (error) {
      console.error("\nFailed to index document:", error);
    }
  }
  console.log(` ✓ Added ${SAMPLE_SEARCH_INDEX.length} search index items\n`);

  console.log("✅ Seeding complete!");
  console.log("\nNext steps:");
  console.log("1. Run: curl http://localhost:3000/api/sync");
  console.log("2. Open http://localhost:3000");
}

seed().catch(console.error);
