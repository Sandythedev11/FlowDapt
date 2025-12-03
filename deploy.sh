#!/bin/bash

# FlowDapt Deployment Script
# This script prepares and deploys FlowDapt to GitHub

echo "🚀 FlowDapt Deployment Script"
echo "=============================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if git is initialized
if [ ! -d ".git" ]; then
    echo -e "${RED}❌ Error: Git repository not initialized${NC}"
    echo "Run: git init"
    exit 1
fi

# Check for uncommitted changes
if [ -n "$(git status --porcelain)" ]; then
    echo -e "${YELLOW}⚠️  Warning: You have uncommitted changes${NC}"
    echo ""
    git status --short
    echo ""
    read -p "Do you want to continue? (y/n) " -n 1 -r
    echo ""
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "Deployment cancelled"
        exit 1
    fi
fi

# Check for .env files
echo "🔍 Checking for sensitive files..."
if [ -f "backend/.env" ]; then
    echo -e "${GREEN}✅ backend/.env exists (will be ignored by git)${NC}"
else
    echo -e "${YELLOW}⚠️  backend/.env not found${NC}"
    echo "   Copy backend/.env.example to backend/.env and configure it"
fi

if [ -f "frontend/.env" ]; then
    echo -e "${GREEN}✅ frontend/.env exists (will be ignored by git)${NC}"
else
    echo -e "${YELLOW}⚠️  frontend/.env not found${NC}"
    echo "   Copy frontend/.env.example to frontend/.env and configure it"
fi

# Verify .gitignore
echo ""
echo "🔍 Verifying .gitignore..."
if grep -q "\.env" .gitignore; then
    echo -e "${GREEN}✅ .env files are in .gitignore${NC}"
else
    echo -e "${RED}❌ .env files not in .gitignore!${NC}"
    exit 1
fi

# Check for node_modules
echo ""
echo "🔍 Checking for node_modules..."
if [ -d "backend/node_modules" ] || [ -d "frontend/node_modules" ]; then
    if grep -q "node_modules" .gitignore; then
        echo -e "${GREEN}✅ node_modules will be ignored${NC}"
    else
        echo -e "${RED}❌ node_modules not in .gitignore!${NC}"
        exit 1
    fi
fi

# Test backend build
echo ""
echo "🧪 Testing backend..."
cd backend
if [ ! -d "node_modules" ]; then
    echo "Installing backend dependencies..."
    npm install
fi
echo -e "${GREEN}✅ Backend dependencies installed${NC}"
cd ..

# Test frontend build
echo ""
echo "🧪 Testing frontend build..."
cd frontend
if [ ! -d "node_modules" ]; then
    echo "Installing frontend dependencies..."
    npm install
fi
echo "Building frontend..."
npm run build
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Frontend build successful${NC}"
else
    echo -e "${RED}❌ Frontend build failed${NC}"
    exit 1
fi
cd ..

# Git operations
echo ""
echo "📦 Preparing Git commit..."
git add .

# Show what will be committed
echo ""
echo "Files to be committed:"
git status --short

echo ""
read -p "Enter commit message: " commit_message
if [ -z "$commit_message" ]; then
    commit_message="Update: Production-ready FlowDapt"
fi

git commit -m "$commit_message"

# Push options
echo ""
echo "🚀 Deployment Options:"
echo "1. Standard push (preserves history)"
echo "2. Force push (overwrites remote - USE WITH CAUTION)"
echo "3. Cancel"
echo ""
read -p "Select option (1-3): " -n 1 -r
echo ""

case $REPLY in
    1)
        echo "Pushing to origin main..."
        git push origin main
        if [ $? -eq 0 ]; then
            echo -e "${GREEN}✅ Deployment successful!${NC}"
        else
            echo -e "${RED}❌ Push failed${NC}"
            echo "You may need to pull first: git pull origin main"
            exit 1
        fi
        ;;
    2)
        echo -e "${RED}⚠️  WARNING: Force push will overwrite remote history!${NC}"
        read -p "Are you absolutely sure? (type 'yes' to confirm): " confirm
        if [ "$confirm" = "yes" ]; then
            echo "Force pushing to origin main..."
            git push -f origin main
            if [ $? -eq 0 ]; then
                echo -e "${GREEN}✅ Force push successful!${NC}"
            else
                echo -e "${RED}❌ Force push failed${NC}"
                exit 1
            fi
        else
            echo "Force push cancelled"
            exit 1
        fi
        ;;
    3)
        echo "Deployment cancelled"
        exit 0
        ;;
    *)
        echo "Invalid option"
        exit 1
        ;;
esac

echo ""
echo "🎉 Deployment complete!"
echo ""
echo "Next steps:"
echo "1. Verify deployment at: https://github.com/Sandythedev11/FlowDapt"
echo "2. Check GitHub Actions (if configured)"
echo "3. Deploy to production hosting"
echo ""
echo "Repository: https://github.com/Sandythedev11/FlowDapt"
