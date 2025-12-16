# Bruno PA Backend - Production Deployment Guide

## Files Created

### `gunicorn.conf.py`

- **Purpose**: Gunicorn configuration with production-optimized settings
- **Key Features**:
  - Automatically sets `DJANGO_SETTINGS_MODULE=config.settings.production`
  - Production-ready worker configuration
  - Logging and monitoring setup
  - Performance optimizations

### `start-production.sh` (Linux/macOS)

- **Purpose**: Complete production deployment script
- **Features**:
  - Dependency installation
  - Database migrations
  - Static file collection
  - System checks
  - Gunicorn startup

### `start-production.ps1` (Windows)

- **Purpose**: Windows PowerShell production deployment script
- **Features**: Same as Linux script with Windows-specific commands
- **Options**:
  - `-SkipMigrations`: Skip database migrations
  - `-SkipStatic`: Skip static file collection

## Quick Start

### Linux/macOS

```bash
cd backend
chmod +x deployment/start-production.sh
./deployment/start-production.sh
```

### Windows

```powershell
cd backend
.\deployment\start-production.ps1
```

### Manual Gunicorn Start

```bash
cd backend
gunicorn config.wsgi:application --config deployment/gunicorn.conf.py
```

## Environment Variables

The production scripts automatically set:

- `DJANGO_SETTINGS_MODULE=config.settings.production`

Make sure your `.env` file contains:

- `DATABASE_URL` or individual `DB_*` variables
- `SECRET_KEY`
- `REDIS_URL`
- Any API keys (OPENAI_API_KEY, etc.)

## Docker Deployment (Alternative)

```dockerfile
# Add to your Dockerfile
COPY deployment/gunicorn.conf.py /app/deployment/
CMD ["gunicorn", "config.wsgi:application", "--config", "deployment/gunicorn.conf.py"]
```

## Notes

- Gunicorn will automatically use production settings
- Server runs on `0.0.0.0:8000` by default
- Logs are sent to stdout/stderr for containerized environments
- Worker count is automatically calculated based on CPU cores
