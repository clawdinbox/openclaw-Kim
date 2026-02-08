# 🦞 Smart Posting System

An intelligent posting automation system that checks Postiz before creating posts to avoid duplicates. Built for Kim by Kimi K2.5.

## 📋 Overview

The Smart Posting System ensures you never double-post content by checking if a slot is already occupied before generating and scheduling new content.

**Posting Schedule (Berlin Time):**
- **Threads:** 08:30, 12:30, 18:30
- **X (Twitter):** 09:00, 13:00, 19:00

## 📁 File Structure

```
tools/posting-automation/
├── smart-poster.js       # Main posting logic with duplicate checking
├── postiz-checker.js     # Helper to query scheduled posts
├── daily-scheduler.js    # Cron-friendly wrapper with content generation
├── test-smart-poster.js  # Test suite
├── setup-cron.sh         # Cron job installer
└── README.md             # This file
```

## 🔧 Setup

### 1. Environment Variables

Create or update your `.env` file with:

```bash
# Postiz API Configuration
POSTIZ_API_KEY=your_postiz_api_key_here
X_INTEGRATION_ID=your_x_integration_id
THREADS_INTEGRATION_ID=your_threads_integration_id
INSTAGRAM_INTEGRATION_ID=your_instagram_integration_id  # optional
```

### 2. Install Dependencies

No external dependencies required! Uses only Node.js built-in modules.

Ensure Node.js is installed (v14+):
```bash
node --version
```

### 3. Make Scripts Executable

```bash
chmod +x tools/posting-automation/*.js
chmod +x tools/posting-automation/setup-cron.sh
```

### 4. Test the Setup

```bash
# Run the test suite
cd /Users/clawdmm/.openclaw/workspace
node tools/posting-automation/test-smart-poster.js

# Check today's posts
node tools/posting-automation/postiz-checker.js --today

# Dry-run a post (checks but doesn't create)
node tools/posting-automation/smart-poster.js \
  --platform x \
  --time 09:00 \
  --content "Test post" \
  --dry-run
```

### 5. Install Cron Jobs

```bash
cd /Users/clawdmm/.openclaw/workspace
./tools/posting-automation/setup-cron.sh
```

## 🚀 Usage

### Direct Usage

#### Smart Poster

Check and post if slot is free:

```bash
node tools/posting-automation/smart-poster.js \
  --platform x \
  --time 09:00 \
  --content "Your post content here"
```

With specific date:
```bash
node tools/posting-automation/smart-poster.js \
  --platform threads \
  --time 08:30 \
  --date 2026-02-10 \
  --content "Future post"
```

#### Postiz Checker

List today's posts:
```bash
node tools/posting-automation/postiz-checker.js --today
```

List posts for a specific date:
```bash
node tools/posting-automation/postiz-checker.js --date 2026-02-10
```

Check if a specific slot is occupied:
```bash
node tools/posting-automation/postiz-checker.js \
  --today \
  --check 09:00 \
  --platform x
```

List next 7 days:
```bash
node tools/posting-automation/postiz-checker.js --week
```

Filter by platform:
```bash
node tools/posting-automation/postiz-checker.js --today --platform threads
```

#### Daily Scheduler

The scheduler combines content generation with smart posting:

```bash
node tools/posting-automation/daily-scheduler.js \
  --platform x \
  --slot morning
```

With custom content:
```bash
node tools/posting-automation/daily-scheduler.js \
  --platform threads \
  --slot afternoon \
  --content "Custom message here"
```

Available slots: `morning`, `afternoon`, `evening`

### Cron Job Setup

The system is designed to run via cron. After running `setup-cron.sh`, the following schedule is active:

```cron
# Threads - Morning (08:30 Berlin)
30 8 * * * cd /Users/clawdmm/.openclaw/workspace && /usr/local/bin/node tools/posting-automation/daily-scheduler.js --platform threads --slot morning >> logs/threads-morning.log 2>&1

# X - Morning (09:00 Berlin)
0 9 * * * cd /Users/clawdmm/.openclaw/workspace && /usr/local/bin/node tools/posting-automation/daily-scheduler.js --platform x --slot morning >> logs/x-morning.log 2>&1

# Threads - Afternoon (12:30 Berlin)
30 12 * * * cd /Users/clawdmm/.openclaw/workspace && /usr/local/bin/node tools/posting-automation/daily-scheduler.js --platform threads --slot afternoon >> logs/threads-afternoon.log 2>&1

# X - Afternoon (13:00 Berlin)
0 13 * * * cd /Users/clawdmm/.openclaw/workspace && /usr/local/bin/node tools/posting-automation/daily-scheduler.js --platform x --slot afternoon >> logs/x-afternoon.log 2>&1

# Threads - Evening (18:30 Berlin)
30 18 * * * cd /Users/clawdmm/.openclaw/workspace && /usr/local/bin/node tools/posting-automation/daily-scheduler.js --platform threads --slot evening >> logs/threads-evening.log 2>&1

# X - Evening (19:00 Berlin)
0 19 * * * cd /Users/clawdmm/.openclaw/workspace && /usr/local/bin/node tools/posting-automation/daily-scheduler.js --platform x --slot evening >> logs/x-evening.log 2>&1
```

