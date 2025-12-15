# Docker Development Environment

This directory contains Docker configuration files for running the Bruno-PA application in a containerized development environment.

## Quick Start

```bash
# 1. Create environment file
cp .env.example .env

# 2. Edit .env and add your API keys (at minimum, OPENAI_API_KEY)
nano .env  # or use your preferred editor

# 3. Start all services
docker-compose up --build

# 4. In a new terminal, create a superuser
docker-compose exec backend python manage.py createsuperuser

# 5. Access the application
# Frontend: http://localhost:3000
# Backend API: http://localhost:8000/api
# Admin: http://localhost:8000/admin
```

## Files

- **docker-compose.yml** - Main orchestration file defining all services
- **backend.Dockerfile** - Django backend container configuration
- **frontend.Dockerfile** - Next.js frontend container configuration
- **.env** - Environment variables (create from .env.example)
- **.env.example** - Template for environment variables

## Services

### PostgreSQL Database

- **Port:** 5432
- **Container:** bruno-pa-db
- **Volume:** postgres_data (persistent)
- **Health Check:** Automatic readiness check

### Django Backend

- **Port:** 8000
- **Container:** bruno-pa-backend
- **Hot Reload:** ✅ Enabled
- **Volumes:**
  - Code: `../backend:/app`
  - Static: `backend_static:/app/staticfiles`
  - Media: `backend_media:/app/media`

### Next.js Frontend

- **Port:** 3000
- **Container:** bruno-pa-frontend
- **Hot Reload:** ✅ Enabled with Fast Refresh
- **Volumes:**
  - Code: `../frontend:/app`
  - Dependencies: `/app/node_modules`
  - Build Cache: `/app/.next`

## Development Features

✅ **Hot Reload** - Both frontend and backend reload automatically on code changes  
✅ **Volume Mounts** - Local code changes sync instantly to containers  
✅ **Shared Network** - All services communicate via `bruno-network`  
✅ **Persistent Data** - Database data persists across restarts  
✅ **Health Checks** - Services start in correct order with dependency checks

## Common Commands

```bash
# Start services (foreground)
docker-compose up

# Start services (background)
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down

# Rebuild after dependency changes
docker-compose up --build

# Fresh start (removes volumes)
docker-compose down -v && docker-compose up --build

# Run Django commands
docker-compose exec backend python manage.py <command>

# Access backend shell
docker-compose exec backend bash

# Access frontend shell
docker-compose exec frontend sh

# View running containers
docker-compose ps
```

## Environment Variables

Copy `.env.example` to `.env` and configure:

### Required

```env
# Database
DB_NAME=bruno_pa
DB_USER=postgres
DB_PASSWORD=postgres

# Django Security
SECRET_KEY=your-secret-key-here
JWT_SECRET_KEY=your-jwt-secret-here

# LLM Provider (at least one)
OPENAI_API_KEY=sk-...
# OR
OLLAMA_BASE_URL=http://host.docker.internal:11434
```

### Optional

```env
DEBUG=True
```

## Troubleshooting

### Services won't start

```bash
# Check logs
docker-compose logs

# Check specific service
docker-compose logs backend
docker-compose logs frontend
docker-compose logs postgres

# Ensure ports are free
netstat -ano | findstr :3000
netstat -ano | findstr :8000
netstat -ano | findstr :5432
```

### Hot reload not working

```bash
# Restart services
docker-compose restart backend frontend

# Rebuild containers
docker-compose up --build
```

### Database connection errors

```bash
# Check PostgreSQL health
docker-compose ps postgres

# Verify credentials
cat .env

# Access database directly
docker-compose exec postgres psql -U postgres -d bruno_pa
```

### "Port already in use" errors

```bash
# Stop existing services
docker-compose down

# Check what's using the port (Windows)
netstat -ano | findstr :<PORT>

# Check what's using the port (macOS/Linux)
lsof -i :<PORT>

# Kill the process or change port in docker-compose.yml
```

## Development Workflow

1. **Edit code** in your IDE on the host machine
2. **Changes sync** automatically via volume mounts
3. **Services reload** and detect changes
4. **Test changes** in browser/API immediately
5. **Commit** when ready

## Network Architecture

All services connect to `bruno-network`:

- Frontend → Backend: `http://backend:8000`
- Backend → PostgreSQL: `postgresql://postgres:5432/bruno_pa`
- Host → All Services: via localhost ports

## Volume Management

### Named Volumes

- `postgres_data` - Database persistence
- `backend_static` - Django static files
- `backend_media` - User uploads

### Anonymous Volumes

- `/app/node_modules` - Frontend dependencies
- `/app/.next` - Next.js build cache

### Cleanup

```bash
# Remove all volumes (WARNING: deletes data)
docker-compose down -v

# Remove specific volume
docker volume rm docker_postgres_data
```

## Documentation

- **Full Setup Guide:** [../docs/setup/DEVELOPMENT.md](../docs/setup/DEVELOPMENT.md)
- **Docker Reference:** [../docs/setup/DOCKER_REFERENCE.md](../docs/setup/DOCKER_REFERENCE.md)
- **API Documentation:** [../docs/api/README.md](../docs/api/README.md)

## Production

⚠️ **Note:** This Docker setup is for development only. For production deployment:

- Use proper secrets management
- Configure SSL/TLS
- Set DEBUG=False
- Use production-grade database hosting
- Implement proper security hardening
- See production deployment documentation (coming in later iterations)

## Support

For issues or questions:

1. Check the [troubleshooting section](#troubleshooting)
2. Review the [full documentation](../docs/setup/DEVELOPMENT.md)
3. Check [GitHub Issues](https://github.com/meggy-ai/webapp/issues)
