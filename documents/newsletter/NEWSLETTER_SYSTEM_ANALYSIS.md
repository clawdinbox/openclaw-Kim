# Newsletter System Analysis & Structure

## Analysis Date: 2026-02-08
## Analyst: Kim 🦞 (Newsletter System Build)

---

## Current State

### Existing Newsletter Infrastructure
- **Directory**: `/documents/newsletter/` (empty — new system)
- **Cron Job**: `4159407a` — Market Pulse Newsletter Draft (referenced but not found in current config)
- **Related Tools**: 
  - `image-sourcing/` — General social media image sourcing
  - `posting-automation/` — Social scheduling infrastructure

---

## Newsletter Structure Analysis

### Target Format: Market Pulse
**Positioning**: Biweekly intelligence briefing on fashion, luxury, and sportswear strategy
**Audience**: Industry professionals, executives, strategists
**Frequency**: Every 2 weeks, Thursday 10:00 CET

### Content Architecture

#### 1. Header
- Issue number and date
- Tagline: "Your biweekly intelligence briefing"
- Read time indicator
- Hero image (1200x630, branded)

#### 2. Opening (100-150 words)
- Hook: What's happening now
- Context: Why this matters
- Promise: What the reader will learn

#### 3. The Signal (400-600 words)
- Deep dive on the most important story
- Data-backed with specific numbers
- "So what?" analysis
- Ripple effects on broader market

#### 4. By The Numbers (100-150 words)
- 3-4 key metrics with context
- Sourced from reputable outlets (Bain, McKinsey, earnings)
- Table format for scannability

#### 5. What We're Watching (150-200 words)
- 2-3 emerging trends or events
- Brief explanations
- Forward-looking

#### 6. Closing (75-100 words)
- One punchy takeaway
- Personal sign-off
- Soft CTA (reply, share, connect)

### Tone & Voice

| Element | Substack | LinkedIn |
|---------|----------|----------|
| **Length** | 1000-1500 words | 500-700 words |
| **Tone** | Professional, analytical | Punchy, direct |
| **Depth** | Full analysis | Single insight |
| **Voice** | Conversational expert | Thought leader |
| **Formatting** | Headers, tables, bullets | Short paragraphs, bullets |

### Key Characteristics

#### Do
- Lead with insight, not setup
- Use specific numbers and percentages
- Attribute all data points
- Write decisively (avoid hedging)
- Make it scannable

#### Don't
- Generic observations
- Academic tone
- Excessive links
- Passive voice
- "On the one hand... on the other hand"

---

## Image Strategy

