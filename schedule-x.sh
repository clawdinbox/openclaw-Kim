#!/bin/bash
# Schedule Feb 9-15 content to Postiz

API_KEY="75453381e58be37ec19683c7c921e91bd7d3cc0adfbcc609e881c861e20e5437"
X_ID="cmlb9q3bs007oom0y8lg6tr8k"
THREADS_ID="cmlbamgkt008som0y7z6sl86w"
IG_ID="cmlbfgpqi00jdom0y14555fls"

BASE_URL="https://api.postiz.com/public/v1"

# Function to schedule a post
schedule_post() {
    local date_str=$1
    local platform=$2
    local integration_id=$3
    local content=$4
    
    curl -s -X POST "$BASE_URL/posts" \
        -H "Authorization: $API_KEY" \
        -H "Content-Type: application/json" \
        -d "{
            \"type\": \"schedule\",
            \"date\": \"$date_str\",
            \"shortLink\": false,
            \"tags\": [\"feb9-15\", \"auto-scheduled\"],
            \"posts\": [{
                \"integration\": {\"id\": \"$integration_id\"},
                \"value\": [{\"content\": \"$content\"}]
            }]
        }" | jq -r '.id // .msg'
}

echo "=== Scheduling X Posts ==="

# MONDAY FEB 9 - X
schedule_post "2026-02-09T09:00:00.000Z" "X" "$X_ID" "Adidas lost Kanye. \\nNike lost its innovation edge.\\n\\nThe real winner? The brands nobody's watching yet.\\n\\nSmaller sportswear players are acquisition targets now. Private equity is circling. The consolidation phase is here.\\n\\nWatch the second tier."

schedule_post "2026-02-09T13:00:00.000Z" "X" "$X_ID" "VF Corp selling Supreme was just the start.\\n\\nEvery legacy sportswear giant is reviewing its portfolio. Under Armour. Reebok. Puma's minority stake.\\n\\nThe playbook: acquire authenticity, extract efficiency, repeat.\\n\\nWho's next?"

schedule_post "2026-02-09T19:00:00.000Z" "X" "$X_ID" "The hot M&A target in 2025 isn't a brand.\\n\\nIt's the infrastructure: resale platforms, DTC logistics, AI sizing tech.\\n\\nBrands will buy capabilities, not just logos."

# TUESDAY FEB 10 - X
schedule_post "2026-02-10T09:00:00.000Z" "X" "$X_ID" "AI isn't replacing retail workers.\\n\\nIt's replacing the guesswork.\\n\\nInventory planning. Demand forecasting. Personalized recommendations. These used to require intuition + 6-month analysis cycles.\\n\\nNow? Real-time, probabilistic, scalable."

schedule_post "2026-02-10T13:00:00.000Z" "X" "$X_ID" "Zara's parent company Inditex invested €1B+ in AI-driven logistics.\\n\\nResult: 2-week design-to-shelf cycles. Competitors: 6 months.\\n\\nThis isn't about replacing designers. It's about removing friction between insight and action.\\n\\nSpeed is the new moat."

schedule_post "2026-02-10T19:00:00.000Z" "X" "$X_ID" "The AI retail winners aren't building chatbots.\\n\\nThey're optimizing:\\n→ Assortment mix by location\\n→ Dynamic pricing in real-time\\n→ Predictive sizing (fewer returns = margin)\\n\\nOperational AI > Conversational AI."

# WEDNESDAY FEB 11 - X
schedule_post "2026-02-11T09:00:00.000Z" "X" "$X_ID" "Resale grew 25X faster than fast fashion last decade.\\n\\nNow it's hitting an inflection point:\\n→ Authentication costs squeezing margins\\n→ Oversupply of hype products\\n→ Platform fatigue\\n\\nThe winners will consolidate. The rest will fade."

schedule_post "2026-02-11T13:00:00.000Z" "X" "$X_ID" "The RealReal's struggle isn't about demand.\\n\\nIt's about unit economics.\\n\\nAuthentication at scale requires expertise AI can't replicate yet. Every handbag needs human verification. That's expensive.\\n\\nPure resale plays need operational breakthroughs."

schedule_post "2026-02-11T19:00:00.000Z" "X" "$X_ID" "Luxury brands are done fighting resale.\\n\\nNow they're building it:\\n→ Gucci Vault\\n→ Richemont's Watchfinder\\n→ Prada's pre-owned program\\n\\nThe model: control the secondary market, capture the margin twice."

