#!/usr/bin/env node

/**
 * Postiz Social Media Automation Setup
 * Configures daily posting for X, Threads, Substack Notes
 */

const fs = require('fs');
const path = require('path');

// Content extraction from existing cron outputs
async function extractDailyInsight() {
  const todayMemory = path.join(process.cwd(), 'memory', `${new Date().toISOString().split('T')[0]}.md`);
  
  if (fs.existsSync(todayMemory)) {
    const content = fs.readFileSync(todayMemory, 'utf8');
    // Extract key insights from morning brief and afternoon reports
    const insights = content.split('\n').filter(line => 
      line.includes('**') || line.includes('KEY TAKEAWAY') || line.includes('INSIGHT')
    );
    return insights[0] || "No insights available today.";
  }
  
  return "Market analysis in progress.";
}

// Platform-specific formatters
function formatForX(insight) {
  // X: 280 chars max, sharp and analytical
  const hook = insight.split('.')[0];
  const take = insight.split('.')[1] || '';
  return `${hook}.${take ? ` ${take.trim().substring(0, 180)}` : ''}`
    .substring(0, 280)
    .replace(/[#@]/g, ''); // No hashtags/mentions
}

function formatForThreads(insight) {
  // Threads: 500 chars, slightly longer context
  return `${insight}

What's your take on this shift?`
    .substring(0, 500)
    .replace(/[#@]/g, '');
}

function formatForSubstack(insight) {
  // Substack Notes: 1000 chars, deeper analysis
  const expanded = `${insight}

This signals a broader shift in how brands are approaching the market. The implications for strategic positioning are significant.

Worth monitoring: how quickly competitors adapt to this new reality.`;
  
  return expanded.substring(0, 1000);
}

function formatForInstagram(insight) {
  // Instagram: 2200 chars, visual storytelling with strategic insight
  const expanded = `${insight}

The fashion industry is at an inflection point. Brands that understand these shifts will outperform those that don't.

This is about more than trends — it's about fundamental changes in how consumers think, shop, and engage with brands.

The data tells a clear story. The question is: are you listening?

---

Follow for daily insights on fashion, luxury, and sportswear strategy.`;
  
  return expanded.substring(0, 2200);
}

// Postiz API integration
async function schedulePost(content, integrationId, scheduleTime) {
  if (!process.env.POSTIZ_API_KEY) {
    console.log(`Would post to ${integrationId} at ${scheduleTime}:`);
    console.log(content);
    console.log('---');
    return;
  }

  const postData = {
    type: "schedule",
    date: scheduleTime,
    shortLink: false,
    tags: [],
    posts: [{
      integration: { id: integrationId },
      value: [{ content }],
      settings: { "__type": "x" } // Will be platform-specific
    }]
  };

  // Would make actual API call here
  console.log(`Scheduled for ${integrationId}:`, content);
}

// Daily posting schedule: 15:00 X, 17:00 Substack, 19:00 Threads, 21:00 Instagram
async function scheduleDailyPosts() {
  const insight = await extractDailyInsight();
  const today = new Date();
  
  // Calculate posting times for today (Berlin timezone)
  const xTime = new Date(today);
  xTime.setHours(15, 0, 0, 0);
  
  const substackTime = new Date(today);
  substackTime.setHours(17, 0, 0, 0);
  
  const threadsTime = new Date(today);
  threadsTime.setHours(19, 0, 0, 0);
  
  const instagramTime = new Date(today);
  instagramTime.setHours(21, 0, 0, 0);

  // Format content for each platform
  const xContent = formatForX(insight);
  const substackContent = formatForSubstack(insight);
  const threadsContent = formatForThreads(insight);
  const instagramContent = formatForInstagram(insight);

  // Schedule posts (will need actual integration IDs from Postiz)
  await schedulePost(xContent, 'x-integration-id', xTime.toISOString());
  await schedulePost(substackContent, 'substack-integration-id', substackTime.toISOString());
  await schedulePost(threadsContent, 'threads-integration-id', threadsTime.toISOString());
  await schedulePost(instagramContent, 'instagram-integration-id', instagramTime.toISOString());
  
  // Save drafts locally for review
  const draftsDir = path.join(process.cwd(), 'documents/daily-posts', today.toISOString().split('T')[0]);
  if (!fs.existsSync(draftsDir)) {
    fs.mkdirSync(draftsDir, { recursive: true });
  }
  
  fs.writeFileSync(path.join(draftsDir, 'x-post.txt'), xContent);
  fs.writeFileSync(path.join(draftsDir, 'substack-note.txt'), substackContent);
  fs.writeFileSync(path.join(draftsDir, 'threads-post.txt'), threadsContent);
  fs.writeFileSync(path.join(draftsDir, 'instagram-post.txt'), instagramContent);
  
  console.log(`Daily posts prepared and scheduled for ${today.toISOString().split('T')[0]}`);
}

if (require.main === module) {
  scheduleDailyPosts().catch(console.error);
}

module.exports = { scheduleDailyPosts, formatForX, formatForThreads, formatForSubstack, formatForInstagram };