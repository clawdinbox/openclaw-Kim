# OpenClaw Skills Integration Guide

**Generated:** 2026-02-09  
**Total Skills:** 11  
**Status:** Production Ready

---

## Quick Reference Table

| Skill | Category | API Key Required | Setup Complexity |
|-------|----------|------------------|------------------|
| notion | Productivity | ✅ Notion API Key | Low |
| gumroad-admin | E-commerce | ✅ Gumroad Token | Low |
| canva | Design | ✅ OAuth (Client ID/Secret) | Medium |
| deep-research-pro | Research | ❌ None | None |
| google-slides | Productivity | ✅ Maton API Key | Medium |
| youtube-watcher | Media | ❌ None (requires yt-dlp) | Low |
| atxp | AI/ML | ✅ ATXP Connection | Medium |
| github | DevOps | ❌ (uses gh CLI auth) | Low |
| frontend-design | Development | ❌ None | None |
| gog | Productivity | ✅ Google OAuth | Medium |
| clawdhub | Registry/CLI | ❌ (optional for publish) | Low |

---

## 1. notion 📝

### What It Does
Full Notion API integration for creating and managing pages, databases (data sources), and blocks. Supports the latest Notion API version (2025-09-03).

### Required Setup

```bash
# 1. Create integration at https://notion.so/my-integrations
# 2. Get API key (starts with ntn_ or secret_)
# 3. Store it:
mkdir -p ~/.config/notion
echo "ntn_your_key_here" > ~/.config/notion/api_key
# 4. Share target pages/databases with your integration in Notion UI
```

### Integration Example

```bash
NOTION_KEY=$(cat ~/.config/notion/api_key)

# Search for pages and databases
curl -X POST "https://api.notion.com/v1/search" \
  -H "Authorization: Bearer $NOTION_KEY" \
  -H "Notion-Version: 2025-09-03" \
  -H "Content-Type: application/json" \
  -d '{"query": "Project Tasks"}'

# Create a page in a database
curl -X POST "https://api.notion.com/v1/pages" \
  -H "Authorization: Bearer $NOTION_KEY" \
  -H "Notion-Version: 2025-09-03" \
  -H "Content-Type: application/json" \
  -d '{
    "parent": {"database_id": "db-uuid-here"},
    "properties": {
      "Name": {"title": [{"text": {"content": "New Task"}}]},
      "Status": {"select": {"name": "In Progress"}},
      "Priority": {"select": {"name": "High"}}
    }
  }'

# Query a database (using data_source_id in v2025-09-03)
curl -X POST "https://api.notion.com/v1/data_sources/{data_source_id}/query" \
  -H "Authorization: Bearer $NOTION_KEY" \
  -H "Notion-Version: 2025-09-03" \
  -H "Content-Type: application/json" \
  -d '{
    "filter": {"property": "Status", "select": {"equals": "Done"}},
    "sorts": [{"property": "Due Date", "direction": "ascending"}]
  }'
```

### Key Notes
- **API Version:** Uses `2025-09-03` (databases are now "data sources")
- **Two IDs:** `database_id` for creating pages, `data_source_id` for queries
- **Rate Limit:** ~3 requests/second average

---

## 2. gumroad-admin 💸

### What It Does
Gumroad Admin CLI for checking sales, managing products, and creating discount codes.

### Required Setup

```bash
# Get Access Token from Gumroad: Settings > Advanced > Applications
export GUMROAD_ACCESS_TOKEN="your_token_here"
```

### Integration Example

```bash
# Check today's sales
gumroad-admin sales --day today

# Check last 30 days
gumroad-admin sales --last 30

# List all products
gumroad-admin products

# Create a discount code
gumroad-admin discounts create \
  --product PRODUCT_ID \
  --code "TWITTER20" \
  --amount 20 \
  --type percent
```

### Key Notes
- Simple CLI wrapper around Gumroad API
- No complex authentication flow needed (just token)
- Useful for quick sales checks and discount management

---

## 3. canva 🎨

### What It Does
Create, export, and manage Canva designs via the Connect API. Generate social posts, carousels, and graphics programmatically.

### Required Setup

