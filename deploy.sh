#!/bin/bash

# Textalyzer Deployment Helper Script
# This script prepares your project for deployment to Vercel

set -e

echo "🚀 Textalyzer Deployment Preparation"
echo "===================================="
echo ""

# Check if git is initialized
if [ ! -d .git ]; then
    echo "❌ Git not initialized. Run 'git init' first."
    exit 1
fi

# Check if node_modules exist
if [ ! -d node_modules ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

# Build the project
echo "🔨 Building for production..."
npm run build

# Check if build was successful
if [ ! -d dist ]; then
    echo "❌ Build failed. Check errors above."
    exit 1
fi

echo ""
echo "✅ Build successful!"
echo ""

# Commit changes
echo "📝 Committing changes to git..."
git add .
git commit -m "Build: Production build ready for deployment" || echo "No changes to commit"

echo ""
echo "📋 Next Steps:"
echo "1. Create a new repository on GitHub (github.com/new)"
echo "2. Run: git remote add origin https://github.com/YOUR_USERNAME/textalyzer.git"
echo "3. Run: git branch -M main"
echo "4. Run: git push -u origin main"
echo "5. Go to vercel.com and import your GitHub repository"
echo "6. Vercel will automatically deploy your site!"
echo ""
echo "🌐 For custom domain:"
echo "1. Buy a domain (Namecheap, GoDaddy, etc.)"
echo "2. In Vercel dashboard, add your domain"
echo "3. Update your domain's nameservers to Vercel's"
echo ""
echo "🎉 You're all set!"