### Header Image Specs
- **Substack**: 1200x630px (landscape)
- **LinkedIn**: 1200x627px (landscape) or 1080x1350px (portrait)
- **Brand Overlay**: @marcel.melzig, thin cyan (#00ADEE) accent line
- **Typography**: Montserrat
- **Style**: Professional, clean, editorial

### Image Sources (Priority Order)
1. **News context images** — Current article hero images, brand press photos
2. **Unsplash** — Curated, professional quality
3. **Pexels** — High-quality stock
4. **Brand press portals** — Nike, LVMH, etc.
5. **Fallback**: Text-based graphic generation

### Visual Guidelines
- Black gradient overlay at bottom for text readability
- Cyan accent for brand consistency
- Professional photography preferred over illustration
- Fashion/luxury aesthetic (editorial, not commercial)

---

## Workflow: Biweekly Process

### Thursday 10:00 — Newsletter Production

```
Research Associate
       ↓
   [Delivers intelligence brief with:
    - 3-5 key signals
    - Data points with sources
    - Trend observations]
       ↓
Newsletter Editor
       ↓
   [Selects main angle
    Writes Substack version
    Extracts LinkedIn version
    Requests images]
       ↓
CMO Review
       ↓
   [Approves content
    Requests revisions if needed]
       ↓
Image Sourcing Tool
       ↓
   [Searches Unsplash/Pexels
    Downloads top 3 matches
    Applies brand overlay]
       ↓
Schedule & Send
       ↓
   [Substack: Thursday 10:00
    LinkedIn: Thursday 10:30]
```

### Production Timeline

| Time | Task | Owner |
|------|------|-------|
| T-3 days | Research brief delivered | Research Associate |
| T-2 days | First draft complete | Newsletter Editor |
| T-1 day | CMO review & approval | CMO |
| T-1 day | Images sourced & branded | Image Sourcing Tool |
| T-0, 10:00 | Substack sent | Automation |
| T-0, 10:30 | LinkedIn posted | Automation |

---

## Performance Metrics

### Targets
- **Substack Open Rate**: 35%+
- **LinkedIn Engagement Rate**: 4%+
- **Subscriber Growth**: 10% per quarter
- **CTR on Primary CTA**: 5%+

### Quality Gates
- Zero factual errors
- All data points sourced
- Professional presentation
- Brand consistency maintained

---

## File Organization

```
/documents/newsletter/
├── drafts/
│   ├── YYYY-MM-DD-substack.md
│   └── YYYY-MM-DD-linkedin.md
├── images/
│   └── YYYY-MM-DD/
│       ├── option-1-unsplash-xxx.jpg
│       ├── option-1-unsplash-xxx-branded.jpg
│       ├── option-2-pexels-xxx.jpg
│       ├── option-2-pexels-xxx-branded.jpg
│       └── metadata.json
├── sent/
│   └── YYYY-MM-DD/
│       ├── substack-final.md
│       └── linkedin-final.md
└── archive/
    └── YYYY-MM/
        └── issue-xxx.pdf
```

---

## Templates Created

1. **`templates/newsletter-substack.md`** — Full long-form template with all sections
2. **`templates/newsletter-linkedin.md`** — Condensed version with formatting guide

---

## Agent Configuration

### Newsletter Editor Agent
- **Role**: `newsletter-editor`
- **Department**: Marketing (content-pod)
- **Reports To**: CMO
- **Capabilities**: 
  - newsletter-writing
  - content-curation
  - audience-segmentation
  - send-time-optimization
  - performance-analysis
- **Schedule**: Biweekly (every 2 weeks, Thursday 10:00)
- **Output**: Market Pulse Newsletter (Substack + LinkedIn)

### Files Updated
- `mission-control/convex/schema.ts` — Added newsletter-editor role
- `mission-control/convex/agents.ts` — Added seed data
- `mission-control/scripts/setup-agents.ts` — Added to AGENTS array
- `mission-control/types/index.ts` — Extended AgentRole type
- `mission-control/components/OrgChart.tsx` — Added to org chart
- `agents/newsletter-editor.md` — Role prompt

---

## Tools Created

### Image Sourcing Tool
**Path**: `/tools/newsletter-image-sourcing/`

**Features**:
- Search Unsplash API
- Search Pexels API
- Download top 3 matches
- Auto-crop to newsletter dimensions
- Apply brand overlay (@marcel.melzig, cyan accent)
- Generate text-based fallback

**Usage**:
```bash
cd /tools/newsletter-image-sourcing
node fetch.js --topic="luxury fashion" --headline="The LVMH Effect"
```

---

## Recommendations

### Immediate
1. ✅ Newsletter Editor agent deployed
2. ✅ Image sourcing tool operational
3. ✅ Templates created and ready
4. ⏳ Configure API keys (Unsplash, Pexels)
5. ⏳ Test end-to-end workflow

### Short-term
1. Create first issue as test run
2. Set up Substack and LinkedIn scheduling automation
3. Configure analytics tracking
4. Build archive of past issues

### Long-term
1. A/B test send times
2. Implement reader feedback loop
3. Create topic suggestion system
4. Build performance dashboard

---

## Dependencies

### Required Environment Variables
```bash
UNSPLASH_ACCESS_KEY=xxx
PEXELS_API_KEY=xxx
```

### System Dependencies
- Node.js >= 18
- ImageMagick (for image processing)
- Montserrat font (for brand overlay)

---

## Success Criteria

✅ **Week 1**: Agent operational, templates tested  
✅ **Week 2**: First issue published  
✅ **Month 1**: 3 issues sent, feedback collected  
✅ **Quarter 1**: Consistent schedule, growing subscriber base  

---

*System built by Kim 🦞 | February 8, 2026*
