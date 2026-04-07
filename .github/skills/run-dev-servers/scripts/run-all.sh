#!/bin/bash

# run-all.sh
# Starts both API and web dev servers in a single terminal with colored output
# Run from project root: bash ./.github/skills/run-dev-servers/scripts/run-all.sh

set -e

RESET='\033[0m'
BLUE='\033[1;34m'
GREEN='\033[1;32m'
YELLOW='\033[1;33m'

WORKSPACE_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../../../" && pwd)"

echo -e "${BLUE}=== Todo Dev Servers ===${RESET}"
echo -e "${YELLOW}Workspace: $WORKSPACE_ROOT${RESET}"
echo ""

# Check if both directories exist
if [ ! -d "$WORKSPACE_ROOT/api" ]; then
    echo -e "${BLUE}✗ /api directory not found${RESET}"
    exit 1
fi

if [ ! -d "$WORKSPACE_ROOT/web" ]; then
    echo -e "${BLUE}✗ /web directory not found${RESET}"
    exit 1
fi

# Start backend
echo -e "${GREEN}▶ Starting FastAPI backend...${RESET}"
cd "$WORKSPACE_ROOT/api"
python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000 &
API_PID=$!

# Give API time to start
sleep 2

# Start frontend
echo -e "${GREEN}▶ Starting Vite frontend dev server...${RESET}"
cd "$WORKSPACE_ROOT/web"
npm run dev &
WEB_PID=$!

echo ""
echo -e "${BLUE}${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${RESET}"
echo -e "${GREEN}✓ Both servers running${RESET}"
echo -e "${BLUE}  API  → http://localhost:8000${RESET}"
echo -e "${BLUE}  Web  → http://localhost:5173${RESET}"
echo -e "${YELLOW}  (Press Ctrl+C to stop)${RESET}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${RESET}"
echo ""

# Wait for both processes
wait $API_PID $WEB_PID 2>/dev/null || true

echo -e "${YELLOW}Servers stopped.${RESET}"