```bash
# 1. Create integration at https://www.canva.com/developers/
# 2. Get Client ID and Client Secret
export CANVA_CLIENT_ID="your_client_id"
export CANVA_CLIENT_SECRET="your_client_secret"

# 3. Authenticate (first time) - tokens stored in ~/.canva/tokens.json
# Run auth flow to get access tokens
```

### Integration Example

```bash
# Get access token
ACCESS_TOKEN=$(cat ~/.canva/tokens.json | jq -r '.access_token')

# List designs
curl -s "https://api.canva.com/rest/v1/designs" \
  -H "Authorization: Bearer $ACCESS_TOKEN" | jq .

# Create design from template
curl -X POST "https://api.canva.com/rest/v1/autofills" \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "brand_template_id": "TEMPLATE_ID",
    "data": {
      "title": {"type": "text", "text": "Summer Sale!"},
      "body": {"type": "text", "text": "50% off everything"}
    }
  }'

# Export design as PNG
curl -X POST "https://api.canva.com/rest/v1/exports" \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "design_id": "DESIGN_ID",
    "format": {"type": "png", "width": 1080, "height": 1080}
  }'

# Upload asset
curl -X POST "https://api.canva.com/rest/v1/asset-uploads" \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -H "Content-Type: application/octet-stream" \
  -H 'Asset-Upload-Metadata: {"name": "my-image.png"}' \
  --data-binary @image.png
```

### Key Notes
- **OAuth 2.0** with automatic token refresh
- **Rate Limits:** 100 req/min (general), 30 req/min (upload/export)
- **Export Formats:** PNG, JPG, PDF, MP4, GIF
- **Required Scopes:** design:content:read/write, asset:read/write, brandtemplate:content:read

---

## 4. deep-research-pro 🔬

### What It Does
Multi-source deep research agent. Searches the web using DuckDuckGo, synthesizes findings, and delivers cited reports. **No API keys required.**

### Required Setup
- No API keys needed!
- Requires DDG search script: `/home/clawdbot/clawd/skills/ddg-search/scripts/ddg`

### Integration Example

```bash
# Workflow for researching a topic

# 1. Plan sub-questions for: "Impact of AI on healthcare"
#    - What are the main AI applications in healthcare today?
#    - What clinical outcomes have been measured?
#    - What are the regulatory challenges?

# 2. Execute searches for each sub-question
/home/clawdbot/clawd/skills/ddg-search/scripts/ddg \
  "AI applications healthcare 2025" --max 8

/home/clawdbot/clawd/skills/ddg-search/scripts/ddg \
  "healthcare AI clinical outcomes studies" --max 8

/home/clawdbot/clawd/skills/ddg-search/scripts/ddg news \
  "AI healthcare FDA approval" --max 5

# 3. Deep-read promising sources
curl -sL "https://example.com/article" | python3 -c "
import sys, re
html = sys.stdin.read()
text = re.sub('<[^>]+>', ' ', html)
text = re.sub(r'\s+', ' ', text).strip()
print(text[:5000])
"

# 4. Synthesize and save report
mkdir -p ~/clawd/research/ai-healthcare-2025
cat > ~/clawd/research/ai-healthcare-2025/report.md << 'EOF'
# AI in Healthcare: Deep Research Report
*Generated: 2026-02-09 | Sources: 15 | Confidence: High*

## Executive Summary
[3-5 sentence overview]

## Key Findings
...

## Sources
1. [Title](url) — summary
EOF
```

### Key Notes
- **No paid APIs** — uses DuckDuckGo search
- **Quality Rules:** Every claim needs a source, cross-reference, prefer sources <12 months
- **Output:** Markdown report with executive summary, key findings, and sources

---

## 5. google-slides 📊

### What It Does
Google Slides API integration with managed OAuth via Maton gateway. Create presentations, add slides, insert content, and manage formatting.

### Required Setup

```bash
# 1. Get API key from https://maton.ai/settings
export MATON_API_KEY="your_maton_api_key"

# 2. Create OAuth connection
python3 << 'EOF'
import urllib.request, os, json
data = json.dumps({'app': 'google-slides'}).encode()
req = urllib.request.Request('https://ctrl.maton.ai/connections', 
                             data=data, method='POST')
req.add_header('Authorization', f'Bearer {os.environ["MATON_API_KEY"]}')
req.add_header('Content-Type', 'application/json')
resp = json.load(urllib.request.urlopen(req))
print(f"Open this URL to authorize: {resp['connection']['url']}")
EOF
```

