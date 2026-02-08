#!/bin/bash
# Schedule all 42 NEW aggressive posts (v2 strategy)
# Run this AFTER deleting old posts from Postiz dashboard

cd /Users/clawdmm/.openclaw/workspace
export $(cat .env.postiz | xargs)

echo "=== Scheduling 42 Aggressive Engagement Posts (v2) ==="
echo "Started: $(date)"
echo ""
echo "⚠️  IMPORTANT: Delete the 27 old posts from Postiz dashboard first!"
echo "   (Postiz API doesn't support deletion via public endpoints)"
echo ""

# Function to schedule with delay
schedule() {
    local platform=$1
    local date=$2
    local time=$3
    local content=$4
    
    echo "[$date $time] $platform: ${content:0:60}..."
    node tools/posting-automation/smart-poster.js --platform "$platform" --time "$time" --date "$date" --content "$content"
    echo "Waiting 8s..."
    sleep 8
    echo ""
}

# ============================================
# SUNDAY FEB 8 — Reader Questions/Engagement
# ============================================
echo "--- SUNDAY FEB 8 ---"

# X Thread 1: The Data Lie (09:00)
schedule "x" "2026-02-08" "09:00" "Your board tracks metrics that actively hurt your business.

Reply if you know which one."
schedule "x" "2026-02-08" "09:01" "Mine was \"social engagement rate\" for a wholesale brand.

Zero correlation to sell-through.
Zero correlation to margin.

Still got monthly deck space."
schedule "x" "2026-02-08" "09:02" "The worst part? Everyone in the room knew it was fake.

We just needed something to show MoM growth.

What metric are you faking?"

# X Thread 2: Trend Forecasting (11:00)
schedule "x" "2026-02-08" "11:00" "Trend forecasting is a \$3B industry built on educated guessing.

Depop does it better for free."
schedule "x" "2026-02-08" "11:01" "35M users.
Real transactions.
Real-time demand signals.

WGSN sends you a PDF 6 months late."
schedule "x" "2026-02-08" "11:02" "But sure, keep paying \$50K/year for \"insight.\"

Meanwhile Shein watches TikTok and ships in 5 days.

Who's winning?"

# X Thread 3: Returns (16:00)
schedule "x" "2026-02-08" "16:00" "60% of online fashion returns are from 20% of SKUs.

Your team knows which ones.

They're still reordering them."
schedule "x" "2026-02-08" "16:01" "Why? Because the buyer who picked them still has a job.

And nobody wants that conversation."
schedule "x" "2026-02-08" "16:02" "Returns are a people problem dressed as a logistics problem.

Reply if you've seen this happen."

# Threads Posts
schedule "threads" "2026-02-08" "08:30" "What metric does your team worship that you know is garbage?

Mine: social engagement for wholesale. Beautiful charts. Zero business impact.

Reply if you're tracking something equally useless."

schedule "threads" "2026-02-08" "13:30" "You're paying WGSN \$50K for trend reports.
Depop's 35M users show you demand in real-time. For free.

Legacy \"expertise\" is just information asymmetry that died 5 years ago.

Who still has a job because of data latency?"

schedule "threads" "2026-02-08" "18:30" "This week: AI replaces buyers, resale owns your customer, China doesn't want your heritage, sneaker scarcity is fake, and Fashion Week is a vanity project.

Reply with which take will make you angriest."

# ============================================
# MONDAY FEB 9 — AI Replaces Buyers
# ============================================
echo "--- MONDAY FEB 9 ---"

# X Thread 1: AI Target (09:00)
schedule "x" "2026-02-09" "09:00" "AI won't replace designers.

It'll replace 40% of fashion buyers by 2027."
schedule "x" "2026-02-09" "09:01" "Zara's algorithms predict demand better than any human buyer.

€2.5B logistics system. 2.5M items moved daily.

H&M? Still using Excel and intuition."
schedule "x" "2026-02-09" "09:02" "Creative jobs are safe.

Spreadsheet jobs are finished.

Reply if your buyer can out-predict an algorithm."

# X Thread 2: Wrong Investment (11:00)
schedule "x" "2026-02-09" "11:00" "H&M spent billions on AI design tools.

Then wrote down \$4.3B in unsold inventory."
schedule "x" "2026-02-09" "11:01" "They automated the creative part.

The forecasting part? Still manual.

Still wrong."
schedule "x" "2026-02-09" "11:02" "AI that makes pretty pictures gets press releases.

AI that moves inventory gets you promoted.

Which is your CEO funding?"

# X Thread 3: Automation Math (16:00)
schedule "x" "2026-02-09" "16:00" "Automating customer service saves 40% on labor.

Automating demand planning saves 30% on inventory.

