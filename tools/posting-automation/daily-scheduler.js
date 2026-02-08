#!/usr/bin/env node
/**
 * Daily Post Scheduler — Smart wrapper for automated posting
 * 
 * This script generates content and uses smart-poster.js to post,
 * checking Postiz first to avoid duplicates.
 * 
 * Schedule (Berlin timezone):
 *   Threads: 08:30, 12:30, 18:30
 *   X: 09:00, 13:00, 19:00
 * 
 * Usage:
 *   node daily-scheduler.js --platform x --slot morning
 *   node daily-scheduler.js --platform threads --slot afternoon
 * 
 * Cron setup:
 *   30 8 * * * cd /Users/clawdmm/.openclaw/workspace && node tools/posting-automation/daily-scheduler.js --platform threads --slot morning >> logs/threads-morning.log 2>&1
 *   0 9 * * * cd /Users/clawdmm/.openclaw/workspace && node tools/posting-automation/daily-scheduler.js --platform x --slot morning >> logs/x-morning.log 2>&1
 *   30 12 * * * cd /Users/clawdmm/.openclaw/workspace && node tools/posting-automation/daily-scheduler.js --platform threads --slot afternoon >> logs/threads-afternoon.log 2>&1
 *   0 13 * * * cd /Users/clawdmm/.openclaw/workspace && node tools/posting-automation/daily-scheduler.js --platform x --slot afternoon >> logs/x-afternoon.log 2>&1
 *   30 18 * * * cd /Users/clawdmm/.openclaw/workspace && node tools/posting-automation/daily-scheduler.js --platform threads --slot evening >> logs/threads-evening.log 2>&1
 *   0 19 * * * cd /Users/clawdmm/.openclaw/workspace && node tools/posting-automation/daily-scheduler.js --platform x --slot evening >> logs/x-evening.log 2>&1
 */

const { execSync } = require('child_process');
const path = require('path');

// Configuration
const SLOTS = {
  morning: { threads: '08:30', x: '09:00' },
  afternoon: { threads: '12:30', x: '13:00' },
  evening: { threads: '18:30', x: '19:00' }
};

const CONTENT_GENERATORS = {
  x: generateXContent,
  threads: generateThreadsContent
};

/**
 * Parse command line arguments
 */
function parseArgs() {
  const args = process.argv.slice(2);
  const result = {};
  
  for (let i = 0; i < args.length; i++) {
    switch (args[i]) {
      case '--platform':
        result.platform = args[++i];
        break;
      case '--slot':
        result.slot = args[++i];
        break;
      case '--content':
        result.content = args[++i];
        break;
      case '--date':
        result.date = args[++i];
        break;
      case '--dry-run':
        result.dryRun = true;
        break;
      case '--help':
      case '-h':
        showHelp();
        process.exit(0);
        break;
    }
  }
  
  return result;
}

function showHelp() {
  console.log(`
Daily Post Scheduler — Automated content posting with duplicate checking

Usage:
  node daily-scheduler.js --platform <x|threads> --slot <morning|afternoon|evening> [options]

Required:
  --platform    Platform to post to (x, threads)
  --slot        Time slot (morning, afternoon, evening)

Options:
  --content     Override generated content with custom text
  --date        Target date (YYYY-MM-DD, default: today)
  --dry-run     Check only, don't actually post
  --help, -h    Show this help

Time Slots:
  morning:    Threads 08:30, X 09:00
  afternoon:  Threads 12:30, X 13:00
  evening:    Threads 18:30, X 19:00

Examples:
  node daily-scheduler.js --platform x --slot morning
  node daily-scheduler.js --platform threads --slot evening --content "Custom post text"
  node daily-scheduler.js --platform x --slot afternoon --dry-run
`);
}

/**
 * Validate arguments
 */