### Integration Example

```bash
# Create a presentation
python3 << 'EOF'
import urllib.request, os, json

data = json.dumps({'title': 'Q1 Report 2026'}).encode()
req = urllib.request.Request(
    'https://gateway.maton.ai/google-slides/v1/presentations',
    data=data, method='POST'
)
req.add_header('Authorization', f'Bearer {os.environ["MATON_API_KEY"]}')
req.add_header('Content-Type', 'application/json')
resp = json.load(urllib.request.urlopen(req))
print(f"Created: {resp['presentationId']}")
EOF

# Add slides with batchUpdate
python3 << 'EOF'
import urllib.request, os, json

presentation_id = "YOUR_PRESENTATION_ID"
requests_payload = {
    "requests": [
        {
            "createSlide": {
                "objectId": "slide_title",
                "slideLayoutReference": {
                    "predefinedLayout": "TITLE"
                }
            }
        },
        {
            "insertText": {
                "objectId": "slide_title",
                "text": "Q1 Performance Report",
                "insertionIndex": 0
            }
        }
    ]
}

data = json.dumps(requests_payload).encode()
req = urllib.request.Request(
    f'https://gateway.maton.ai/google-slides/v1/presentations/{presentation_id}:batchUpdate',
    data=data, method='POST'
)
req.add_header('Authorization', f'Bearer {os.environ["MATON_API_KEY"]}')
req.add_header('Content-Type', 'application/json')
resp = json.load(urllib.request.urlopen(req))
print("Slides added successfully")
EOF
```

### Key Notes
- **Gateway URL:** `https://gateway.maton.ai/google-slides/v1/...`
- **Connection Management:** Manage at `https://ctrl.maton.ai`
- **Rate Limit:** 10 req/sec per account
- **Layouts:** BLANK, TITLE, TITLE_AND_BODY, TITLE_AND_TWO_COLUMNS, etc.

---

## 6. youtube-watcher 📺

### What It Does
Fetch and read transcripts from YouTube videos. Enables summarization, QA, and content extraction from video content.

### Required Setup

```bash
# Install yt-dlp
brew install yt-dlp
# OR
pip install yt-dlp
```

### Integration Example

```bash
# Get transcript from a YouTube video
python3 /Users/clawdmm/.openclaw/workspace/skills/youtube-watcher/scripts/get_transcript.py \
  "https://www.youtube.com/watch?v=VIDEO_ID"

# Save transcript to file for analysis
python3 /Users/clawdmm/.openclaw/workspace/skills/youtube-watcher/scripts/get_transcript.py \
  "https://www.youtube.com/watch?v=VIDEO_ID" > transcript.txt

# Then summarize or search the transcript
cat transcript.txt | head -100
```

### Key Notes
- Requires `yt-dlp` in PATH
- Works with videos that have closed captions (CC) or auto-generated subtitles
- Fails gracefully if no subtitles available
- No API keys required

---

## 7. atxp 🤖

### What It Does
Access ATXP paid API tools for web search, AI image generation, music creation, video generation, and X/Twitter search.

### Required Setup

```bash
# Check if authenticated
echo $ATXP_CONNECTION

# If not set, login:
npx atxp login
source ~/.atxp/config
```

### Integration Example

```bash
# Real-time web search
npx atxp search "latest AI breakthroughs 2025"

# AI image generation
npx atxp image "futuristic cityscape at sunset, cyberpunk style"

# AI music generation
npx atxp music "upbeat electronic track for workout video"

# AI video generation
npx atxp video "slow motion waterfall in tropical forest"

# X/Twitter search
npx atxp x "OpenClaw launch"
```

### Programmatic Access (TypeScript)

```typescript
import { atxpClient, ATXPAccount } from '@atxp/client';

const client = await atxpClient({
  mcpServer: 'https://search.mcp.atxp.ai',
  account: new ATXPAccount(process.env.ATXP_CONNECTION),
});

const result = await client.callTool({
  name: 'search_search',
  arguments: { query: 'your query' },
});
```

