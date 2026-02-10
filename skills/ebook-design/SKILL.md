# ebook-design

Design standards for Market Pulse Pro ebooks — typography, colors, layout rules, and cover design.

---

## Metadata

| Key | Value |
|-----|-------|
| `emoji` | 📖 |
| `requires` | nano-pdf, puppeteer |

---

## Usage

```bash
# Get design specs
clawdbot ebook-design specs

# Get font guidelines
clawdbot ebook-design fonts

# Get color palette
clawdbot ebook-design colors

# Get cover rules
clawdbot ebook-design cover

# Get interior layout rules
clawdbot ebook-design layout
```

---

## Design Philosophy

Clean, modern, consultant/analyst positioning. Typography-driven. No emoji/clipart. Professional premium feel.

---

## Typography

### Font Families

| Use | Font | Weight |
|-----|------|--------|
| Body text | Montserrat | Regular, Medium |
| Subheads | Montserrat | SemiBold |
| Headers | Montserrat | Bold, ExtraBold |
| Italic emphasis | Montserrat | BoldItalic |
| Cover display | StarShield | Display |

### Available Weights
- ExtraBold
- Bold
- BoldItalic
- SemiBold
- Medium
- Regular

---

## Color Palette (3-Color System)

| Color | Hex | Usage |
|-------|-----|-------|
| White | #FFFFFF | Background, text on dark |
| Black | #000000 | Primary text, headers |
| Cyan | #00ADEE | Accents, highlights, CTAs |

**Rules:**
- Never use more than these 3 colors
- Cyan for all accents and highlights
- White background for interior pages
- Dark backgrounds only for final CTA page

---

## Format Specifications

| Spec | Value |
|------|-------|
| Size | A4 (595×842pt) |
| Orientation | Portrait |
| Margins | Minimal, modern |
| Columns | Single, left-aligned |

---

## Cover Design

### Elements

1. **Background**
   - Blue gradient background
   - Optional: background image (subtle, desaturated)

2. **Title**
   - Large display typography
   - Highlight bars on key words (cyan #00ADEE)
   - StarShield font for main title

3. **Author Photo**
   - Circular crop
   - Professional headshot
   - Positioned strategically

4. **Handle/Brand**
   - @marcel.melzig
   - Cyan accent

### Cover Checklist
- [ ] Blue gradient background
- [ ] Title with highlight bars on keywords
- [ ] Circular author photo
- [ ] Clean, uncluttered composition
- [ ] 3-color palette only

---

## Interior Layout

### Page Structure

| Element | Spec |
|---------|------|
| Background | White |
| Header | Dark bar across top |
| Page number | Top-left (02, 03...) |
| Title treatment | Large, stacked (black + cyan split) |
| Body | Left-aligned, single column |
| Final page | Full dark background CTA |

### Typography Hierarchy

1. **Page Title**
   - Large stacked treatment
   - Black + cyan color split
   - Left-aligned

2. **Section Headers**
   - Montserrat Bold
   - Black

3. **Body Text**
   - Montserrat Regular/Medium
   - Black on white
   - Generous line spacing

4. **Callouts/Highlights**
   - Cyan accents
   - Bold or highlight bars

### Final Page (CTA)
- Full dark background
- LinkedIn/contact information
- Clean, minimal design
- Cyan accents

---

## PDF Generation Notes

**DO:**
- Use embedded header divs inside each page div
- Zero-margin puppeteer config
- v4 HTML as golden base
- Measure scrollHeight per page div (1123px = one page)
- Split overflow content across pages

**DO NOT:**
- Use puppeteer `displayHeaderFooter` — causes overlapping content, blank gaps, cut titles

---

## Reference Materials

| File | Location |
|------|----------|
| Design Style Guide | `documents/reference-ebooks/DESIGN-STYLE-GUIDE.md` |
| Example 1 (Fashion Brand) | `documents/reference-ebooks/ebook-1.pdf` (24pp) |
| Example 2 (Luxury Resale) | `documents/reference-ebooks/ebook-2-luxury-resale-guide.pdf` (16pp) |

---

## Examples

**Create new ebook:**
```
1. Copy v4 HTML template as base
2. Apply 3-color palette (white/black/cyan)
3. Set typography: Montserrat family
4. Design cover: gradient + highlight bars + circular photo
5. Build interior pages with dark header bar + page numbers
6. Add stacked title treatment (black + cyan split)
7. Final page: full dark background CTA
8. Generate PDF with puppeteer (zero margins, embedded headers)
```

**Format page layout:**
```
- White background
- Dark header bar at top
- Page number top-left (02, 03...)
- Large stacked title (black + cyan)
- Left-aligned single column body
- No emojis, no clipart
- Clean, professional spacing
```

---

## Product Ladder

| Tier | Price | Format |
|------|-------|--------|
| Free lead magnet | Free | 3-5 page excerpt |
| Guides | €7-19 | Full ebook (16-24pp) |
| Reports | €29-49 | Extended analysis |
| Consulting bridges | €99-199 | Premium with call |

**Store:** https://marcelmelzig.gumroad.com/ — "Market Pulse Pro"
