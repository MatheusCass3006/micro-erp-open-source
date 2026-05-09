#!/bin/bash
set -e

echo "🔨 Building MicroERP Frontend..."
cd financeiro-react
echo "📦 Installing dependencies..."
npm ci
echo "🏗️ Building Next.js..."
npm run build
echo "✅ Build complete!"