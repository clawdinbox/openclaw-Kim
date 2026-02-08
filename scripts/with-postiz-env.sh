#!/bin/bash
# Postiz Environment Loader
# Loads .env.postiz and exports vars for cron jobs

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
WORKSPACE_DIR="$(dirname "$SCRIPT_DIR")"

# Load .env.postiz
if [ -f "$WORKSPACE_DIR/.env.postiz" ]; then
    export $(grep -v '^#' "$WORKSPACE_DIR/.env.postiz" | xargs)
fi

# Execute the passed command
exec "$@"
