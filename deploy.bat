@echo off
REM FlowDapt Deployment Script for Windows
REM This script prepares and deploys FlowDapt to GitHub

echo ========================================
echo    FlowDapt Deployment Script
echo ========================================
echo.

REM Check if git is initialized
if not exist ".git" (
    echo [ERROR] Git repository not initialized
    echo Run: git init
    pause
    exit /b 1
)

REM Check for .env files
echo [INFO] Checking for sensitive files...
if exist "backend\.env" (
    echo [OK] backend\.env exists (will be ignored by git)
) else (
    echo [WARNING] backend\.env not found
    echo          Copy backend\.env.example to backend\.env and configure it
)

if exist "frontend\.env" (
    echo [OK] frontend\.env exists (will be ignored by git)
) else (
    echo [WARNING] frontend\.env not found
    echo          Copy frontend\.env.example to frontend\.env and configure it
)

echo.
echo [INFO] Verifying .gitignore...
findstr /C:".env" .gitignore >nul
if %errorlevel% equ 0 (
    echo [OK] .env files are in .gitignore
) else (
    echo [ERROR] .env files not in .gitignore!
    pause
    exit /b 1
)

REM Test backend
echo.
echo [INFO] Testing backend...
cd backend
if not exist "node_modules" (
    echo Installing backend dependencies...
    call npm install
)
echo [OK] Backend dependencies installed
cd ..

REM Test frontend build
echo.
echo [INFO] Testing frontend build...
cd frontend
if not exist "node_modules" (
    echo Installing frontend dependencies...
    call npm install
)
echo Building frontend...
call npm run build
if %errorlevel% neq 0 (
    echo [ERROR] Frontend build failed
    cd ..
    pause
    exit /b 1
)
echo [OK] Frontend build successful
cd ..

REM Git operations
echo.
echo [INFO] Preparing Git commit...
git add .

echo.
echo Files to be committed:
git status --short

echo.
set /p commit_message="Enter commit message (or press Enter for default): "
if "%commit_message%"=="" set commit_message=Update: Production-ready FlowDapt

git commit -m "%commit_message%"

REM Push options
echo.
echo ========================================
echo    Deployment Options
echo ========================================
echo 1. Standard push (preserves history)
echo 2. Force push (overwrites remote - USE WITH CAUTION)
echo 3. Cancel
echo.
set /p option="Select option (1-3): "

if "%option%"=="1" (
    echo.
    echo Pushing to origin main...
    git push origin main
    if %errorlevel% equ 0 (
        echo [SUCCESS] Deployment successful!
    ) else (
        echo [ERROR] Push failed
        echo You may need to pull first: git pull origin main
        pause
        exit /b 1
    )
) else if "%option%"=="2" (
    echo.
    echo [WARNING] Force push will overwrite remote history!
    set /p confirm="Are you absolutely sure? (type 'yes' to confirm): "
    if "%confirm%"=="yes" (
        echo Force pushing to origin main...
        git push -f origin main
        if %errorlevel% equ 0 (
            echo [SUCCESS] Force push successful!
        ) else (
            echo [ERROR] Force push failed
            pause
            exit /b 1
        )
    ) else (
        echo Force push cancelled
        pause
        exit /b 1
    )
) else if "%option%"=="3" (
    echo Deployment cancelled
    pause
    exit /b 0
) else (
    echo Invalid option
    pause
    exit /b 1
)

echo.
echo ========================================
echo    Deployment Complete!
echo ========================================
echo.
echo Next steps:
echo 1. Verify deployment at: https://github.com/Sandythedev11/FlowDapt
echo 2. Check GitHub Actions (if configured)
echo 3. Deploy to production hosting
echo.
echo Repository: https://github.com/Sandythedev11/FlowDapt
echo.
pause
