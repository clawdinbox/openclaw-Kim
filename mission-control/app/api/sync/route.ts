import { NextRequest, NextResponse } from "next/server";
import { fetchMutation } from "convex/nextjs";
import { api } from "@/convex/_generated/api";

interface CronJob {
  id: string;
  name: string;
  schedule: { expr: string; tz: string };
  enabled: boolean;
  payload: {
    model: string;
    message: string;
  };
  state?: {
    nextRunAtMs?: number;
    lastRunAtMs?: number;
    lastStatus?: string;
  };
}

interface JobsFile {
  version: number;
  jobs: CronJob[];
}

// Parse cron expression to get next run time
function getNextRunTime(expr: string): number {
  const now = Date.now();
  // For demo purposes, spread tasks across the week
  // In production, use a proper cron parser like cron-parser
  const parts = expr.split(" ");
  if (parts.length >= 5) {
    const hour = parseInt(parts[2]) || 0;
    const minute = parseInt(parts[1]) || 0;
    const nextRun = new Date();
    nextRun.setHours(hour, minute, 0, 0);
    if (nextRun.getTime() < now) {
      nextRun.setDate(nextRun.getDate() + 1);
    }
    return nextRun.getTime();
  }
  return now + 24 * 60 * 60 * 1000;
}

// Extract description from job message
function getDescription(job: CronJob): string {
  const message = job.payload?.message || "";
  // Extract first paragraph or first 200 chars
  const firstParagraph = message.split("\n\n")[0] || message;
  return firstParagraph.slice(0, 200).trim();
}

export async function POST(request: NextRequest) {
  try {
    // Read the cron jobs file
    const fs = await import("fs/promises");
    const jobsFile = await fs.readFile(
      "/Users/clawdmm/.openclaw/cron/jobs.json",
      "utf-8"
    );
    const jobsData: JobsFile = JSON.parse(jobsFile);

    // Transform jobs for Convex
    const jobs = jobsData.jobs.map((job) => ({
      id: job.id,
      name: job.name,
      schedule: job.schedule.expr,
      enabled: job.enabled,
      model: job.payload?.model || "default",
      description: getDescription(job),
      nextRunAt: job.state?.nextRunAtMs || getNextRunTime(job.schedule.expr),
      lastRunAt: job.state?.lastRunAtMs,
      lastStatus: job.state?.lastStatus,
    }));

    // Call Convex mutation to sync jobs
    await fetchMutation(api.sync.syncJobs, { jobs });

    return NextResponse.json({ 
      success: true, 
      count: jobs.length,
      message: `Synced ${jobs.length} cron jobs` 
    });
  } catch (error) {
    console.error("Sync error:", error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : "Unknown error" 
      },
      { status: 500 }
    );
  }
}
