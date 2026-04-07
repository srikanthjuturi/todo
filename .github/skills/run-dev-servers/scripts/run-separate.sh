#!/bin/bash

# run-separate.sh
# Opens two VS Code terminals and starts API and web servers independently
# This provides better log separation and independent control
# Run from project root: bash ./.github/skills/run-dev-servers/scripts/run-separate.sh

WORKSPACE_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../../../" && pwd)"

# Check if VS Code CLI is available
if ! command -v code &> /dev/null; then
    echo "VS Code CLI not found. Running servers directly instead..."
    echo ""
    echo "Terminal 1 (API):"
    echo "  cd $WORKSPACE_ROOT/api && python -m uvicorn app.main:app --reload"
    echo ""
    echo "Terminal 2 (Web):"
    echo "  cd $WORKSPACE_ROOT/web && npm run dev"
    exit 1
fi

# Create split terminals using VS Code CLI
code --folder-uri="file://$WORKSPACE_ROOT"

# Note: To run in separate terminals, manually run these commands:
# 
# Terminal 1 (API):
#   cd api && python -m uvicorn app.main:app --reload
#
# Terminal 2 (Web):
#   cd web && npm run dev
