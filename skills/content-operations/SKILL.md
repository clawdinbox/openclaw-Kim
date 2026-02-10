# content-operations

Content operations for Market Pulse brand — posting schedules, content rules, and platform guidelines.

---

## Metadata

| Key | Value |
|-----|-------|
| `emoji` | 📢 |
| `requires` | memo (for Apple Notes todo list) |

---

## Usage

```bash
# Get posting schedule for a platform
clawdbot content-operations schedule <platform>

# Get content voice rules
clawdbot content-operations voice

# Get platform guidelines
clawdbot content-operations platforms

# Get full content cadence
clawdbot content-operations cadence
```

---

## Brand: Market Pulse

- **Substack:** https://marketpuls.substack.com
- **LinkedIn Newsletter:** https://www.linkedin.com/newsletters/market-pulse-by-marcel-melzig-7294719790542143490
- **Tagline:** 'Analyzing market shifts in fashion, luxury and sportswear — turning trends into business strategy.'

---

## Content Voice Rules

**Tone & Style:**
- Data-driven, opinionated, systems-thinking, confident
- NO hashtags, NO emojis, NO "I'm excited to share"
- All drafts to Marcel for review before publishing
- Communication always in English

---

## Posting Cadence

### Newsletter
- **Schedule:** Biweekly newsletter (Thursday)
- **Saved to:** `documents/newsletter/`

### Daily Social Posts

| Platform | Times (Berlin) | Format | Saved To |
|----------|---------------|--------|----------|
| X | 09:00, 13:00, 19:00 | Text | `documents/x-posts/` |
| Threads | 08:30, 12:30, 18:30 | Text | `documents/threads-posts/` |
| Substack Notes | 17:00 | Text | `documents/substack-notes/` |
| Instagram | 10:00 (1x daily) | Image + caption | `documents/instagram-posts/` |
| LinkedIn | Mon/Wed/Fri 09:00 | Article/Post | `documents/linkedin-drafts/` |

### Draft Locations

| Content Type | Path |
|--------------|------|
| Newsletter drafts | `documents/newsletter/` |
| Substack Notes | `documents/substack-notes/` |
| LinkedIn drafts | `documents/linkedin-drafts/` |
| X posts | `documents/x-posts/` |
| Threads posts | `documents/threads-posts/` |
| Instagram posts | `documents/instagram-posts/` |

---

## Platform Guidelines

### LinkedIn
- Professional, analytical tone
- Long-form thought leadership
- Strong engagement focus (15-55 comments per edition typical)

### X (Twitter)
- Concise, punchy takes
- Thread for deeper analysis
- 3x daily cadence

### Threads
- Conversational, informal
- 3x daily cadence
- Cross-post with adaptation

### Instagram
- Visual-first
- 1x daily (reduced from 3x)
- Image + caption format

### Substack
- Newsletter: Biweekly deep-dive
- Notes: Daily short-form
- Auto-posting planned (needs API setup)

---

## Cron Job IDs (Content-Related)

| Job | Cron ID | Model | Schedule |
|-----|---------|-------|----------|
| Daily X Post | `e979c2b6` | Gemini Flash | 09:00, 13:00, 19:00 |
| Daily Threads Post | `b378bb61` | Gemini Flash | 08:30, 12:30, 18:30 |
| Daily Instagram Post | `8313a3f4` | Gemini Flash | 10:00 |
| Daily Substack Note | `a3f5773e` | DeepSeek V3 | 17:00 |
| LinkedIn Pipeline | `880cd26b` | Gemini Flash | Mon/Wed/Fri 09:00 |
| Market Pulse Newsletter | `4159407a` | Gemini Flash | Thursdays 10:00 |

---

## Examples

**Create a week's content calendar:**
```
1. Check existing drafts in documents/newsletter/, documents/linkedin-drafts/
2. Identify gaps in posting schedule
3. Draft 3 LinkedIn posts (Mon/Wed/Fri topics)
4. Draft 21 X posts (3 per day)
5. Draft 21 Threads posts
7. Draft 7 Instagram posts (with image pipeline)
8. Save all to appropriate folders
9. Notify Marcel for review
```

**Draft a LinkedIn post:**
```
1. Review recent fashion/luxury/sportswear news
2. Apply content voice rules (data-driven, opinionated, no emojis)
3. Write hook + analysis + CTA
4. Save to documents/linkedin-drafts/YYYY-MM-DD-topic.md
5. Flag for Marcel review
```

---

## Action Items

- [ ] All content drafts require Marcel review before publishing
- [ ] Use scheduled cron jobs for automated posting
- [ ] Save all drafts to designated folder structure
- [ ] Auto-posting to Substack needs API setup (overnight project)
