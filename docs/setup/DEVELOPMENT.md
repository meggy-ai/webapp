# Bruno-PA Development Setup Guide

This guide will help you set up the Bruno Personal Assistant webapp for local development.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Quick Start with Docker](#quick-start-with-docker)
3. [Manual Setup](#manual-setup)
4. [Environment Variables](#environment-variables)
5. [LLM Provider Setup](#llm-provider-setup)
6. [Running Tests](#running-tests)
7. [Troubleshooting](#troubleshooting)

---

## Prerequisites

### Required Software

- **Node.js** 18+ and npm/yarn
- **Python** 3.11+
- **PostgreSQL** 15+
- **Git**

### Optional (Recommended)

- **Docker** and **Docker Compose** (for containerized development)
- **Ollama** (for open-source LLM support)

### LLM Provider

You need at least one of:

- **OpenAI API Key** (paid service)
- **Ollama** installed locally (free, runs locally)

---

## Quick Start with Docker

This is the **recommended** method for development as it handles all dependencies automatically.

### Step 1: Clone the Repository

```bash
git clone https://github.com/meggy-ai/bruno-pa-webapp.git
cd bruno-pa-webapp
```

### Step 2: Set Up Environment Variables

```bash
# Copy Docker environment file
cp docker/.env.example docker/.env

# Edit the file and add your API keys
# At minimum, add your OPENAI_API_KEY or configure Ollama
```

### Step 3: Start All Services

```bash
cd docker
docker-compose up --build
```

This command will:

- ✅ Build Docker images for frontend and backend
- ✅ Start PostgreSQL 15 database with health checks
- ✅ Run Django migrations automatically
- ✅ Start Django backend on http://localhost:8000 with hot reload
- ✅ Start Next.js frontend on http://localhost:3000 with hot reload
- ✅ Create shared network for container communication
- ✅ Set up volume mounts for live code updates

**Development Features:**

- **Hot Reload:** Both frontend and backend automatically reload on code changes
- **Volume Mounts:** Your local code changes are instantly reflected in containers
- **Shared Network:** All services can communicate using service names (e.g., `postgres`, `backend`)
- **Persistent Data:** PostgreSQL data persists across container restarts

**Running in Background:**

```bash
# Start services in detached mode
docker-compose up -d

# View logs
docker-compose logs -f

# View specific service logs
docker-compose logs -f backend
docker-compose logs -f frontend
```

### Step 4: Create Django Superuser

In a new terminal:

```bash
docker-compose exec backend python manage.py createsuperuser
```

### Step 5: Access the Application

- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:8000/api
- **Django Admin:** http://localhost:8000/admin

### Docker Development Commands

```bash
# Stop all services
docker-compose down

# Stop and remove volumes (fresh start)
docker-compose down -v

# Rebuild containers after dependency changes
docker-compose up --build

# Run Django management commands
docker-compose exec backend python manage.py <command>

# Run shell in backend container
docker-compose exec backend bash

# Run shell in frontend container
docker-compose exec frontend sh

# View container status
docker-compose ps

# Restart specific service
docker-compose restart backend
```

---

## Manual Setup

If you prefer not to use Docker, follow these steps:

### Step 1: Clone and Set Up Database

```bash
git clone https://github.com/meggy-ai/bruno-pa-webapp.git
cd bruno-pa-webapp

# Create PostgreSQL database
psql -U postgres
CREATE DATABASE bruno_pa;
\q
```

### Step 2: Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# On Windows:
venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements/development.txt

# Copy and configure environment variables
cp .env.example .env
# Edit .env with your configuration

# Run migrations
python manage.py migrate

# Create superuser
python manage.py createsuperuser

# Start backend server
python manage.py runserver
```

Backend will run at http://localhost:8000

### Step 3: Frontend Setup

In a new terminal:

```bash
cd frontend

# Install dependencies
npm install

# Copy and configure environment variables
cp .env.example .env.local
# Edit .env.local with your API URL

# Start development server
npm run dev
```

Frontend will run at http://localhost:3000

---

## Docker Configuration Details

### Architecture Overview

The Docker Compose setup creates a complete development environment with:

- **PostgreSQL Container:** Database with persistent storage
- **Backend Container:** Django application with hot reload
- **Frontend Container:** Next.js application with hot reload
- **Shared Network:** `bruno-network` for inter-container communication
- **Volume Mounts:** Live code synchronization between host and containers

### Service Configuration

#### PostgreSQL Service

- **Image:** `postgres:15-alpine`
- **Port:** 5432 (mapped to host)
- **Volume:** `postgres_data` for data persistence
- **Health Check:** Ensures database is ready before backend starts
- **Environment:** Configurable via `.env` file

#### Backend Service (Django)

- **Build Context:** `../backend`
- **Dockerfile:** `backend.Dockerfile`
- **Port:** 8000 (mapped to host)
- **Command:** Automatic migrations + runserver with auto-reload
- **Volumes:**
  - `../backend:/app` - Live code sync
  - `backend_static:/app/staticfiles` - Static files
  - `backend_media:/app/media` - Media uploads
- **Hot Reload:** Django's runserver detects file changes automatically
- **Dependencies:** Waits for PostgreSQL health check
- **Restart Policy:** `unless-stopped`

#### Frontend Service (Next.js)

- **Build Context:** `../frontend`
- **Dockerfile:** `frontend.Dockerfile` (development stage)
- **Port:** 3000 (mapped to host)
- **Command:** `npm run dev` with hot reload
- **Volumes:**
  - `../frontend:/app` - Live code sync
  - `/app/node_modules` - Prevents overwriting
  - `/app/.next` - Build cache persistence
- **Hot Reload:** Next.js Fast Refresh enabled
- **Environment:** `WATCHPACK_POLLING=true` for cross-platform file watching
- **Dependencies:** Waits for backend to start
- **Restart Policy:** `unless-stopped`

### Volume Management

**Named Volumes:**

- `postgres_data` - Database persistence across restarts
- `backend_static` - Django static files
- `backend_media` - User uploaded media

**Anonymous Volumes:**

- `/app/node_modules` - Prevents host node_modules from overwriting container
- `/app/.next` - Preserves Next.js build cache

### Network Configuration

All services connect to `bruno-network` (bridge network):

- Services communicate using service names (e.g., `http://backend:8000`)
- Frontend can access backend at `http://backend:8000`
- Backend can access PostgreSQL at `postgres:5432`
- Host can access all services via localhost ports

### Hot Reload Implementation

**Backend (Django):**

- Django's `runserver` automatically watches Python files
- Changes trigger immediate reload
- Volume mount syncs local changes to container

**Frontend (Next.js):**

- Fast Refresh enabled by default
- `WATCHPACK_POLLING=true` ensures cross-platform file watching
- Works on Windows, macOS, and Linux
- Volume mount syncs local changes to container

### Development Workflow

1. **Code Changes:** Edit files in your IDE on the host machine
2. **Sync:** Volume mounts immediately sync changes to containers
3. **Reload:** Services detect changes and reload automatically
4. **Test:** See changes reflected in browser/API immediately

### Troubleshooting Docker Setup

**Problem:** Containers won't start

**Solution:**

```bash
# Check logs
docker-compose logs

# Check specific service
docker-compose logs backend

# Ensure ports are not in use
netstat -ano | findstr :3000
netstat -ano | findstr :8000
netstat -ano | findstr :5432
```

**Problem:** Hot reload not working

**Solution:**

```bash
# Verify volume mounts
docker-compose exec backend ls -la /app
docker-compose exec frontend ls -la /app

# Check file permissions (Linux/macOS)
ls -la backend/
ls -la frontend/

# Restart services
docker-compose restart backend frontend
```

**Problem:** Database connection errors

**Solution:**

```bash
# Check PostgreSQL is healthy
docker-compose ps postgres

# Verify database credentials in .env
cat docker/.env

# Test database connection
docker-compose exec backend python manage.py dbshell
```

---

## Environment Variables

### Backend (.env)

**Required:**

```env
SECRET_KEY=your-secret-key-here
DATABASE_URL=postgresql://user:password@localhost:5432/bruno_pa
JWT_SECRET_KEY=your-jwt-secret-here
```

**LLM Provider (choose one or both):**

```env
# OpenAI
OPENAI_API_KEY=sk-...

# Ollama
OLLAMA_BASE_URL=http://172.24.163.246:11434
```

**Optional:**

```env
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1
CORS_ALLOWED_ORIGINS=http://localhost:3000
```

### Frontend (.env.local)

**Required:**

```env
NEXT_PUBLIC_API_URL=http://localhost:8000/api
NEXT_PUBLIC_WS_URL=ws://localhost:8000/ws
```

**Optional:**

```env
NEXT_PUBLIC_APP_NAME=Bruno Personal Assistant
NEXT_TELEMETRY_DISABLED=1
```

---

## LLM Provider Setup

### Option 1: OpenAI (Recommended for Production)

1. Sign up at https://platform.openai.com
2. Generate an API key
3. Add to backend `.env`:
   ```env
   OPENAI_API_KEY=sk-...
   DEFAULT_LLM_PROVIDER=openai
   DEFAULT_MODEL=gpt-4
   ```

### Option 2: Ollama (Recommended for Development)

Ollama allows you to run open-source LLMs locally for free.

#### Installation

**macOS/Linux:**

```bash
curl -fsSL https://ollama.com/install.sh | sh
```

**Windows:**
Download from https://ollama.com/download/windows

#### Pull Models

```bash
# Pull a model (e.g., llama2)
ollama pull llama2

# Or pull a smaller model for testing
ollama pull mistral

# Start Ollama server
ollama serve
```

#### Configure Backend

Add to backend `.env`:

```env
OLLAMA_BASE_URL=http://172.24.163.246:11434
DEFAULT_LLM_PROVIDER=ollama
DEFAULT_MODEL=llama2
```

**For Docker:** Use `http://host.docker.internal:11434` instead.

### Option 3: Both (Best for Flexibility)

Configure both providers and switch between them in the app:

```env
OPENAI_API_KEY=sk-...
OLLAMA_BASE_URL=http://172.24.163.246:11434
DEFAULT_LLM_PROVIDER=openai  # or ollama
```

---

## Running Tests

### Backend Tests

```bash
cd backend

# Run all tests
python manage.py test

# Run with coverage
pytest --cov=.

# Run specific app tests
python manage.py test apps.chat
```

### Frontend Tests

```bash
cd frontend

# Run all tests
npm test

# Run with coverage
npm run test:coverage

# Run specific test
npm test -- use-auth.test.tsx

# Run in watch mode
npm test -- --watch
```

---

## Troubleshooting

### Docker Issues

**Problem:** `docker-compose up` fails with port conflicts

**Solution:**

```bash
# Check what's using the ports
netstat -an | grep 3000
netstat -an | grep 8000
netstat -an | grep 5432

# Stop conflicting services or change ports in docker-compose.yml
```

**Problem:** Database connection refused

**Solution:**

```bash
# Check if PostgreSQL container is healthy
docker-compose ps

# View logs
docker-compose logs postgres

# Restart services
docker-compose restart
```

### Backend Issues

**Problem:** `ModuleNotFoundError` when running Django

**Solution:**

```bash
# Ensure virtual environment is activated
source venv/bin/activate  # macOS/Linux
venv\Scripts\activate     # Windows

# Reinstall dependencies
pip install -r requirements/development.txt
```

**Problem:** Database migrations fail

**Solution:**

```bash
# Reset migrations (WARNING: loses data)
python manage.py migrate --fake-initial

# Or drop and recreate database
dropdb bruno_pa
createdb bruno_pa
python manage.py migrate
```

### Frontend Issues

**Problem:** `npm install` fails

**Solution:**

```bash
# Clear npm cache
npm cache clean --force

# Delete node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

**Problem:** API connection refused

**Solution:**

```bash
# Check backend is running
curl http://localhost:8000/api/health

# Verify .env.local has correct API URL
cat .env.local | grep NEXT_PUBLIC_API_URL
```

### LLM Provider Issues

**Problem:** OpenAI API errors

**Solution:**

- Verify API key is correct and has credits
- Check rate limits: https://platform.openai.com/account/rate-limits
- Test with curl:
  ```bash
  curl https://api.openai.com/v1/models \
    -H "Authorization: Bearer $OPENAI_API_KEY"
  ```

**Problem:** Ollama connection refused

**Solution:**

```bash
# Check if Ollama is running
curl http://172.24.163.246:11434/api/version

# Start Ollama
ollama serve

# Pull models if not available
ollama list
ollama pull llama2
```

**Problem:** Ollama in Docker can't connect to host

**Solution:**

```env
# In docker/.env, use:
OLLAMA_BASE_URL=http://host.docker.internal:11434
```

---

## Next Steps

Once your development environment is running:

1. **Explore the API:** Visit http://localhost:8000/api/docs
2. **Create a Test User:** Use the signup form or Django admin
3. **Start a Chat:** Navigate to the chat interface
4. **Review Documentation:** Check the `/docs` folder for more details

---

## Additional Resources

- [Django Documentation](https://docs.djangoproject.com/)
- [Next.js Documentation](https://nextjs.org/docs)
- [Bruno Packages](https://github.com/meggy-ai/bruno-core)
- [Ollama Documentation](https://github.com/ollama/ollama)
- [OpenAI API Reference](https://platform.openai.com/docs/api-reference)

---

## Getting Help

- **Issues:** https://github.com/meggy-ai/bruno-pa-webapp/issues
- **Discussions:** https://github.com/meggy-ai/bruno-pa-webapp/discussions
- **Email:** support@meggy-ai.com
