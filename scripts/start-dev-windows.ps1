#!/usr/bin/env pwsh
<#
.SYNOPSIS
    Start all development services for Meggy AI (Windows)

.DESCRIPTION
    This script starts:
    - Redis server (via WSL)
    - Django backend server with WebSocket support
    - Timer monitor service for notifications
    - Next.js frontend development server

.NOTES
    Requirements:
    - WSL with Redis installed
    - Python 3.12+ with dependencies installed
    - Node.js with dependencies installed
#>

Write-Host "Starting Meggy AI Development Environment..." -ForegroundColor Cyan
Write-Host ""

# Check if Redis is already running
$redisRunning = wsl redis-cli ping 2>$null
if ($redisRunning -eq "PONG") {
    Write-Host "[OK] Redis is already running" -ForegroundColor Green
} else {
    Write-Host "Starting Redis server..." -ForegroundColor Yellow
    wsl redis-server --daemonize yes
    Start-Sleep -Seconds 2
    $redisCheck = wsl redis-cli ping 2>$null
    if ($redisCheck -eq "PONG") {
        Write-Host "[OK] Redis started successfully" -ForegroundColor Green
    } else {
        Write-Host "[ERROR] Failed to start Redis. Please check WSL and Redis installation." -ForegroundColor Red
        exit 1
    }
}

Write-Host ""

# Start Django backend server
Write-Host "Starting Django backend server..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot\..\backend'; .venv\Scripts\Activate.ps1; `$env:DJANGO_SETTINGS_MODULE='config.settings.development'; Write-Host 'Django Backend Server' -ForegroundColor Cyan; python manage.py runserver"
Start-Sleep -Seconds 2

# Start timer monitor service
Write-Host "Starting timer monitor service..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot\..\backend'; .venv\Scripts\Activate.ps1; `$env:DJANGO_SETTINGS_MODULE='config.settings.development'; Write-Host 'Timer Monitor Service' -ForegroundColor Magenta; python manage.py monitor_timers"
Start-Sleep -Seconds 2

# Start Next.js frontend server
Write-Host "Starting Next.js frontend server..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot\..\frontend'; Write-Host 'Next.js Frontend Server' -ForegroundColor Blue; npm run dev"

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "[SUCCESS] All services started successfully!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Services running:" -ForegroundColor Cyan
Write-Host "  - Redis:         localhost:6379" -ForegroundColor White
Write-Host "  - Backend API:   http://localhost:8000" -ForegroundColor White
Write-Host "  - Frontend:      http://localhost:3000" -ForegroundColor White
Write-Host ""
Write-Host "To stop all services, close all PowerShell windows or press Ctrl+C in each." -ForegroundColor Yellow
Write-Host ""
