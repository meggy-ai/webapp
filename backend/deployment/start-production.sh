#!/bin/bash

# Production Deployment Script for Bruno PA Backend
# This script starts the Django backend using Gunicorn with production settings

set -e  # Exit on any error

echo "🚀 Starting Bruno PA Backend in Production Mode..."

# Ensure we're in the backend directory (parent of deployment)
cd "$(dirname "$0")/.."

# Activate virtual environment if it exists
if [ -d ".venv" ]; then
    echo "📦 Activating virtual environment..."
    source .venv/bin/activate
fi

# Install/update dependencies
echo "📚 Installing production dependencies..."
pip install -r requirements/production.txt

# Collect static files
echo "🎨 Collecting static files..."
python manage.py collectstatic --noinput --settings=config.settings.production

# Run database migrations
echo "🗄️ Running database migrations..."
python manage.py migrate --settings=config.settings.production

# Check for any issues
echo "🔍 Running system checks..."
python manage.py check --deploy --settings=config.settings.production

# Start Gunicorn server
echo "🌐 Starting Gunicorn server with production settings..."
echo "Server will be available at: http://0.0.0.0:8000"
echo "Press Ctrl+C to stop the server"
echo ""

exec gunicorn config.wsgi:application \
    --config deployment/gunicorn.conf.py \
    --env DJANGO_SETTINGS_MODULE=config.settings.production