# THURSDAY FEB 12 - X
schedule_post "2026-02-12T09:00:00.000Z" "X" "$X_ID" "Chinese luxury consumption didn't disappear.\\n\\nIt fragmented.\\n\\nDomestic spending: up. Duty-free Hainan: booming. Overseas travel shopping: recovering slowly.\\n\\nBrands need three strategies now, not one."

schedule_post "2026-02-12T13:00:00.000Z" "X" "$X_ID" "The era of Chinese tourists clearing out Paris boutiques is over.\\n\\nNew pattern: travel to Japan (weak yen), buy European luxury at discount, post on Xiaohongshu.\\n\\nSame customer. Different geography. Better economics for the buyer."

schedule_post "2026-02-12T19:00:00.000Z" "X" "$X_ID" "LVMH's Q3 China numbers were soft.\\n\\nBut look closer: domestic Chinese spending on LVMH brands globally was flat. It's just happening in Tokyo and Hainan now, not Shanghai.\\n\\nGeographic reporting hides customer behavior."

# FRIDAY FEB 13 - X
schedule_post "2026-02-13T09:00:00.000Z" "X" "$X_ID" "The sneaker resale market peaked in 2021.\\n\\nWhy? \\n→ Brands increased supply (killed scarcity)\\n→ Economic uncertainty (discretionary spending down)\\n→ Oversaturation (too many drops, too often)\\n\\nThe business of hype has a ceiling."

schedule_post "2026-02-13T13:00:00.000Z" "X" "$X_ID" "Nike's DTC push was supposed to capture resale margin.\\n\\nInstead: it trained customers to wait for discounts. SNKRS app fatigue is real. Exclusive access became expected, not earned.\\n\\nScarcity requires restraint. Algorithms don't have restraint."

schedule_post "2026-02-13T19:00:00.000Z" "X" "$X_ID" "New Balance and Asics are winning because they:\\n→ Release fewer, better products\\n→ Don't overplay collaborations\\n→ Let demand compound organically\\n\\nAnti-hype is the new hype. Patience is the strategy."

# SATURDAY FEB 14 - X
schedule_post "2026-02-14T09:00:00.000Z" "X" "$X_ID" "Fashion Week isn't dead.\\n\\nIt's unbundled.\\n\\nThe runway show: content creation.\\nThe collection: see-now-buy-now or six months later.\\nThe audience: TikTok, not buyers.\\n\\nThe format evolved. The relevance didn't disappear—it shifted."

schedule_post "2026-02-14T13:00:00.000Z" "X" "$X_ID" "Copenhagen Fashion Week requires sustainability certifications.\\n\\nParis doesn't.\\n\\nThe regulatory divergence is creating two tiers of fashion week relevance:\\n→ Compliance as credibility\\n→ Or the old model fading\\n\\nGeographic fashion weeks are becoming policy differentiators."

schedule_post "2026-02-14T19:00:00.000Z" "X" "$X_ID" "The buyers aren't front row anymore.\\n\\nThe front row is:\\n→ TikTok creators with 10M+ followers\\n→ Celebrity stylists who dress the stars\\n→ Investment analysts covering the luxury sector\\n\\nThe audience changed. The economics changed. Fashion week is now investor relations + content marketing."

# SUNDAY FEB 15 - X
schedule_post "2026-02-15T09:00:00.000Z" "X" "$X_ID" "This week's signals:\\n\\n→ Sportswear M&A: second tier is the target\\n→ AI in retail: operational > conversational\\n→ Resale: brands building, not fighting\\n→ China luxury: fragmented, not gone\\n→ Sneaker economics: scarcity requires restraint\\n→ Fashion week: unbundled relevance\\n\\nSystems, not headlines."

schedule_post "2026-02-15T13:00:00.000Z" "X" "$X_ID" "One pattern across all six themes this week:\\n\\nThe winners are separating from losers not by strategy, but by implementation speed.\\n\\nAI adoption. Geographic flexibility. Cultural restraint. Same insights, different execution timelines.\\n\\nSpeed compounds."

schedule_post "2026-02-15T19:00:00.000Z" "X" "$X_ID" "Week of Feb 9-15: What mattered.\\n\\nEvery major theme—M&A, AI, resale, China, sneakers, fashion week—points to the same shift:\\n\\nOperational excellence beats brand heat.\\nMargin preservation beats growth at all costs.\\nRestraint beats hype.\\n\\nThe cycle has turned."

echo ""
echo "=== X Posts Scheduled ==="
