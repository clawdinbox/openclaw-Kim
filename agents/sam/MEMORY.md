# MEMORY.md — Sam 🎨

*Design patterns, technical solutions, asset library.*

## About The Brand & Design System
- **Brand:** Market Pulse by Marcel Melzig
- **Positioning:** Professional analyst/consultant grade
- **Style:** Clean, modern, typography-driven, McKinsey-lite
- **Color System:** 3-color only — White + Black + Cyan (#00ADEE)

## Design System Reference

### Typography
- **Font Family:** Montserrat (exclusively)
  - ExtraBold: Cover titles (58pt)
  - Bold: Section titles (47pt)
  - BoldItalic: Subheadings (23pt)
  - SemiBold: Subtitles (10.5-12pt)
  - Medium: Cover subtitles (17pt)
  - Regular: Body text (12pt)
- **Display:** StarShield (covers only, 77-89pt)

### Color Palette
| Color | Hex | Usage |
|-------|-----|-------|
| White | #FFFFFF | Backgrounds, reversed text |
| Black | #000000 | Body text, some headings |
| Cyan | #00ADEE | Accents, highlights, CTAs |
| Deep Blue | #0B1D33 | Header bars, dark elements |
| Gradients | #00ADEE → #0088CC | Covers, accents |

### Layout Standards
- **Format:** A4 (595×842pt)
- **Cover:** Blue gradient, stacked titles, highlight bars, centered
- **Interior:** White background, dark header bar, page numbers top-left
- **Titles:** Black + Cyan split (e.g., "SPORTSWEAR / INTELLIGENCE")
- **Margins:** Generous (~20% of page)

## Current Projects & Assets

### 1. Sportswear Intelligence Report (COMPLETE)
- **File:** `sportswear-intelligence-q1-2026-FINAL.pdf`
- **Size:** 1.0 MB, 8 pages
- **Specs:**
  - Cover: Cyan gradient + split titles
  - Pages 2-7: White + dark header + split titles
  - Page 8: CTA with product boxes (white, not dark)
  - Fonts: Montserrat throughout
  - Colors: #00ADEE cyan, white, black

### 2. Thumbnails Generated
- **Cover-Gumroad:** 1200×800px (277 KB)
- **LinkedIn:** 1200×627px (151 KB)
- **Square:** 1080×1080px (142 KB)

### 3. Reference Ebooks (Existing Style)
- Fashion Brand Clarity Guide (24pp)
- Luxury Resale Market Guide (16pp)
- Location: `documents/reference-ebooks/`

## Technical Stack
- **PDF Engine:** Puppeteer + HTML/CSS
- **Node Script:** Custom generation
- **Output:** A4 PDF, print-ready
- **Thumbnails:** Puppeteer screenshot from HTML

## Template Library
| Asset | Location | Use Case |
|-------|----------|----------|
| Ebook Cover | `templates/ebook-cover.html` | All ebook covers |
| Interior Page | `templates/interior-page.html` | Content pages |
| CTA Page | `templates/cta-page.html` | Final pages |
| Thumbnail Gen | `tools/thumbnails.html` | Social thumbnails |

## CI Violations to Avoid
❌ Non-Montserrat fonts
❌ Colors outside White/Black/Cyan
❌ Cluttered layouts
❌ Missing page numbers
❌ Inconsistent title styling

## File Naming Convention
- `{project-name}-{version}.pdf`
- `{project-name}-v{number}.{ext}`
- Thumbnails: `{type}-{dimensions}.png`

## Recent Technical Solutions
- PDF page breaks: `page-break-after: always`
- Puppeteer margins: `{ top: 0, right: 0, bottom: 0, left: 0 }`
- Clickable links: Use `<a href>` not `<div>`

## Team Coordination
- Marie provides content → Sam designs
- Alex provides research → Sam visualizes
- All PDFs must pass CI checklist before delivery
