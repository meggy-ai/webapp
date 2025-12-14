# Bruno Personal Assistant (bruno-pa)

> AI-powered personal assistant web application with chat, timers, notes, and more

**Status:** Iteration 1 - In Development  
**Last Updated:** December 12, 2025

---

## 📋 Project Overview

Bruno-PA is a comprehensive web application that brings together the Bruno AI ecosystem (bruno-core, bruno-llm, bruno-memory, bruno-abilities) into a user-friendly personal assistant platform.

### Key Features (Iteration 1)

- ✅ User authentication and profile management
- ✅ AI-powered chat interface with conversation management
- ✅ Integration with Bruno packages (core, llm, memory)
- ✅ Support for OpenAI and Ollama (open-source LLMs)
- ✅ Responsive design (desktop and mobile)

---

## 🗂️ Repository Structure

This is a monorepo containing both frontend and backend applications:

```
bruno-pa/
├── frontend/              # Next.js 14+ application
│   ├── src/
│   │   ├── app/          # Next.js pages (App Router)
│   │   ├── components/   # React components
│   │   ├── services/     # API service layer
│   │   ├── stores/       # Zustand state management
│   │   ├── types/        # TypeScript types
│   │   ├── hooks/        # Custom React hooks
│   │   └── lib/          # Utilities
│   └── public/           # Static assets
│
├── backend/               # Django 5.0+ application
│   ├── config/           # Django settings
│   ├── apps/             # Django apps
│   │   ├── accounts/    # User management
│   │   ├── agents/      # AI agent instances
│   │   ├── chat/        # Conversations & messages
│   │   └── api/         # REST API endpoints
│   └── core/            # Business logic & Bruno integration
│
├── docker/               # Docker configurations
├── docs/                 # Documentation
├── implementation-plan.md
├── iteration-1-progress.md
└── requirement-overview.md
```

---

## 🚀 Quick Start

### Prerequisites

- **Node.js** 18+ and npm/yarn
- **Python** 3.11+
- **PostgreSQL** 15+
- **Docker** and Docker Compose (recommended)
- **OpenAI API Key** or **Ollama** installed locally

### Option 1: Docker (Recommended)

```bash
# Clone the repository
git clone https://github.com/meggy-ai/bruno-pa-webapp.git
cd bruno-pa-webapp

# Copy environment files
cp frontend/.env.example frontend/.env.local
cp backend/.env.example backend/.env

# Configure your environment variables
# Edit frontend/.env.local and backend/.env

# Start all services
docker-compose up
```

### Option 2: Local Development

#### Frontend Setup

```bash
cd frontend
npm install
cp .env.example .env.local
# Edit .env.local with your API URL
npm run dev
```

Frontend will run at http://localhost:3000

#### Backend Setup

```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements/development.txt
cp .env.example .env
# Edit .env with your configuration
python manage.py migrate
python manage.py createsuperuser
python manage.py runserver
```

Backend API will run at http://localhost:8000

### Option 3: Windows Startup Script (Easiest) ⚡

For Windows users, we provide a convenient startup script that automatically starts all required services:

**Prerequisites:**

- WSL (Windows Subsystem for Linux) with Redis installed
- Python 3.12+ with dependencies installed (see Backend Setup above)
- Node.js 18+ with dependencies installed (see Frontend Setup above)

**Running the script:**

```powershell
.\scripts\start-dev-windows.ps1
```

This script will automatically:

- ✅ Check and start Redis server (via WSL)
- ✅ Start Django backend server (http://localhost:8000)
- ✅ Start timer monitor service (for notifications)
- ✅ Start Next.js frontend (http://localhost:3000)

Each service runs in a separate PowerShell window for easy monitoring.

**Stopping the services:**
Simply close each PowerShell window when you're done developing.

**Note:** The timer monitor service is required for timer notifications to work properly.

---

## 🔧 Technology Stack

### Frontend

- **Next.js 14+** - React framework
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **shadcn/ui** - UI components
- **Zustand** - State management
- **Axios** - HTTP client
- **React Markdown** - Markdown rendering

### Backend

- **Django 5.0+** - Web framework
- **Django REST Framework** - REST API
- **PostgreSQL** - Database
- **JWT** - Authentication
- **Celery** - Background tasks (future)
- **Redis** - Caching (future)

### Bruno Integration

- **bruno-core** - AI agent foundation
- **bruno-llm** - LLM providers (OpenAI, Ollama)
- **bruno-memory** - Conversation memory
- **bruno-abilities** - Timer, alarm, notes, etc. (future)

---

## 📚 Documentation

- **[Project Overview](./project-overview.md)** - Complete project vision and architecture
- **[Requirements](./requirement-overview.md)** - Iteration 1 scope and features
- **[Implementation Plan](./implementation-plan.md)** - Detailed task breakdown
- **[Progress Tracker](./iteration-1-progress.md)** - Real-time development progress
- **[API Documentation](./docs/api/)** - REST API endpoints (coming soon)
- **[Setup Guide](./docs/setup/)** - Detailed setup instructions (coming soon)

---

## 🎯 Current Status

**Phase:** 0 - Project Restructuring (In Progress)  
**Progress:** 15% of Iteration 1

See [iteration-1-progress.md](./iteration-1-progress.md) for detailed progress.

---

## 🤝 Contributing

We welcome contributions! Please see [CONTRIBUTING.md](./CONTRIBUTING.md) for guidelines.

---

## 🔐 Environment Variables

### Frontend (.env.local)

```env
NEXT_PUBLIC_API_URL=http://localhost:8000/api
NEXT_PUBLIC_WS_URL=ws://localhost:8000/ws
```

### Backend (.env)

```env
# Django
SECRET_KEY=your-secret-key-here
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/bruno_pa

# LLM Providers
OPENAI_API_KEY=your-openai-key-here
OLLAMA_BASE_URL=http://localhost:11434

# CORS
CORS_ALLOWED_ORIGINS=http://localhost:3000

# JWT
JWT_SECRET_KEY=your-jwt-secret-here
```

---

## 🧪 Testing

### Frontend Tests

```bash
cd frontend
npm test
npm run test:coverage
```

### Backend Tests

```bash
cd backend
python manage.py test
pytest
```

---

## 📦 Deployment

Deployment guides coming soon for:

- Frontend: Vercel
- Backend: Railway/Render
- Database: Railway/Supabase

---

## 📝 License

MIT License - see [LICENSE](./LICENSE) for details

---

## 🔗 Related Projects

- [bruno-core](https://github.com/meggy-ai/bruno-core) - AI agent foundation
- [bruno-llm](https://github.com/meggy-ai/bruno-llm) - LLM provider integrations
- [bruno-memory](https://github.com/meggy-ai/bruno-memory) - Conversation memory
- [bruno-abilities](https://github.com/meggy-ai/bruno-abilities) - Agent abilities

---

## 📞 Support

- **Documentation:** [docs/](./docs/)
- **Issues:** [GitHub Issues](https://github.com/meggy-ai/bruno-pa-webapp/issues)
- **Discussions:** [GitHub Discussions](https://github.com/meggy-ai/bruno-pa-webapp/discussions)

---

**Built with ❤️ using Bruno AI ecosystem**
