# MEMORY.md - Long-Term Memory

*Curated context. What matters, distilled.*

---

## 2026-02-04 — Day Zero

- **Marcel** — founder, strategist, analyst. Fashion/luxury/sportswear/resale/culture. One-person business.
- **Kim** 🦞 — AI operator, not assistant. Action > questions. Execute > discuss.
- Operating principle: *Make Marcel faster, clearer, and harder to outcompete.*
- Setup: fresh OpenClaw workspace, building from zero.

---

## Systems

### Scheduled Tasks
| System | Schedule | Purpose |
|--------|----------|---------|
| Morning Brief | 08:00 daily | Weather, markets, ONE key signal, tasks, recommendation |
| Afternoon Deep-Dive | 14:00 daily | Analyst-grade research piece, saved to concepts/ |
| LinkedIn Content Pipeline | 09:00 Mon/Wed/Fri | Research + draft one LinkedIn post for review |
| Overnight Autonomous Projects | 20:00 daily | Build tools, automations, ship PRs |
| Weekly Strategy Digest | 10:00 Sundays | Week's signals synthesized into actionable brief |

### 2026-02-06 — Opus 4.6 Upgrade
- Switched to Claude Opus 4.6
- Rewrote all cron prompts for deeper, more structured output
- Added LinkedIn Content Pipeline (Mon/Wed/Fri)
- Added Weekly Strategy Digest (Sundays)
- Renamed Proactive Coder → Overnight Autonomous Projects, expanded scope
- All prompts now demand: specific data, named companies, contrarian takes, frameworks

