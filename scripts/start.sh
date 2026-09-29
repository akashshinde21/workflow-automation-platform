#!/bin/bash
# Quick start script

set -e

echo "🚀 Starting Workflow Automation Platform..."
echo ""

# Check Node.js
if ! command -v node &> /dev/null; then
  echo "❌ Node.js is required but not installed."
  exit 1
fi

echo "✅ Node.js $(node --version) found"

# Install dependencies
if [ ! -d "node_modules" ]; then
  echo ""
  echo "📦 Installing dependencies..."
  npm install
fi

# Run development servers
echo ""
echo "🎨 Starting development servers..."
echo "API: http://localhost:3001"
echo "Web: http://localhost:5173"
echo ""
npm run dev