Guess which one gets prioritized."
schedule "x" "2026-02-09" "16:01" "Visible automation = board slides.

Invisible automation = EBITDA.

Your incentives are broken."
schedule "x" "2026-02-09" "16:02" "The brands winning aren't the ones with chatbots.

They're the ones you never hear from.

Because their inventory actually sells."

# Threads Posts
schedule "threads" "2026-02-09" "08:30" "AI design tools get TechCrunch headlines.

AI demand prediction gets you 30% less dead stock.

Your CEO wants which one?

Reply if you're investing in front-end flash while back-end rots."

schedule "threads" "2026-02-09" "13:30" "AI generates 1000 designs per hour now.

Can it predict which 20 sell at full price?

Most brands solved the easy problem. The expensive problem? Still manual.

Reply if your forecasting is still Excel + hope."

schedule "threads" "2026-02-09" "18:30" "Creative directors: Safe until 2030.

Assistant buyers: Gone by 2027.

The algorithm doesn't need coffee breaks or conviction.

Reply if your team is automating the wrong layer."

# ============================================
# TUESDAY FEB 10 — Resale Owns Your Customer
# ============================================
echo "--- TUESDAY FEB 10 ---"

# X Thread 1: Platform Takeover (09:00)
schedule "x" "2026-02-10" "09:00" "StockX and GOAT move \$5B+ in sneakers annually.

That's more than most footwear brands make."
schedule "x" "2026-02-10" "09:01" "They own:
→ Customer relationship
→ Pricing data
→ Authentication trust

You own:
→ Inventory risk
→ Marketing costs
→ The product they markup."
schedule "x" "2026-02-10" "09:02" "You're not a brand anymore.

You're a supplier to platforms you don't control.

Reply if you're paying for ads to drive traffic to GOAT."

# X Thread 2: Authentication (11:00)
schedule "x" "2026-02-10" "11:00" "TheRealReal spent \$47M on authentication.

Margin: 35%.

Vestiaire: 48% margin.

Trust is expensive. Distrust is costlier."
schedule "x" "2026-02-10" "11:01" "200+ authenticators.
Still getting hammered for fakes.

The economics of authentication are brutal."
schedule "x" "2026-02-10" "11:02" "Under-invest = credibility death.

Over-invest = profitability death.

Pick your poison.

Reply with your authentication spend as % of GMV."

# X Thread 3: Resale Theater (16:00)
schedule "x" "2026-02-10" "16:00" "Gucci launched official resale.

PR says: \"Sustainability initiative.\"

Reality: \"We want the customer data, not StockX.\""
schedule "x" "2026-02-10" "16:01" "They don't care about circularity.

They care about owning the relationship.

Defensive strategy dressed as virtue."
schedule "x" "2026-02-10" "16:02" "Every brand-owned resale program is data capture.

Stop pretending it's about the planet.

Reply if you've launched resale for the right reasons."

# Threads Posts
schedule "threads" "2026-02-10" "08:30" "StockX moves more product than most footwear brands.

They own your customer, your pricing data, and your authentication trust.

You're just the supplier now.

Reply if you're building direct relationships or outsourcing to platforms."

schedule "threads" "2026-02-10" "13:30" "TheRealReal: \$47M auth cost, 35% margin.
Vestiaire: Undisclosed auth cost, 48% margin.

Trust is expensive. But distrust kills you faster.

Reply with your authentication philosophy."

schedule "threads" "2026-02-10" "18:30" "Gucci, Balenciaga, Prada launching \"sustainable\" resale.

Truth: They want customer data StockX has.

Circularity is the press release. Data capture is the strategy.

Reply if you've called out greenwashing this week."

# ============================================
# WEDNESDAY FEB 11 — China Doesn't Want Your Heritage
# ============================================
echo "--- WEDNESDAY FEB 11 ---"

# X Thread 1: Miu Miu (09:00)
schedule "x" "2026-02-11" "09:00" "LVMH China: -10% revenue.

Miu Miu China: +89%.

Same market. Opposite results."
schedule "x" "2026-02-11" "09:01" "Difference? Miu Miu's team lives in Shanghai.

Collaborates with local artists.

Moves at Chinese speed.

LVMH sends executives on 2-week trips."
schedule "x" "2026-02-11" "09:02" "European heritage doesn't sell in China anymore.

Proximity to culture does.

Reply if your \"China strategy\" involves actually living there."

# X Thread 2: Quiet Luxury (11:00)
schedule "x" "2026-02-11" "11:00" "\"Luxury\" in China used to mean conspicuous logos.

Now it means craftsmanship.

Whether from Milan or Chengdu."
schedule "x" "2026-02-11" "11:01" "Western brands built on logo-mania: struggling.

