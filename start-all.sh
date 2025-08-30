#!/bin/bash

# Script to start all three applications
# Landing page: port 3002
# Login page: port 3000  
# Course browser: port 3001

echo "🚀 Starting all applications..."

# Function to kill processes on exit
cleanup() {
    echo "🛑 Shutting down applications..."
    kill $(jobs -p) 2>/dev/null
    exit
}

# Trap SIGINT and SIGTERM to run cleanup function
trap cleanup SIGINT SIGTERM

has_cmd() { command -v "$1" >/dev/null 2>&1; }

wait_for_port() {
  local port=$1
  local name=$2
  for i in {1..60}; do
    if lsof -i :"$port" -sTCP:LISTEN >/dev/null 2>&1; then
      return 0
    fi
    sleep 0.5
  done
  echo "⚠️  Timed out waiting for $name on port $port"
}

# Start landing page on port 3002 (Vite)
echo "📄 Starting landing page on http://localhost:3002"
cd "/Users/MatthewLi/Desktop/Senior Year/web_dev_lc/landing_page"
# Prefer running the Vite command directly to avoid a pnpm dependency when invoked via npm
if has_cmd pnpm; then
  pnpm run dev:client &
else
  npm run dev:client &
fi
LANDING_PID=$!
wait_for_port 3002 "landing page"

# Start login page on port 3000 (Next.js)
echo "🔐 Starting login page on http://localhost:3000"
cd "/Users/MatthewLi/Desktop/Senior Year/web_dev_lc/login_page"
PORT=3000 npm run dev &
LOGIN_PID=$!
wait_for_port 3000 "login page"

# Start course browser on port 3001 (Next.js)
echo "📚 Starting course browser on http://localhost:3001"
cd "/Users/MatthewLi/Desktop/Senior Year/web_dev_lc/web"
npm run dev &
COURSE_PID=$!
wait_for_port 3001 "course browser"

echo ""
echo "✅ All applications started!"
echo "🌐 Main landing page: http://localhost:3002"
echo "🔐 Login page: http://localhost:3000"  
echo "📚 Course browser: http://localhost:3001"
echo ""
echo "🔗 Navigation flow: Landing → Login → Course Browser"
echo ""
echo "🌐 Opening main landing page in your browser..."
# macOS 'open', fallback to xdg-open if available
if has_cmd open; then
  open "http://localhost:3002" >/dev/null 2>&1 &
elif has_cmd xdg-open; then
  xdg-open "http://localhost:3002" >/dev/null 2>&1 &
fi
echo "Press Ctrl+C to stop all applications"

# Wait for all background processes
wait