### MCP Servers

| Server | Tool | Purpose |
|--------|------|---------|
| `search.mcp.atxp.ai` | `search_search` | Web search |
| `image.mcp.atxp.ai` | `image_create_image` | Image generation |
| `music.mcp.atxp.ai` | `music_create` | Music generation |
| `video.mcp.atxp.ai` | `create_video` | Video generation |
| `x-live-search.mcp.atxp.ai` | `x_live_search` | X/Twitter search |

---

## 8. github 🐙

### What It Does
Interact with GitHub using the `gh` CLI. Manage issues, PRs, CI runs, and advanced API queries.

### Required Setup

```bash
# Install gh CLI if not already installed
brew install gh

# Authenticate (one-time)
gh auth login
```

### Integration Example

```bash
# Check CI status on a PR
gh pr checks 55 --repo owner/repo

# List recent workflow runs
gh run list --repo owner/repo --limit 10

# View a specific run
gh run view 123456789 --repo owner/repo

# View logs for failed steps only
gh run view 123456789 --repo owner/repo --log-failed

# List issues with JSON output
gh issue list --repo owner/repo --json number,title,state

# Advanced API query
gh api repos/owner/repo/pulls/55 --jq '.title, .state, .user.login'

# Get repository info
gh repo view owner/repo --json name,description,stargazersCount
```

### Key Notes
- Uses `gh` CLI authentication (no separate API keys needed)
- Always specify `--repo owner/repo` when not in a git directory
- JSON output with `--json` and filtering with `--jq`

---

## 9. frontend-design 🎨

### What It Does
Guidelines and best practices for creating distinctive, production-grade frontend interfaces with high design quality. Avoids generic "AI slop" aesthetics.

### Required Setup
- No setup required! This is a design skill/guideline.

### Usage Pattern

When building web components/pages, follow these principles:

```
## Design Thinking Checklist

### 1. Understand Context
- Purpose: What problem does this solve?
- Audience: Who uses it?
- Tone: Pick an aesthetic direction (minimal, maximalist, retro-futuristic, etc.)

### 2. Implementation Guidelines
- **Typography:** Avoid generic fonts (Inter, Arial). Use distinctive pairings.
- **Color:** Commit to a cohesive aesthetic with CSS variables
- **Motion:** CSS animations for HTML, Motion library for React
- **Layout:** Unexpected layouts, asymmetry, overlap, grid-breaking
- **Visual Details:** Gradient meshes, noise textures, dramatic shadows

### 3. NEVER Use
- Overused fonts (Space Grotesk, Inter, Roboto)
- Purple gradients on white backgrounds
- Predictable layouts
- Cookie-cutter component patterns
```

### Example Workflow

When user asks: "Create a landing page for my SaaS"

1. **Choose aesthetic:** "Brutalist dark theme with monospace fonts"
2. **Typography:** JetBrains Mono + Space Mono
3. **Colors:** Black background, neon green accents, white text
4. **Layout:** Asymmetric grid with overlapping elements
5. **Motion:** Glitch effects on hover, typewriter text reveal

---

## 10. gog 🎮

### What It Does
Google Workspace CLI for Gmail, Calendar, Drive, Contacts, Sheets, and Docs.

### Required Setup

```bash
# Install gog
brew install steipete/tap/gogcli

# Setup OAuth credentials
gog auth credentials /path/to/client_secret.json

# Add account with services
gog auth add you@gmail.com --services gmail,calendar,drive,contacts,sheets,docs

# Verify
gog auth list

# Set default account
export GOG_ACCOUNT=you@gmail.com
```

### Integration Example

```bash
# Gmail operations
gog gmail search 'newer_than:7d from:boss@company.com' --max 10
gog gmail send --to client@example.com --subject "Project Update" --body "Hello, ..."

# Calendar
gog calendar events primary --from 2026-02-01T00:00:00Z --to 2026-02-28T23:59:59Z

# Drive
gog drive search "Q1 Report" --max 10
gog drive upload ./document.pdf --name "Q1 Report.pdf"

# Contacts
gog contacts list --max 20

# Sheets
gog sheets get SPREADSHEET_ID "Sheet1!A1:D10" --json
gog sheets update SPREADSHEET_ID "Sheet1!A1:B2" \
  --values-json '[["Name","Score"],["Alice","95"]]' --input USER_ENTERED
gog sheets append SPREADSHEET_ID "Sheet1!A:C" \
  --values-json '[["Bob","87","A"]]' --insert INSERT_ROWS

# Docs
gog docs export DOC_ID --format txt --out /tmp/document.txt
gog docs cat DOC_ID
```