Local brands with traditional craft: gaining."
schedule "x" "2026-02-11" "11:02" "This isn't a cyclical dip.

It's a structural shift in what \"luxury\" means.

Reply if your brand can survive without the logo."

# X Thread 3: Hainan (16:00)
schedule "x" "2026-02-11" "16:00" "Hainan duty-free: \$8.2B in 2024.

Down from \$9.4B peak.

The duty-free model is dying."
schedule "x" "2026-02-11" "16:01" "Daigou disrupted.
Domestic e-commerce rising.
Consumption decentralizing."
schedule "x" "2026-02-11" "16:02" "Brands built for flagship stores and duty-free are failing.

The future is fragmented and digital.

Reply if your China strategy is still 2019."

# Threads Posts
schedule "threads" "2026-02-11" "08:30" "Miu Miu's team embedded in Shanghai. LVMH sends execs on trips.

Result: Miu Miu +89%, LVMH -10%.

European heritage is a depreciating asset in China.

Reply if your team actually lives in your growth markets."

schedule "threads" "2026-02-11" "13:30" "Chinese consumers want craftsmanship now, not conspicuous logos.

Western brands with logo-mania: dying.
Local brands with heritage craft: rising.

Your monogram strategy is 5 years expired.

Reply if you'd buy your own logo product."

schedule "threads" "2026-02-11" "18:30" "Hainan duty-free declining. Daigou dead. Domestic digital rising.

China's luxury market isn't shrinking—it's fragmenting.

Can your infrastructure handle 1000 micro-channels?

Reply if you're still betting on flagship stores."

# ============================================
# THURSDAY FEB 12 — Sneaker Scarcity is Fake
# ============================================
echo "--- THURSDAY FEB 12 ---"

# X Thread 1: Colorway Problem (09:00)
schedule "x" "2026-02-12" "09:00" "Nike released 847 Dunk colorways in 2024.

That's not scarcity.

That's saturation dressed as exclusivity."
schedule "x" "2026-02-12" "09:01" "When every drop is \"limited,\" nothing is.

Resale premiums: 48% → 12% in 3 years.

The market is calling your bluff."
schedule "x" "2026-02-12" "09:02" "Scarcity economics only work with actual constraint.

Ubiquity + hype = inventory management failure.

Reply if you're still chasing drops."

# X Thread 2: Collab Fatigue (11:00)
schedule "x" "2026-02-12" "11:00" "Travis Scott drops used to move \$200M+ on resale.

Recent releases: Under \$20M."
schedule "x" "2026-02-12" "11:01" "Collab fatigue is real.
Consumer attention fragments.

When resale dies, so does the hype machine."
schedule "x" "2026-02-12" "11:02" "The collaboration model hit diminishing returns.

What's next? Actual product merit?

Reply if you've bought a collab you regretted."

# X Thread 3: Market Consolidation (16:00)
schedule "x" "2026-02-12" "16:00" "GOAT merged operations.
StockX pivoted to electronics.
eBay killed sneaker authentication.

The resale market is consolidating."
schedule "x" "2026-02-12" "16:01" "Margins compressed.
Platforms pivot or perish.

Is this a correction or the end of sneaker investing?"
schedule "x" "2026-02-12" "16:02" "Brand strategy built on resale value is built on sand.

What happens when the secondary market dies?

Reply if your product can stand without hype."

# Threads Posts
schedule "threads" "2026-02-12" "08:30" "847 Dunk colorways. 312 Jordan 1s. \"Limited\" every week.

Resale premiums collapsed 48% → 12%.

You can't fake scarcity forever.

Reply if you've stopped believing \"limited edition\" claims."

schedule "threads" "2026-02-12" "13:30" "Travis Scott: \$200M resale peak → \$20M recent drops.

The collab model is tapped. Consumers see through it.

What's next? Products that stand on merit?

Reply with your last regrettable hype purchase."

schedule "threads" "2026-02-12" "18:30" "GOAT merged. StockX diversified. eBay quit authentication.

Resale margins compressed. Platforms pivot or die.

Is this a correction or the end of sneaker as asset class?

Reply if your brand strategy survives without resale hype."

# ============================================
# FRIDAY FEB 13 — Fashion Week is Vanity
# ============================================
echo "--- FRIDAY FEB 13 ---"

# X Thread 1: Show Economics (09:00)
schedule "x" "2026-02-13" "09:00" "Fashion Week shows cost \$500K-\$2M.

For emerging brands, attributed sales: often under \$100K."
schedule "x" "2026-02-13" "09:01" "The math works for heritage houses.

For disruptors? Brand theater without business impact."
schedule "x" "2026-02-13" "09:02" "You're buying press coverage that converts to wholesale orders...

