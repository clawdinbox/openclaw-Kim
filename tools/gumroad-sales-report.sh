#!/bin/bash
# Gumroad Sales Report Generator
# Usage: ./gumroad-sales-report.sh

export GUMROAD_ACCESS_TOKEN="${GUMROAD_ACCESS_TOKEN}"

echo "📊 Gumroad Sales Report — $(date +%Y-%m-%d)"
echo "================================"
echo ""

# Get sales data
curl -s -H "Authorization: Bearer $GUMROAD_ACCESS_TOKEN" \
  "https://api.gumroad.com/v2/sales" | \
  jq -r '.sales | group_by(.product_name) | map({product: .[0].product_name, count: length, revenue: map(.price) | add}) | .[] | "\(.product): \(.count) sales, €\(.revenue/100)"'

echo ""
echo "Total Revenue: $(curl -s -H "Authorization: Bearer $GUMROAD_ACCESS_TOKEN" \
  "https://api.gumroad.com/v2/sales" | jq '[.sales[].price] | add / 100')"