### Key Notes
- Set `GOG_ACCOUNT=you@gmail.com` to avoid repeating `--account`
- Use `--json` and `--no-input` for scripting
- OAuth setup required once, then persistent

---

## 11. clawdhub 📦

### What It Does
CLI for searching, installing, updating, and publishing agent skills from clawdhub.com.

### Required Setup

```bash
# Install CLI
npm i -g clawdhub

# Login (only needed for publishing)
clawdhub login
clawdhub whoami
```

### Integration Example

```bash
# Search for skills
clawdhub search "postgres backups"
clawdhub search "google calendar"

# Install a skill
clawdhub install my-skill
clawdhub install my-skill --version 1.2.3

# List installed skills
clawdhub list

# Update skills
clawdhub update my-skill
clawdhub update my-skill --version 1.2.3
clawdhub update --all
clawdhub update --all --no-input --force

# Publish a skill (requires login)
clawdhub publish ./my-skill \
  --slug my-skill \
  --name "My Skill" \
  --version 1.2.0 \
  --changelog "Fixes + docs"
```

### Key Notes
- **Registry:** https://clawdhub.com (override with `CLAWDHUB_REGISTRY`)
- **Workdir:** Default is cwd; install to `./skills`
- **Update:** Uses hash-based matching + upgrade logic
- **Force update:** Use `--force` to override version checks

---

## Environment Variables Summary

Create a `.env` file or export these in your shell:

```bash
# notion
export NOTION_KEY="ntn_..."  # or read from ~/.config/notion/api_key

# gumroad-admin
export GUMROAD_ACCESS_TOKEN="..."

# canva
export CANVA_CLIENT_ID="..."
export CANVA_CLIENT_SECRET="..."

# google-slides
export MATON_API_KEY="..."

# atxp
export ATXP_CONNECTION="..."  # set via `npx atxp login`

# gog
export GOG_ACCOUNT="you@gmail.com"

# github (via gh CLI, no env vars needed)
```

---

## Testing Checklist

Before using each skill in production:

- [ ] **notion:** API key stored and page/database shared with integration
- [ ] **gumroad-admin:** Token set and test `gumroad-admin products`
- [ ] **canva:** OAuth completed and token refresh working
- [ ] **deep-research-pro:** DDG search script accessible
- [ ] **google-slides:** Maton API key valid and OAuth connection active
- [ ] **youtube-watcher:** `yt-dlp` installed and working
- [ ] **atxp:** Logged in with `npx atxp login`
- [ ] **github:** `gh auth status` shows authenticated
- [ ] **frontend-design:** (guideline skill — no testing needed)
- [ ] **gog:** OAuth credentials configured and `gog auth list` shows account
- [ ] **clawdhub:** CLI installed and `clawdhub list` works

---

## Troubleshooting

### Common Issues

| Issue | Skill | Solution |
|-------|-------|----------|
| "Invalid API key" | google-slides | Check `echo $MATON_API_KEY`, verify at maton.ai/settings |
| "No subtitles" | youtube-watcher | Video has no CC; try different video |
| "401 Unauthorized" | notion | Verify key format (ntn_ prefix), check Notion-Version header |
| "Token expired" | canva | Run auth flow again to refresh |
| "No connection" | google-slides | Create connection at ctrl.maton.ai |
| "Command not found" | gog | `brew install steipete/tap/gogcli` |
| "Not authenticated" | github | Run `gh auth login` |

---

## Next Steps

1. Set up environment variables for skills you plan to use
2. Run through the testing checklist
3. Explore skill-specific workflows in their SKILL.md files
4. Combine skills for powerful automations (e.g., deep-research → notion → google-slides)

---

*Guide generated by Coder 💻 | OpenClaw Agent*
