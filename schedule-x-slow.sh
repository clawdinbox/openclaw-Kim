#!/bin/bash
# Schedule posts to Postiz with extended rate limiting

API_KEY="75453381e58be37ec19683c7c921e91bd7d3cc0adfbcc609e881c861e20e5437"
X_ID="cmlb9q3bs007oom0y8lg6tr8k"
THREADS_ID="cmlbamgkt008som0y7z6sl86w"
IG_ID="cmlbfgpqi00jdom0y14555fls"

BASE_URL="https://api.postiz.com/public/v1"
DELAY=30  # 30 seconds between requests to avoid throttling

schedule_post() {
    local date_str=$1
    local integration_id=$2
    local content=$3
    local tags=$4
    
    local response=$(curl -s -X POST "$BASE_URL/posts" \
        -H "Authorization: $API_KEY" \
        -H "Content-Type: application/json" \
        -d "{
            \"type\": \"schedule\",
            \"date\": \"$date_str\",
            \"shortLink\": false,
            \"tags\": [$tags],
            \"posts\": [{
                \"integration\": {\"id\": \"$integration_id\"},
                \"value\": [{\"content\": \"$content\"}]
            }]
        }")
    
    local id=$(echo "$response" | jq -r '.id // empty')
    if [ -n "$id" ]; then
        echo "✓ Scheduled: $date_str"
        echo "$id"
    else
        echo "✗ Failed: $date_str - $(echo "$response" | jq -r '.message // .statusCode // "Unknown error"')"
    fi
    sleep $DELAY
}

echo "=== Starting Post Scheduling (30s delay) ==="
echo "Started: $(date)"
echo "Estimated completion: ~25 minutes"
echo ""

# X Posts - first batch of 7
echo "--- X Posts (Mon-Wed) ---"
schedule_post "2026-02-09T09:00:00.000Z" "$X_ID" "Adidas lost Kanye. Nike lost its innovation edge. The real winner? The brands nobody is watching yet. Smaller sportswear players are acquisition targets now. Private equity is circling. Watch the second tier." '"feb9-15","x"'
schedule_post "2026-02-09T13:00:00.000Z" "$X_ID" "VF Corp selling Supreme was just the start. Every legacy sportswear giant is reviewing its portfolio. Under Armour. Reebok. Puma's minority stake. The playbook: acquire authenticity, extract efficiency, repeat. Who's next?" '"feb9-15","x"'
schedule_post "2026-02-09T19:00:00.000Z" "$X_ID" "The hot M&A target in 2025 isn't a brand. It's the infrastructure: resale platforms, DTC logistics, AI sizing tech. Brands will buy capabilities, not just logos." '"feb9-15","x"'
schedule_post "2026-02-10T09:00:00.000Z" "$X_ID" "AI isn't replacing retail workers. It's replacing the guesswork. Inventory planning. Demand forecasting. Personalized recommendations. These used to require intuition + 6-month analysis cycles. Now? Real-time, probabilistic, scalable." '"feb9-15","x"'
schedule_post "2026-02-10T13:00:00.000Z" "$X_ID" "Zara's parent company Inditex invested €1B+ in AI-driven logistics. Result: 2-week design-to-shelf cycles. Competitors: 6 months. This isn't about replacing designers. It's about removing friction between insight and action. Speed is the new moat." '"feb9-15","x"'
schedule_post "2026-02-10T19:00:00.000Z" "$X_ID" "The AI retail winners aren't building chatbots. They're optimizing: Assortment mix by location. Dynamic pricing in real-time. Predictive sizing (fewer returns = margin). Operational AI > Conversational AI." '"feb9-15","x"'
schedule_post "2026-02-11T09:00:00.000Z" "$X_ID" "Resale grew 25X faster than fast fashion last decade. Now it's hitting an inflection point: Authentication costs squeezing margins. Oversupply of hype products. Platform fatigue. The winners will consolidate. The rest will fade." '"feb9-15","x"'

