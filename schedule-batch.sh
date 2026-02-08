#!/bin/bash
# Schedule remaining posts with 15-second delays between requests

cd /Users/clawdmm/.openclaw/workspace
export $(cat .env.postiz | xargs)

echo "=== Scheduling remaining 15 posts ==="
echo "Starting at $(date)"

# Thursday Feb 12 remaining posts (3 posts)
posts=(
  "threads|2026-02-12|13:30|Remember when a Travis Scott drop meant camp-outs and $1000 resale premiums? Recent releases moved barely $20M on secondary markets—down from $200M+ at peak.

Collab fatigue is real. Consumer attention fragments. And when resale profits disappear, so does the hype machine that sustained the model.

What's the next mechanism for creating demand?"
  "x|2026-02-12|16:00|Travis Scott releases generated $200M+ in resale value at peak. Recent drops? Under $20M. Consumer attention isn't just fragmented—it's fatigued. The collaboration model is hitting diminishing returns."
  "threads|2026-02-12|18:30|The sneaker resale market is consolidating. GOAT merged operations. StockX diversified into electronics. eBay shut down its authentication guarantee for most sneakers.

When margins compress, platforms pivot or perish. The question is whether this is a correction or the end of sneaker investing as an asset class.

What happens to brand strategy if resale becomes irrelevant?"
  # Friday Feb 13 posts (6 posts)
  "threads|2026-02-13|08:30|Fashion Week shows run $500K to $2M for emerging labels. Coverage-to-sales attribution? Often negative ROI.

Heritage houses can absorb it as brand maintenance. For smaller brands, it's a bet on press coverage converting to wholesale orders—and that's a longer, leakier funnel than ever.

Is the traditional show model still viable for anyone below $100M revenue?"
  "x|2026-02-13|09:00|A single Fashion Week show costs $500K-$2M for emerging brands. Direct-to-consumer sales attributed to show coverage? Often under $100K. The math works for heritage houses. For disruptors, it's brand theater without business impact."
  "x|2026-02-13|11:00|Vogue Runway app traffic during NYFW: down 34% since 2019. TikTok Fashion Week content: up 400% in same period. Editorial authority is fragmenting. Distribution is democratizing. Gatekeeping is dying."
  "threads|2026-02-13|13:30|Vogue Runway app traffic during fashion weeks: down 34% since 2019. TikTok fashion content during same periods: up 400%.

Editorial gatekeepers still matter for credibility. But they no longer control distribution. A 19-year-old creator in Jakarta can reach more qualified buyers than a front-row review in a legacy publication.

Where's your attention budget going?"
  "x|2026-02-13|16:00|Burberry abandoned see-now-buy-now in 2019. Tom Ford followed. The model created inventory risk without clear sales lift. Fashion Week isn't broken. The expectation that it should drive immediate commerce was wrong."
  "threads|2026-02-13|18:30|See-now-buy-now failed. Burberry killed it in 2019. Tom Ford followed. The model assumed consumers wanted immediate purchase—they wanted immediate *context*.

Fashion Week's value isn't transactions. It's narrative control, B2B relationship maintenance, and cultural positioning.

Are we measuring the wrong outcomes?"
  # Saturday Feb 14 posts (6 posts)
  "threads|2026-02-14|08:30|Week recap:
• AI's real value is operational, not creative
• Resale platforms now own customer relationships
• China rewards proximity over heritage
• Sneaker scarcity economics are collapsing
• Fashion Week influence is fragmenting

Common thread? Execution beats narrative. The brands winning aren't the loudest—they're the most operationally precise.

What landed hardest for you this week?"
  "x|2026-02-14|09:00|This week's theme: Operational excellence beats narrative. Zara's logistics > their AI headlines. Resale platforms > brand DTC. Chinese proximity > European heritage. The winners execute quietly while others chase press."
  "x|2026-02-14|11:00|Next week: Supply chain regionalization, the death of wholesale as we knew it, and why direct retail economics are brutal but necessary. If this week was about operations, next week is about distribution architecture."
  "threads|2026-02-14|13:30|Coming next week:
• Supply chain regionalization—friend-shoring vs efficiency
• Wholesale isn't dead but it's being reinvented
• Direct retail economics: why DTC is harder than the 2010s made it look

If this week was about market dynamics, next week is about infrastructure choices.

Any specific angles you want covered?"
  "x|2026-02-14|16:00|Best question from this week's replies: \"When does brand heritage become baggage?\" Answer: When it prevents you from moving at market speed. Heritage is leverage until it's anchor. Discerning the difference is the core skill."
  "threads|2026-02-14|18:30|Best insight from this week's thread discussions: \"Brand heritage becomes baggage when it prevents market speed.\"

That's the whole game now. Assets vs constraints. Leverage vs anchor. The brands navigating this transition fastest are winning regardless of size.

What operational constraint are you fighting that used to be an asset?"
)

success=0
failed=0

for post in "${posts[@]}"; do
  IFS='|' read -r platform date time content <<< "$post"
  echo ""
  echo "[$success/$failed] Scheduling $platform at $date $time..."
  
  node tools/posting-automation/smart-poster.js --platform "$platform" --time "$time" --date "$date" --content "$content"
  
  if [ $? -eq 0 ]; then
    ((success++))
    echo "✓ Success"
  else
    ((failed++))
    echo "✗ Failed"
  fi
  
  echo "Waiting 15 seconds..."
  sleep 15
done

echo ""
echo "=== Complete ==="
echo "Success: $success"
echo "Failed: $failed"
echo "Finished at $(date)"