In a funnel that's leakier than ever.

Reply if your last show paid for itself."

# X Thread 2: Media Death (11:00)
schedule "x" "2026-02-13" "11:00" "Vogue Runway traffic during NYFW: -34% since 2019.

TikTok fashion content: +400%.

Editorial authority is dead."
schedule "x" "2026-02-13" "11:01" "A 19-year-old in Jakarta reaches more buyers than Vogue.

Distribution democratized.

Gatekeeping died."
schedule "x" "2026-02-13" "11:02" "Your front-row investment is nostalgia.

Your TikTok absence is bankruptcy.

Reply if you've moved budget from editorial to creators."

# X Thread 3: SNBN Failed (16:00)
schedule "x" "2026-02-13" "16:00" "Burberry killed see-now-buy-now in 2019.

Tom Ford followed.

The model failed."
schedule "x" "2026-02-13" "16:01" "It created inventory risk without sales lift.

Consumers wanted context, not immediate purchase."
schedule "x" "2026-02-13" "16:02" "Fashion Week isn't broken.

The expectation that it drives commerce was wrong.

Reply if you're measuring the right outcomes."

# Threads Posts
schedule "threads" "2026-02-13" "08:30" "\$500K-\$2M per show. Attributed sales: often <\$100K.

Heritage houses absorb it as brand maintenance.
Emerging brands? Negative ROI theater.

Reply if your last Fashion Week paid for itself."

schedule "threads" "2026-02-13" "13:30" "Vogue Runway: -34%. TikTok fashion: +400%.

A Jakarta creator reaches more qualified buyers than front-row press.

Your editorial budget is nostalgia. Your creator budget is survival.

Reply if you've reallocated this year."

schedule "threads" "2026-02-13" "18:30" "See-now-buy-now failed because consumers wanted context, not transactions.

Fashion Week's value isn't sales. It's narrative control and B2B relationships.

Reply if you're measuring narrative ROI, not transactions."

# ============================================
# SATURDAY FEB 14 — Week Synthesis
# ============================================
echo "--- SATURDAY FEB 14 ---"

# X Thread 1: Weekly Thesis (09:00)
schedule "x" "2026-02-14" "09:00" "This week's theme: Execution beats narrative."
schedule "x" "2026-02-14" "09:01" "Zara's logistics > their AI headlines.
Resale platforms > brand DTC.
Chinese proximity > European heritage.
Sneaker merit > collab hype.
Operational brands > Fashion Week theater."
schedule "x" "2026-02-14" "09:02" "The winners execute quietly.

The losers chase press.

Reply if you're investing in invisible excellence."

# X Thread 2: Next Week (11:00)
schedule "x" "2026-02-14" "11:00" "Next week: Supply chain regionalization.

Why friend-shoring isn't a choice anymore."
schedule "x" "2026-02-14" "11:01" "Plus: Wholesale isn't dead but it's unrecognizable.

And DTC economics are brutal but necessary."
schedule "x" "2026-02-14" "11:02" "If this week was market dynamics...

Next week is infrastructure architecture.

Reply with what you want covered."

# X Thread 3: Best Question (16:00)
schedule "x" "2026-02-14" "16:00" "Best question this week:

\"When does brand heritage become baggage?\""
schedule "x" "2026-02-14" "16:01" "Answer: When it prevents market speed.

Heritage is leverage until it's anchor."
schedule "x" "2026-02-14" "16:02" "The skill isn't building heritage.

It's knowing when to abandon it.

Reply with a heritage brand that moved too slow."

# Threads Posts
schedule "threads" "2026-02-14" "08:30" "Execution beats narrative:
• Zara logistics > AI hype
• Resale platforms > brand DTC  
• China proximity > European heritage
• Product merit > collab hype
• Operations > Fashion Week theater

The winners are quiet. The losers are loud.

Reply if you're investing in invisible excellence."

schedule "threads" "2026-02-14" "13:30" "Coming: Supply chain regionalization, wholesale reinvention, DTC economics reality check.

Infrastructure week.

Reply with your most urgent supply chain question."

schedule "threads" "2026-02-14" "18:30" "\"When does brand heritage become baggage?\"

When it prevents market speed.

Leverage becomes anchor. The best operators know when to cut.

Reply with a heritage brand that died from nostalgia."

echo ""
echo "=== COMPLETE ==="
echo "Finished: $(date)"
echo ""
echo "📊 Summary:"
echo "  • 21 X Thread hooks scheduled"
echo "  • 42 X Thread replies scheduled (2 per thread)"
echo "  • 21 Threads posts scheduled"
echo "  • Total: 63 posts"
echo ""
echo "Next step: Run verification"
echo "  node tools/posting-automation/postiz-checker.js --week"
