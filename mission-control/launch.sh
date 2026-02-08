#!/bin/bash

# 24/7 Autonomous Agent Pipeline Launcher
# Usage: ./launch.sh [command]
# Commands: start, stop, status, restart, tick

set -e

PIPELINE_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PIDFILE="$PIPELINE_DIR/.pipeline.pid"
LOGFILE="$PIPELINE_DIR/.pipeline.log"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

log() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1" | tee -a "$LOGFILE"
}

error() {
    echo -e "${RED}[ERROR]${NC} $1" | tee -a "$LOGFILE"
}

success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1" | tee -a "$LOGFILE"
}

warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1" | tee -a "$LOGFILE"
}

# Check if dependencies are installed
check_deps() {
    if ! command -v node &> /dev/null; then
        error "Node.js is not installed"
        exit 1
    fi
    
    if ! command -v npx &> /dev/null; then
        error "npx is not available"
        exit 1
    fi
    
    log "Dependencies check passed"
}

# Initialize the pipeline
init_pipeline() {
    log "Initializing 24/7 Autonomous Agent Pipeline..."
    
    # Check if convex is initialized
    if [ ! -d "$PIPELINE_DIR/convex/_generated" ]; then
        warning "Convex not initialized. Running convex dev..."
        cd "$PIPELINE_DIR" && npx convex dev &
        sleep 5
    fi
    
    # Initialize default templates
    log "Setting up default task templates..."
    cd "$PIPELINE_DIR" && npx convex run pipeline.generator.initializeDefaultTemplates
    
    # Initialize pipeline config
    log "Initializing pipeline configuration..."
    cd "$PIPELINE_DIR" && npx convex run pipeline.worker.initializeConfig '{"mode": "proactive"}'
    
    success "Pipeline initialized successfully"
}

# Start the pipeline worker
start_pipeline() {
    if [ -f "$PIDFILE" ]; then
        PID=$(cat "$PIDFILE")
        if ps -p "$PID" > /dev/null 2>&1; then
            warning "Pipeline is already running (PID: $PID)"
            return 0
        else
            rm -f "$PIDFILE"
        fi
    fi
    
    log "Starting 24/7 Autonomous Agent Pipeline..."
    
    # Check dependencies
    check_deps
    
    # Initialize if needed
    if [ ! -f "$PIPELINE_DIR/.initialized" ]; then
        init_pipeline
        touch "$PIPELINE_DIR/.initialized"
    fi
    
    # Start the tick loop in background
    (
        while true; do
            cd "$PIPELINE_DIR" && npx convex run pipeline.worker.tick 2>&1 | tee -a "$LOGFILE"
            sleep 300  # 5 minutes between ticks
        done
    ) &
    
    echo $! > "$PIDFILE"
    success "Pipeline started (PID: $(cat "$PIDFILE"))"
    log "Pipeline will tick every 5 minutes"
    log "Logs: tail -f $LOGFILE"
}

# Stop the pipeline
stop_pipeline() {
    if [ ! -f "$PIDFILE" ]; then
        warning "Pipeline is not running"
        return 0
    fi
    
    PID=$(cat "$PIDFILE")
    log "Stopping pipeline (PID: $PID)..."
    
    if kill "$PID" 2>/dev/null; then
        rm -f "$PIDFILE"
        success "Pipeline stopped"
    else
        error "Failed to stop pipeline"
        return 1
    fi
}

# Get pipeline status
pipeline_status() {
    if [ -f "$PIDFILE" ]; then
        PID=$(cat "$PIDFILE")
        if ps -p "$PID" > /dev/null 2>&1; then
            log "Pipeline Status: ${GREEN}RUNNING${NC} (PID: $PID)"
            
            # Get current status from convex
            cd "$PIPELINE_DIR" && npx convex run pipeline.worker.getPipelineStatus 2>/dev/null | jq . || echo "Unable to fetch status"
        else
            error "Pipeline Status: STALE PID FILE (PID: $PID not running)"
            rm -f "$PIDFILE"
        fi
    else
        log "Pipeline Status: ${YELLOW}STOPPED${NC}"
    fi
}

# Trigger a manual tick
manual_tick() {
    log "Triggering manual pipeline tick..."
    cd "$PIPELINE_DIR" && npx convex run pipeline.worker.tick
    success "Manual tick completed"
}

# View logs
view_logs() {
    if [ -f "$LOGFILE" ]; then
        tail -f "$LOGFILE"
    else
        error "No log file found"
    fi
}

# Run diagnostics
diagnostics() {
    log "Running pipeline diagnostics..."
    
    # Check health
    cd "$PIPELINE_DIR" && npx convex run pipeline.monitor.getPipelineHealth 2>/dev/null | jq . || echo "Unable to fetch health"
    
    # Check agent availability
    echo ""
    log "Agent Availability:"
    cd "$PIPELINE_DIR" && npx convex run pipeline.router.getAgentAvailability 2>/dev/null | jq . || echo "Unable to fetch agents"
    
    # Get recent execution report
    echo ""
    log "Recent Execution (24h):"
    cd "$PIPELINE_DIR" && npx convex run pipeline.monitor.getExecutionReport '{"hours": 24}' 2>/dev/null | jq . || echo "Unable to fetch report"
}

# Main command handler
case "${1:-status}" in
    start)
        start_pipeline
        ;;
    stop)
        stop_pipeline
        ;;
    restart)
        stop_pipeline
        sleep 2
        start_pipeline
        ;;
    status)
        pipeline_status
        ;;
    tick)
        manual_tick
        ;;
    logs)
        view_logs
        ;;
    diagnose|diagnostics)
        diagnostics
        ;;
    init)
        init_pipeline
        ;;
    *)
        echo "Usage: $0 {start|stop|restart|status|tick|logs|diagnose|init}"
        echo ""
        echo "Commands:"
        echo "  start     - Start the 24/7 pipeline worker"
        echo "  stop      - Stop the pipeline worker"
        echo "  restart   - Restart the pipeline worker"
        echo "  status    - Check pipeline status"
        echo "  tick      - Trigger a manual pipeline tick"
        echo "  logs      - View pipeline logs"
        echo "  diagnose  - Run diagnostics"
        echo "  init      - Initialize pipeline (run once)"
        exit 1
        ;;
esac