### Ebook Design Style (from Marcel's existing products)
- **Font**: Montserrat family (ExtraBold, Bold, BoldItalic, SemiBold, Medium, Regular) + StarShield for cover display
- **Colors**: White (#FFFFFF) + Black (#000000) + Cyan (#00ADEE) — 3-color system
- **Cover**: Blue gradient background, background image, highlight bars on key words, circular author photo
- **Interior**: White background, dark header bar, page number top-left (02, 03...), large stacked titles (black + cyan split), left-aligned single column
- **Final page**: Full dark background CTA (LinkedIn/contact)
- **Style**: Clean, modern, consultant/analyst positioning. Typography-driven. No emoji/clipart.
- **Format**: A4 (595×842pt)
- **Full reference**: `documents/reference-ebooks/DESIGN-STYLE-GUIDE.md`
- **Source files**: `documents/reference-ebooks/ebook-1.pdf` (Fashion Brand guide, 24pp) + `ebook-2-luxury-resale-guide.pdf` (Luxury Resale guide, 16pp)

### 2nd Brain
- **App:** `workspace/second-brain/` (NextJS)
- **Documents:** `workspace/documents/` (journal/, concepts/)
- **Purpose:** Document viewer + auto-generated knowledge base
- Create docs on important concepts as we discuss them
- Daily journal entries summarizing discussions

### Content — Market Pulse
- **Brand:** Market Pulse
- **Substack:** https://marketpuls.substack.com
- **LinkedIn Newsletter:** https://www.linkedin.com/newsletters/market-pulse-by-marcel-melzig-7294719790542143490
- **Tagline:** 'Analyzing market shifts in fashion, luxury and sportswear — turning trends into business strategy.'
- **Existing cadence:** ~monthly on LinkedIn (strong engagement: 15-55 comments per edition)
- **New cadence:** Biweekly newsletter (Thu) + daily social posts: X (15:00), Substack Notes (17:00), Threads (19:00), Instagram (21:00) + LinkedIn posts (Mon/Wed/Fri)
- **Drafts saved to:** documents/newsletter/, documents/substack-notes/, documents/linkedin-drafts/
- **Auto-posting to Substack:** Planned — needs substack-api setup with cookie auth (overnight project)

### Cron Job IDs
| Job | Cron ID | Model | Schedule (Berlin) |
|-----|---------|-------|-------------------|
| Morning Brief | `d90b169b` | Gemini Flash | 08:00 daily |
| Afternoon Deep-Dive | `3950b848` | Gemini Flash | 14:00 daily |
| Overnight Autonomous Projects | `72c0e629` | Opus 4.6 | 20:00 daily |
| Daily Substack Note | `a3f5773e` | DeepSeek V3 | 17:00 daily |
| **Daily X Post** | `e979c2b6` | Gemini Flash | **09:00, 13:00, 19:00** |
| **Daily Threads Post** | `b378bb61` | Gemini Flash | **08:30, 12:30, 18:30** |
| **Daily Instagram Post** | `8313a3f4` | Gemini Flash | **10:00 (1x daily)** |
| Weekly Strategy Digest | `78accee7` | Gemini Flash | Sundays 10:00 |
| LinkedIn Pipeline | `880cd26b` | Gemini Flash | Mon/Wed/Fri 09:00 |
| Market Pulse Newsletter | `4159407a` | Gemini Flash | Thursdays 10:00 |
| Proactive Check-In (2h) | `6d0810da` | Gemini Flash | 08:00, 14:00 |

**Note:** Social posts use European timing. Instagram reduced to 1x daily (was 3x).

### Digital Products — Gumroad
- **Store:** https://marcelmelzig.gumroad.com/ — "Market Pulse Pro"
- **Existing:** Branding Mistakes (free), Logo Guide (free/PWYW), Fashion Brand Clarity (€7), Luxury Resale Guide (premium tier with call)
- **AI Impact on Fashion Ebook:** €19, draft at `documents/ai-impact-on-fashion_ebook_draft.md`, listing copy drafted
- **Product ladder:** Free lead magnets → €7-19 guides → €29-49 reports → €99-199 consulting bridges
- **Free lead magnet:** 3-5 page ebook excerpt (not full ebook)
- **Next product options:** Sportswear Positioning Report or AI Implementation Scorecard

### Integrations
- **Todo list:** Apple Notes (use `memo` CLI)
- **Weather:** Düsseldorf
- **Interests:** Fashion, luxury, sportswear, resale, culture, AI/ML, business strategy
- **GitHub:** `/Users/clawdmm/Documents/GitHub/openclaw-Kim`
- **LinkedIn:** https://www.linkedin.com/in/marcel-melzig-a73b2733
- **X:** @mmelzig
- **Threads:** @marcel.melzig
- **Instagram:** TBD (need to connect to Postiz)
- **Threads (Julie Temirella):** https://www.threads.com/@julietemirella (provided 2026-02-06)
- **Threads (Steven Mellor):** https://www.threads.com/@thestevenmellor
- **Threads (Anferneeck):** https://www.threads.com/@anferneeck
- **Threads (Marie West):** https://www.threads.com/@realmariewest
- **Telegram chat ID:** 6436343453 (@MBTC1)

### Content Voice Rules
- Data-driven, opinionated, systems-thinking, confident
- NO hashtags, NO emojis, NO "I'm excited to share"
- All drafts to Marcel for review before publishing
- Communication always in English

### Infra Notes
- pandoc, puppeteer, md-to-pdf installed
- No browser on machine — puppeteer workaround at `/tmp/pdf-gen/`
- nano-pdf skill available for PDF editing
- Telegram voice messages via `message(asVoice=true)`
- Machine: 16GB RAM / 10 CPUs — Ollama limited to ≤20B models
- Large HTML rewrites (2000+ lines) need Opus — cheap models hit 8192 output cap

### Model Tiering (Cost Control)
| Tier | Model | Cost (in/out per M) | Used For |
|------|-------|---------------------|----------|
| Premium | Opus 4.6 | $15/$75 | Main chat, overnight coding |
| Mid | Gemini 2.5 Flash | $0.15/$0.60 | Morning Brief, Afternoon, LinkedIn, Newsletter, Weekly Digest |
| Budget | DeepSeek V3 | $0.14/$0.28 | Daily Substack Note |
| Sub-agents | OpenRouter Auto | variable | All spawned sub-agents |
- Gemini 3 Flash exists but 5x more expensive on output — not worth it yet
- Track model releases for cheaper alternatives

### PDF Generation Lessons
- **DO NOT use** puppeteer `displayHeaderFooter` — causes overlapping content, blank gaps, cut titles
- **DO use** embedded header divs inside each page div + zero-margin puppeteer config
- v4 HTML is the golden base for all ebook layouts
- Overflow strategy: measure `scrollHeight` per page div (1123px = one page), split anything taller
- Sub-agents for PDF work: need Opus for large rewrites, cheap models can't handle 2000+ line files
