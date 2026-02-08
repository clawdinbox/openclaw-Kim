#!/usr/bin/env node

// cli/schedule.js

// Ensure default_api and require are available in this execution context
// This script is designed to be run by the agent's environment, which provides default_api.
// Node.js's require is assumed to work for local modules.

const postizClient = require('./src/postiz-client');
const queueManager = require('./src/queue');

// Helper to parse arguments
function parseArgs() {
  const args = process.argv.slice(2);
  const argMap = {};
  let i = 0;
  while (i < args.length) {
    if (args[i].startsWith('--')) {
      const key = args[i].substring(2).replace(/-/g, '_'); // Normalize dashes to underscores
      if (i + 1 < args.length && !args[i + 1].startsWith('--')) {
        argMap[key] = args[i + 1];
        i += 2;
      } else {
        argMap[key] = true; // Flag argument
        i += 1;
      }
    } else {
      i += 1;
    }
  }
  return argMap;
}

// Main execution function
async function main() {
  const args = parseArgs();

  const platform = args.platform;
  const filePath = args.file;
  const scheduleTime = args.time;

  if (!platform || !filePath || !scheduleTime) {
    console.error('Usage: npm run queue-post --platform=<x|linkedin> --file=<path/to/your/draft.txt> --time=<YYYY-MM-DDTHH:MM:SSZ>');
    process.exit(1);
  }

  try {
    // 1. Read content from the file
    // Use the tool's read function, assuming it's available as default_api.read
    const fileContent = await default_api.read({ path: filePath });
    if (!fileContent) {
      throw new Error(`File not found or empty: ${filePath}`);
    }

    // 2. Add post to the queue
    const queuedPost = await queueManager.addPostToQueue({
      platform: platform,
      content: fileContent,
      scheduled_at: scheduleTime,
    });

    console.log(`Successfully queued post ID: ${queuedPost.id}`);
    console.log(`Platform: ${queuedPost.platform}`);
    console.log(`Scheduled for: ${queuedPost.scheduled_at}`);
    console.log(`Content snippet: ${queuedPost.content.substring(0, 80)}...`);
    console.log(`Current queue status saved to queue.json`);

    // For this task, we report when CLI is functional. The action of queuing a post confirms this.
    // The actual sending to Postiz API would typically be handled by a separate worker process
    // that polls the queue.

  } catch (error) {
    console.error(`Error queuing post: ${error.message}`);
    process.exit(1);
  }
}

main();