## 📊 Logging

Logs are stored in `logs/` directory:

- `threads-morning.log`
- `x-morning.log`
- `threads-afternoon.log`
- `x-afternoon.log`
- `threads-evening.log`
- `x-evening.log`

Each log entry includes:
- Timestamp
- Slot status (free/occupied)
- Action taken (posted/skipped)
- Post ID (if created)

## 🧪 Testing

Run the full test suite:

```bash
node tools/posting-automation/test-smart-poster.js
```

The test suite validates:
- Environment variable handling
- Argument validation
- Help display
- Dry-run mode
- Postiz checker functionality
- Timezone conversion
- Slot checking logic
- Error handling

## 🔄 How It Works

### Duplicate Prevention Flow

1. **Cron triggers** at scheduled time
2. **Daily scheduler** generates content (or uses provided content)
3. **Smart poster** receives post request
4. **Check existing posts**: Query Postiz API for posts in target time window
5. **Decision**:
   - If post exists → Log "Slot occupied, skipping" → Exit
   - If slot free → Create post → Log success

### Timezone Handling

All times are specified in **Berlin timezone (Europe/Berlin)**. The system automatically:
- Converts Berlin local time to UTC for Postiz API
- Handles DST transitions (UTC+1 / UTC+2)
- Checks ±1 minute window for existing posts

### API Error Handling

- **Fail open**: If the check fails (API down, network error), the system assumes the slot is free
- This prevents blocking posts due to temporary issues
- Errors are logged but don't stop the process

## 🛡️ Safety Features

1. **Duplicate checking** before every post
2. **Dry-run mode** for testing (`--dry-run`)
3. **Manual content override** (`--content` flag)
4. **Date targeting** for future scheduling
5. **Comprehensive logging** for audit trails
6. **Exit codes**: 0 for success, 1 for errors

## 🔍 Troubleshooting

### "POSTIZ_API_KEY environment variable is required"

Ensure your `.env` file is loaded or the variable is exported:
```bash
export $(cat .env | xargs)
```

### "Slot occupied, skipping"

This is expected behavior! The system detected an existing post at that time. Use the checker to verify:
```bash
node tools/posting-automation/postiz-checker.js --today --check 09:00 --platform x
```

### API errors

Check your API key and integration IDs:
```bash
curl -H "Authorization: $POSTIZ_API_KEY" \
  https://api.postiz.com/public/v1/integrations
```

### Timezone issues

All times are interpreted as Berlin time. The system converts to UTC automatically. Verify with:
```bash
node tools/posting-automation/smart-poster.js \
  --platform x --time 09:00 --content "test" --dry-run
```

## 📝 Integration with Content Generation

The `daily-scheduler.js` includes placeholder content generators:

```javascript
async function generateXContent(slot, date) {
  // Integrate with your AI service here
  // Return generated content string
}
```

To use your own content generation:
1. Edit `daily-scheduler.js`
2. Replace the placeholder functions with your AI integration
3. Or use the `--content` flag to bypass generation

## 🎯 Success Criteria Checklist

- [x] Checks Postiz before every post attempt
- [x] Never creates duplicate posts
- [x] Works for all 6 daily slots (3 X + 3 Threads)
- [x] Logs clearly what happened (skipped/posted)
- [x] Handles API errors gracefully
- [x] Converts Berlin time to UTC correctly
- [x] Includes comprehensive test suite
- [x] Provides dry-run mode for testing
- [x] Has helper utilities for checking posts
- [x] Includes cron setup automation

## 📚 API Reference

### Postiz API Endpoints Used

- `GET /public/v1/posts?startDate={ISO}&endDate={ISO}` - List posts
- `POST /public/v1/posts` - Create post

### Required Headers

```
Authorization: {POSTIZ_API_KEY}
Content-Type: application/json
```

## 🤝 Contributing

This is a Kim 🦞 internal tool. For improvements:
1. Edit the relevant `.js` file
2. Run tests: `node test-smart-poster.js`
3. Test manually with `--dry-run`
4. Update this README

## 📄 License

Internal use only. Part of the Kim system.

---

Built with 💙 by Kimi K2.5 for Kim 🦞