function validateArgs(args) {
  const errors = [];
  
  if (!args.platform) {
    errors.push('--platform is required (x or threads)');
  } else if (!['x', 'threads'].includes(args.platform)) {
    errors.push(`Invalid platform: ${args.platform}`);
  }
  
  if (!args.slot) {
    errors.push('--slot is required (morning, afternoon, or evening)');
  } else if (!['morning', 'afternoon', 'evening'].includes(args.slot)) {
    errors.push(`Invalid slot: ${args.slot}`);
  }
  
  if (errors.length > 0) {
    console.error('❌ Validation errors:');
    errors.forEach(e => console.error(`   - ${e}`));
    process.exit(1);
  }
}

/**
 * Generate content for X posts
 * In production, this would call an AI service or content database
 */
async function generateXContent(slot, date) {
  // This is a placeholder - in production, integrate with your content generation
  const topics = [
    "Market insights on sportswear trends",
    "AI in retail operations",
    "Luxury fashion consolidation",
    "Sneaker resale market dynamics",
    "Chinese luxury consumption patterns"
  ];
  
  const dayOfWeek = new Date(date).getDay();
  const topicIndex = (dayOfWeek + ['morning', 'afternoon', 'evening'].indexOf(slot)) % topics.length;
  
  return `[AUTO] ${topics[topicIndex]} — Insights for ${slot} ${date}`;
}

/**
 * Generate content for Threads posts
 */
async function generateThreadsContent(slot, date) {
  // Threads content tends to be more conversational
  const themes = [
    "Behind the scenes at Kimi K2.5",
    "Building in public updates",
    "Fashion tech observations",
    "Industry trends worth watching",
    "Daily insights from the data"
  ];
  
  const dayOfWeek = new Date(date).getDay();
  const themeIndex = (dayOfWeek + ['morning', 'afternoon', 'evening'].indexOf(slot)) % themes.length;
  
  return `[AUTO] ${themes[themeIndex]} — ${slot} thoughts for ${date}`;
}

/**
 * Get today's date in YYYY-MM-DD format
 */
function getTodayDate() {
  return new Date().toISOString().split('T')[0];
}

/**
 * Execute smart-poster.js with the given parameters
 */
function executeSmartPoster(platform, time, content, date, dryRun = false) {
  const scriptPath = path.join(__dirname, 'smart-poster.js');
  const escapedContent = content.replace(/"/g, '\\"');
  
  let cmd = `node "${scriptPath}" --platform ${platform} --time ${time} --content "${escapedContent}"`;
  
  if (date) {
    cmd += ` --date ${date}`;
  }
  
  if (dryRun) {
    cmd += ' --dry-run';
  }
  
  console.log(`Executing: ${cmd.replace(escapedContent, '[content]')}`);
  
  try {
    const output = execSync(cmd, { 
      encoding: 'utf-8',
      stdio: ['pipe', 'pipe', 'pipe']
    });
    console.log(output);
    return { success: true, output };
  } catch (error) {
    console.error(error.stdout || error.message);
    return { success: false, error: error.message, output: error.stdout };
  }
}

/**
 * Main execution
 */
async function main() {
  const args = parseArgs();
  validateArgs(args);
  
  const platform = args.platform;
  const slot = args.slot;
  const targetDate = args.date || getTodayDate();
  const targetTime = SLOTS[slot][platform];
  
  console.log(`📅 ${platform.toUpperCase()} ${slot} slot (${targetTime}) for ${targetDate}`);
  console.log('=' .repeat(50));
  
  // Generate or use provided content
  let content;
  if (args.content) {
    content = args.content;
    console.log('Using provided content');
  } else {
    console.log('Generating content...');
    const generator = CONTENT_GENERATORS[platform];
    content = await generator(slot, targetDate);
  }
  
  console.log(`Content preview: ${content.substring(0, 80)}...`);
  console.log('');
  
  // Execute smart poster
  const result = executeSmartPoster(platform, targetTime, content, targetDate, args.dryRun);
  
  if (!result.success) {
    process.exit(1);
  }
}

main().catch(error => {
  console.error(`❌ Unexpected error: ${error.message}`);
  process.exit(1);
});
