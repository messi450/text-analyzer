@echo off
REM Textalyzer Deployment Helper Script (Windows)
REM This script prepares your project for deployment to Vercel

setlocal enabledelayedexpansion

echo.
echo 🚀 Textalyzer Deployment Preparation
echo ====================================
echo.

REM Check if git is initialized
if not exist .git (
    echo ❌ Git not initialized. Run 'git init' first.
    exit /b 1
)

REM Check if node_modules exist
if not exist node_modules (
    echo 📦 Installing dependencies...
    call npm install
)

REM Build the project
echo 🔨 Building for production...
call npm run build

REM Check if build was successful
if not exist dist (
    echo ❌ Build failed. Check errors above.
    exit /b 1
)

echo.
echo ✅ Build successful!
echo.

REM Commit changes
echo 📝 Committing changes to git...
git add .
git commit -m "Build: Production build ready for deployment" 2>nul || (
    echo (No new changes to commit)
)

echo.
echo 📋 Next Steps:
echo 1. Create a new repository on GitHub (github.com/new)
echo 2. Run: git remote add origin https://github.com/YOUR_USERNAME/textalyzer.git
echo 3. Run: git branch -M main
echo 4. Run: git push -u origin main
echo 5. Go to vercel.com and import your GitHub repository
echo 6. Vercel will automatically deploy your site!
echo.
echo 🌐 For custom domain:
echo 1. Buy a domain (Namecheap, GoDaddy, etc.)
echo 2. In Vercel dashboard, add your domain
echo 3. Update your domain's nameservers to Vercel's
echo.
echo 🎉 You're all set!
echo.

pause
