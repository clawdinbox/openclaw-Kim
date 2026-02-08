#!/bin/bash

echo "🦞 Mission Control Setup"
echo "========================"
echo ""

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: Run this script from the mission-control directory"
    exit 1
fi

# Check Node version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Error: Node.js 18+ required"
    exit 1
fi

echo "✓ Node.js version check passed"

# Install dependencies
echo ""
echo "📦 Installing dependencies..."
npm install

# Check if convex is configured
if [ ! -f ".env.local" ]; then
    echo ""
    echo "🔧 Setting up Convex..."
    echo ""
    echo "1. Run: npx convex dev"
    echo "2. This will open a browser to login/create account"
    echo "3. Copy the Convex URL provided"
    echo ""
    echo "Then create .env.local with:"
    echo "NEXT_PUBLIC_CONVEX_URL=your_convex_url_here"
    echo ""
    echo "Press Enter when ready to continue..."
    read
fi

# Check for env file
if [ ! -f ".env.local" ]; then
    echo "⚠️  Warning: .env.local not found"
    echo "Creating template..."
    echo "NEXT_PUBLIC_CONVEX_URL=" > .env.local
    echo ""
    echo "Please edit .env.local and add your Convex URL"
    echo "Then run this script again"
    exit 1
fi

echo "✓ Environment configured"

# Build the project
echo ""
echo "🔨 Building project..."
npm run build

# Start dev server
echo ""
echo "🚀 Starting development server..."
echo ""
echo "Next steps:"
echo "1. Wait for the server to start"
echo "2. In another terminal, run: curl http://localhost:3000/api/sync"
echo "3. Open http://localhost:3000 in your browser"
echo ""

npm run dev