echo ""
echo "--- X Posts (Thu-Sun) ---"
schedule_post "2026-02-11T13:00:00.000Z" "$X_ID" "The RealReal's struggle isn't about demand. It's about unit economics. Authentication at scale requires expertise AI can't replicate yet. Every handbag needs human verification. That's expensive. Pure resale plays need operational breakthroughs." '"feb9-15","x"'
schedule_post "2026-02-11T19:00:00.000Z" "$X_ID" "Luxury brands are done fighting resale. Now they're building it: Gucci Vault. Richemont's Watchfinder. Prada's pre-owned program. The model: control the secondary market, capture the margin twice." '"feb9-15","x"'
schedule_post "2026-02-12T09:00:00.000Z" "$X_ID" "Chinese luxury consumption didn't disappear. It fragmented. Domestic spending: up. Duty-free Hainan: booming. Overseas travel shopping: recovering slowly. Brands need three strategies now, not one." '"feb9-15","x"'
schedule_post "2026-02-12T13:00:00.000Z" "$X_ID" "The era of Chinese tourists clearing out Paris boutiques is over. New pattern: travel to Japan (weak yen), buy European luxury at discount, post on Xiaohongshu. Same customer. Different geography. Better economics for the buyer." '"feb9-15","x"'
schedule_post "2026-02-12T19:00:00.000Z" "$X_ID" "LVMH's Q3 China numbers were soft. But look closer: domestic Chinese spending on LVMH brands globally was flat. It's just happening in Tokyo and Hainan now, not Shanghai. Geographic reporting hides customer behavior." '"feb9-15","x"'
schedule_post "2026-02-13T09:00:00.000Z" "$X_ID" "The sneaker resale market peaked in 2021. Why? Brands increased supply (killed scarcity). Economic uncertainty (discretionary spending down). Oversaturation (too many drops, too often). The business of hype has a ceiling." '"feb9-15","x"'
schedule_post "2026-02-13T13:00:00.000Z" "$X_ID" "Nike's DTC push was supposed to capture resale margin. Instead: it trained customers to wait for discounts. SNKRS app fatigue is real. Exclusive access became expected, not earned. Scarcity requires restraint. Algorithms don't have restraint." '"feb9-15","x"'
schedule_post "2026-02-13T19:00:00.000Z" "$X_ID" "New Balance and Asics are winning because they: Release fewer, better products. Don't overplay collaborations. Let demand compound organically. Anti-hype is the new hype. Patience is the strategy." '"feb9-15","x"'
schedule_post "2026-02-14T09:00:00.000Z" "$X_ID" "Fashion Week isn't dead. It's unbundled. The runway show: content creation. The collection: see-now-buy-now or six months later. The audience: TikTok, not buyers. The format evolved. The relevance didn't disappear—it shifted." '"feb9-15","x"'
schedule_post "2026-02-14T13:00:00.000Z" "$X_ID" "Copenhagen Fashion Week requires sustainability certifications. Paris doesn't. The regulatory divergence is creating two tiers of fashion week relevance: Compliance as credibility. Or the old model fading. Geographic fashion weeks are becoming policy differentiators." '"feb9-15","x"'
schedule_post "2026-02-14T19:00:00.000Z" "$X_ID" "The buyers aren't front row anymore. The front row is: TikTok creators with 10M+ followers. Celebrity stylists who dress the stars. Investment analysts covering the luxury sector. The audience changed. The economics changed. Fashion week is now investor relations + content marketing." '"feb9-15","x"'
schedule_post "2026-02-15T09:00:00.000Z" "$X_ID" "This week's signals: Sportswear M&A: second tier is the target. AI in retail: operational > conversational. Resale: brands building, not fighting. China luxury: fragmented, not gone. Sneaker economics: scarcity requires restraint. Fashion week: unbundled relevance. Systems, not headlines." '"feb9-15","x"'
schedule_post "2026-02-15T13:00:00.000Z" "$X_ID" "One pattern across all six themes this week: The winners are separating from losers not by strategy, but by implementation speed. AI adoption. Geographic flexibility. Cultural restraint. Same insights, different execution timelines. Speed compounds." '"feb9-15","x"'
schedule_post "2026-02-15T19:00:00.000Z" "$X_ID" "Week of Feb 9-15: What mattered. Every major theme—M&A, AI, resale, China, sneakers, fashion week—points to the same shift: Operational excellence beats brand heat. Margin preservation beats growth at all costs. Restraint beats hype. The cycle has turned." '"feb9-15","x"'

echo ""
echo "Completed: $(date)"
