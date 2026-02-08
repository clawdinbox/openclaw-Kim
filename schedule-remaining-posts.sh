#!/bin/bash
# Batch schedule remaining posts for Feb 12-14 with delays to avoid rate limiting

cd /Users/clawdmm/.openclaw/workspace
export $(cat .env.postiz | xargs)

echo "=== Scheduling remaining posts ==="

# Thursday Feb 12 remaining posts
echo "Scheduling Thu 2/12 13:30 Threads..."
node tools/posting-automation/smart-poster.js --platform threads --time 13:30 --date 2026-02-12 --content "Remember when a Travis Scott drop meant camp-outs and $1000 resale premiums? Recent releases moved barely $20M on secondary markets—down from $200M+ at peak.

Collab fatigue is real. Consumer attention fragments. And when resale profits disappear, so does the hype machine that sustained the model.

What's the next mechanism for creating demand?"
sleep 5

echo "Scheduling Thu 2/12 16:00 X..."
node tools/posting-automation/smart-poster.js --platform x --time 16:00 --date 2026-02-12 --content "Travis Scott releases generated $200M+ in resale value at peak. Recent drops? Under $20M. Consumer attention isn't just fragmented—it's fatigued. The collaboration model is hitting diminishing returns."
sleep 5

echo "Scheduling Thu 2/12 18:30 Threads..."
node tools/posting-automation/smart-poster.js --platform threads --time 18:30 --date 2026-02-12 --content "The sneaker resale market is consolidating. GOAT merged operations. StockX diversified into electronics. eBay shut down its authentication guarantee for most sneakers.

When margins compress, platforms pivot or perish. The question is whether this is a correction or the end of sneaker investing as an asset class.

What happens to brand strategy if resale becomes irrelevant?"
sleep 5

# Friday Feb 13 posts
echo "Scheduling Fri 2/13 08:30 Threads..."
node tools/posting-automation/smart-poster.js --platform threads --time 08:30 --date 2026-02-13 --content "Fashion Week shows run $500K to $2M for emerging labels. Coverage-to-sales attribution? Often negative ROI.

Heritage houses can absorb it as brand maintenance. For smaller brands, it's a bet on press coverage converting to wholesale orders—and that's a longer, leakier funnel than ever.

Is the traditional show model still viable for anyone below $100M revenue?"
sleep 5

echo "Scheduling Fri 2/13 09:00 X..."
node tools/posting-automation/smart-poster.js --platform x --time 09:00 --date 2026-02-13 --content "A single Fashion Week show costs $500K-$2M for emerging brands. Direct-to-consumer sales attributed to show coverage? Often under $100K. The math works for heritage houses. For disruptors, it's brand theater without business impact."
sleep 5

echo "Scheduling Fri 2/13 11:00 X..."
node tools/posting-automation/smart-poster.js --platform x --time 11:00 --date 2026-02-13 --content "Vogue Runway app traffic during NYFW: down 34% since 2019. TikTok Fashion Week content: up 400% in same period. Editorial authority is fragmenting. Distribution is democratizing. Gatekeeping is dying."
sleep 5

echo "Scheduling Fri 2/13 13:30 Threads..."
node tools/posting-automation/smart-poster.js --platform threads --time 13:30 --date 2026-02-13 --content "Vogue Runway app traffic during fashion weeks: down 34% since 2019. TikTok fashion content during same periods: up 400%.

Editorial gatekeepers still matter for credibility. But they no longer control distribution. A 19-year-old creator in Jakarta can reach more qualified buyers than a front-row review in a legacy publication.

Where's your attention budget going?"
sleep 5

echo "Scheduling Fri 2/13 16:00 X..."
node tools/posting-automation/smart-poster.js --platform x --time 16:00 --date 2026-02-13 --content "Burberry abandoned see-now-buy-now in 2019. Tom Ford followed. The model created inventory risk without clear sales lift. Fashion Week isn't broken. The expectation that it should drive immediate commerce was wrong."
sleep 5

echo "Scheduling Fri 2/13 18:30 Threads..."
node tools/posting-automation/smart-poster.js --platform threads --time 18:30 --date 2026-02-13 --content "See-now-buy-now failed. Burberry killed it in 2019. Tom Ford followed. The model assumed consumers wanted immediate purchase—they wanted immediate *context*.

Fashion Week's value isn't transactions. It's narrative control, B2B relationship maintenance, and cultural positioning.

Are we measuring the wrong outcomes?"
sleep 5

# Saturday Feb 14 posts
echo "Scheduling Sat 2/14 08:30 Threads..."
node tools/posting-automation/smart-poster.js --platform threads --time 08:30 --date 2026-02-14 --content "Week recap:
• AI's real value is operational, not creative
• Resale platforms now own customer relationships
• China rewards proximity over heritage
• Sneaker scarcity economics are collapsing
• Fashion Week influence is fragmenting

Common thread? Execution beats narrative. The brands winning aren't the loudest—they're the most operationally precise.

What landed hardest for you this week?"
sleep 5

echo "Scheduling Sat 2/14 09:00 X..."
node tools/posting-automation/smart-poster.js --platform x --time 09:00 --date 2026-02-14 --content "This week's theme: Operational excellence beats narrative. Zara's logistics > their AI headlines. Resale platforms > brand DTC. Chinese proximity > European heritage. The winners execute quietly while others chase press."
sleep 5

echo "Scheduling Sat 2/14 11:00 X..."
node tools/posting-automation/smart-poster.js --platform x --time 11:00 --date 2026-02-14 --content "Next week: Supply chain regionalization, the death of wholesale as we knew it, and why direct retail economics are brutal but necessary. If this week was about operations, next week is about distribution architecture."
sleep 5

echo "Scheduling Sat 2/14 13:30 Threads..."
node tools/posting-automation/smart-poster.js --platform threads --time 13:30 --date 2026-02-14 --content "Coming next week:
• Supply chain regionalization—friend-shoring vs efficiency
• Wholesale isn't dead but it's being reinvented
• Direct retail economics: why DTC is harder than the 2010s made it look

If this week was about market dynamics, next week is about infrastructure choices.

Any specific angles you want covered?"
sleep 5

echo "Scheduling Sat 2/14 16:00 X..."
node tools/posting-automation/smart-poster.js --platform x --time 16:00 --date 2026-02-14 --content "Best question from this week's replies: \"When does brand heritage become baggage?\" Answer: When it prevents you from moving at market speed. Heritage is leverage until it's anchor. Discerning the difference is the core skill."
sleep 5

echo "Scheduling Sat 2/14 18:30 Threads..."
node tools/posting-automation/smart-poster.js --platform threads --time 18:30 --date 2026-02-14 --content "Best insight from this week's thread discussions: \"Brand heritage becomes baggage when it prevents market speed.\"

That's the whole game now. Assets vs constraints. Leverage vs anchor. The brands navigating this transition fastest are winning regardless of size.

What operational constraint are you fighting that used to be an asset?"

echo "=== All remaining posts scheduled ==="
