#!/bin/bash
#
# Setup Cron Jobs for Smart Posting System
# 
# This script installs the 6 daily cron jobs for automated posting
# Run once to set up, or re-run to update

set -e

WORKSPACE_DIR="/Users/clawdmm/.openclaw/workspace"
NODE_PATH="/usr/local/bin/node"
CRON_TAG="# KIM_SMART_POSTER"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo "🦞 Smart Posting System — Cron Setup"
echo "====================================="
echo ""

# Check if running from correct directory
if [ ! -f "$WORKSPACE_DIR/tools/posting-automation/smart-poster.js" ]; then
    echo -e "${RED}❌ Error: Cannot find smart-poster.js${NC}"
    echo "Make sure you're running this from the workspace directory"
    exit 1
fi

# Check for Node.js
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Error: Node.js not found${NC}"
    echo "Please install Node.js first"
    exit 1
fi

NODE_PATH=$(which node)
echo -e "${GREEN}✓ Node.js found: $NODE_PATH${NC}"

# Create logs directory
mkdir -p "$WORKSPACE_DIR/logs"
echo -e "${GREEN}✓ Logs directory ready${NC}"

# Define cron jobs
CRON_JOBS="
# Threads - Morning (08:30 Berlin)
30 8 * * * cd $WORKSPACE_DIR && $NODE_PATH tools/posting-automation/daily-scheduler.js --platform threads --slot morning >> logs/threads-morning.log 2>&1

# X - Morning (09:00 Berlin)  
0 9 * * * cd $WORKSPACE_DIR && $NODE_PATH tools/posting-automation/daily-scheduler.js --platform x --slot morning >> logs/x-morning.log 2>&1

# Threads - Afternoon (12:30 Berlin)
30 12 * * * cd $WORKSPACE_DIR && $NODE_PATH tools/posting-automation/daily-scheduler.js --platform threads --slot afternoon >> logs/threads-afternoon.log 2>&1

# X - Afternoon (13:00 Berlin)
0 13 * * * cd $WORKSPACE_DIR && $NODE_PATH tools/posting-automation/daily-scheduler.js --platform x --slot afternoon >> logs/x-afternoon.log 2>&1

# Threads - Evening (18:30 Berlin)
30 18 * * * cd $WORKSPACE_DIR && $NODE_PATH tools/posting-automation/daily-scheduler.js --platform threads --slot evening >> logs/threads-evening.log 2>&1

# X - Evening (19:00 Berlin)
0 19 * * * cd $WORKSPACE_DIR && $NODE_PATH tools/posting-automation/daily-scheduler.js --platform x --slot evening >> logs/x-evening.log 2>&1
"

echo ""
echo "📋 The following cron jobs will be installed:"
echo "----------------------------------------------"
echo "$CRON_JOBS"
echo ""

# Check if jobs already exist
if crontab -l 2>/dev/null | grep -q "$CRON_TAG"; then
    echo -e "${YELLOW}⚠️  Existing Smart Poster cron jobs found${NC}"
    read -p "Replace existing jobs? (y/n): " confirm
    if [[ $confirm != [yY] ]]; then
        echo "Setup cancelled"
        exit 0
    fi
    # Remove existing jobs
    crontab -l 2>/dev/null | grep -v "$CRON_TAG" | crontab - 2>/dev/null || true
    echo -e "${GREEN}✓ Existing jobs removed${NC}"
fi

# Add new cron jobs
echo ""
echo "Installing cron jobs..."

# Get current crontab (or empty if none)
CURRENT_CRON=$(crontab -l 2>/dev/null || true)

# Add new jobs with tag
NEW_CRON="${CURRENT_CRON}
$CRON_TAG
$CRON_JOBS"

# Install new crontab
echo "$NEW_CRON" | crontab -

echo -e "${GREEN}✓ Cron jobs installed successfully${NC}"

# Verify installation
echo ""
echo "📊 Current crontab:"
echo "-------------------"
crontab -l | grep -A 20 "$CRON_TAG" || echo "(No jobs found - this is unexpected)"

echo ""
echo -e "${GREEN}🎉 Setup complete!${NC}"
echo ""
echo "Next steps:"
echo "  1. Ensure .env file has all required variables"
echo "  2. Test with: node tools/posting-automation/test-smart-poster.js"
echo "  3. Monitor logs in: $WORKSPACE_DIR/logs/"
echo ""
echo "To uninstall:"
echo "  crontab -l | grep -v \"$CRON_TAG\" | crontab -"
echo ""
