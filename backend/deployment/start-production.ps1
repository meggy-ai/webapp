# Production Deployment Script for Bruno PA Backend (Windows)
# This script starts the Django backend using Gunicorn with production settings

param(
    [switch]$SkipMigrations,
    [switch]$SkipStatic
)

Write-Host "🚀 Starting Bruno PA Backend in Production Mode..." -ForegroundColor Cyan
Write-Host ""

# Ensure we're in the backend directory (parent of deployment)
Set-Location (Split-Path $PSScriptRoot -Parent)

# Activate virtual environment if it exists
if (Test-Path ".venv") {
    Write-Host "📦 Activating virtual environment..." -ForegroundColor Yellow
    .venv\Scripts\Activate.ps1
}

# Install/update dependencies
Write-Host "📚 Installing production dependencies..." -ForegroundColor Yellow
pip install -r requirements\production.txt

if (-not $SkipStatic) {
    # Collect static files
    Write-Host "🎨 Collecting static files..." -ForegroundColor Yellow
    python manage.py collectstatic --noinput --settings=config.settings.production
}

if (-not $SkipMigrations) {
    # Run database migrations
    Write-Host "🗄️ Running database migrations..." -ForegroundColor Yellow
    python manage.py migrate --settings=config.settings.production
}

# Check for any issues
Write-Host "🔍 Running system checks..." -ForegroundColor Yellow
python manage.py check --deploy --settings=config.settings.production

# Start Gunicorn server
Write-Host ""
Write-Host "🌐 Starting Gunicorn server with production settings..." -ForegroundColor Green
Write-Host "Server will be available at: http://0.0.0.0:8000" -ForegroundColor White
Write-Host "Press Ctrl+C to stop the server" -ForegroundColor White
Write-Host ""

# Set environment variable and start Gunicorn
$env:DJANGO_SETTINGS_MODULE = 'config.settings.production'
gunicorn config.wsgi:application --config deployment/gunicorn.conf.py