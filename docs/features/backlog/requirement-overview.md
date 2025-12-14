# BRUNO-PA - ITERATION 1 REQUIREMENTS

> **Iteration Goal:** Establish core foundation, restructure into frontend/backend, and implement minimal viable chat functionality

**Iteration Duration:** 2-3 weeks  
**Last Updated:** December 12, 2025

---

## 🎯 ITERATION 1 OBJECTIVES

### Primary Goals

1. **Restructure Application Architecture**
   - Separate frontend (Next.js) and backend (Django) into distinct projects
   - Set up monorepo structure for synchronized development
   - Establish proper folder structure for both applications

2. **Core Backend Foundation**
   - Django 5.0+ project setup with proper app structure
   - Database schema design and migrations
   - Basic REST API with Django REST Framework
   - Authentication system with JWT tokens
   - Integration with bruno-core and bruno-llm

3. **Core Frontend Foundation**
   - Clean up existing Next.js project
   - Implement proper API service layer
   - Set up state management with Zustand
   - Create authentication flow
   - Build foundational UI components

4. **Minimal Chat Functionality**
   - Simple chat interface for text conversations
   - Integration with Bruno agent (bruno-core + bruno-llm)
   - Message persistence and conversation history
   - Basic error handling

---

## 📋 FEATURE SCOPE FOR ITERATION 1

### ✅ IN SCOPE (Must Have)

#### 1. Project Structure & Setup

- Monorepo setup with frontend/ and backend/ directories
- Django project with apps: accounts, agents, chat, api
- Next.js project with cleaned structure
- Docker setup for development environment
- Environment configuration management
- README and setup documentation

#### 2. Backend Core

- **Accounts App**
  - User model extension (timezone, preferences)
  - JWT-based authentication (login, register, logout)
  - Password reset flow
  - User profile endpoint

- **Agents App**
  - Agent model (one default agent per user)
  - Agent configuration (LLM provider, model, parameters)
  - Bruno-core integration service
  - Bruno-llm provider management
  - Agent initialization on user login

- **Chat App**
  - Conversation model
  - Message model
  - REST API endpoints for conversations/messages
  - Message processor service using bruno-core
  - Bruno-memory integration for conversation context

- **API Layer**
  - DRF viewsets for all models
  - Serializers with validation
  - Permission classes
  - Basic API documentation

#### 3. Frontend Core

- **Authentication**
  - Login page
  - Register page
  - Password reset flow
  - JWT token management
  - Auth context provider
  - Protected route wrapper

- **Dashboard Layout**
  - Responsive sidebar navigation
  - Top navigation bar
  - User menu
  - Main content area

- **Chat Interface**
  - Conversation list sidebar
  - Message display area
  - Message input component
  - Send message functionality (REST API)
  - Display user and assistant messages
  - Basic markdown rendering
  - Loading states

- **API Service Layer**
  - Axios client with interceptors
  - Auth service (login, register, logout)
  - Chat service (conversations, messages)
  - Agent service (configuration)
  - Error handling and retry logic

- **State Management**
  - Auth store (user, tokens)
  - Chat store (conversations, messages)
  - Agent store (configuration)

#### 4. Integration & Testing

- bruno-core agent initialization
- bruno-llm OpenAI provider integration
- bruno-memory conversation storage
- Basic error handling and logging
- Development environment smoke tests

---

### 🚫 OUT OF SCOPE (Future Iterations)

#### Deferred to Iteration 2+

- WebSocket/real-time streaming responses
- Voice input/output
- File attachments
- Image/media support
- Advanced markdown features
- Conversation search
- Conversation export
- Message editing/deletion
- Regenerate responses

#### Deferred to Iteration 3+

- All ability interfaces (timer, alarm, notes, etc.)
- Ability execution framework
- Ability history tracking
- Custom ability configuration

#### Deferred to Iteration 4+

- Usage analytics and dashboards
- Conversation history visualization
- Personal insights
- Subscription management
- Multi-agent support

#### Deferred to Later

- Social authentication (OAuth)
- Two-factor authentication
- Email verification
- Advanced user preferences
- Theme customization
- Notification system
- PWA features
- Advanced security hardening
- Performance optimizations

---

## 🗂️ MONOREPO STRUCTURE

```
bruno-pa/
├── frontend/                    # Next.js application
│   ├── src/
│   │   ├── app/                # App router pages
│   │   │   ├── (auth)/         # Auth pages
│   │   │   │   ├── login/
│   │   │   │   └── register/
│   │   │   ├── (dashboard)/    # Protected pages
│   │   │   │   ├── chat/
│   │   │   │   └── settings/
│   │   │   ├── layout.tsx
│   │   │   └── page.tsx
│   │   ├── components/         # React components
│   │   │   ├── ui/            # shadcn components
│   │   │   ├── auth/          # Auth components
│   │   │   ├── chat/          # Chat components
│   │   │   └── layouts/       # Layout components
│   │   ├── hooks/             # Custom hooks
│   │   ├── services/          # API service layer
│   │   ├── stores/            # Zustand stores
│   │   ├── types/             # TypeScript types
│   │   └── lib/               # Utils and helpers
│   ├── public/
│   ├── package.json
│   ├── tsconfig.json
│   └── next.config.js
│
├── backend/                     # Django application
│   ├── config/                 # Project settings
│   │   ├── settings/
│   │   │   ├── base.py
│   │   │   ├── development.py
│   │   │   └── production.py
│   │   ├── urls.py
│   │   ├── asgi.py
│   │   └── wsgi.py
│   ├── apps/                   # Django apps
│   │   ├── accounts/          # User management
│   │   ├── agents/            # Agent instances
│   │   ├── chat/              # Conversations & messages
│   │   └── api/               # REST API
│   ├── core/                   # Business logic
│   │   ├── bruno_integration/ # Bruno package wrappers
│   │   └── services/          # Shared services
│   ├── manage.py
│   └── requirements/
│       ├── base.txt
│       ├── development.txt
│       └── production.txt
│
├── docker/                      # Docker configs
│   ├── frontend.Dockerfile
│   ├── backend.Dockerfile
│   └── docker-compose.yml
│
├── docs/                        # Documentation
│   ├── api/                    # API documentation
│   └── setup/                  # Setup guides
│
├── .gitignore
├── README.md
└── ITERATION-1-PROGRESS.md     # Progress tracker
```

---

## 🔧 TECHNOLOGY STACK (ITERATION 1)

### Backend

- **Django 5.0+** - Web framework
- **Django REST Framework** - REST API
- **djangorestframework-simplejwt** - JWT authentication
- **django-cors-headers** - CORS support
- **psycopg2-binary** - PostgreSQL adapter
- **python-decouple** - Environment config
- **bruno-core** - Agent foundation
- **bruno-llm** - LLM provider (OpenAI)
- **bruno-memory** - Conversation storage

### Frontend

- **Next.js 14+** - React framework
- **React 18** - UI library
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **shadcn/ui** - UI components
- **Zustand** - State management
- **Axios** - HTTP client
- **React Hook Form** - Forms
- **Zod** - Validation
- **React Markdown** - Markdown rendering

### Database & Cache

- **PostgreSQL 15+** - Primary database
- **Redis** (optional, for future iterations)

### Development Tools

- **Docker & Docker Compose** - Containerization
- **Git** - Version control
- **ESLint & Prettier** - Code quality
- **pytest** - Backend testing
- **Jest** - Frontend testing

---

## 🎨 USER FLOWS (ITERATION 1)

### 1. Registration Flow

1. User visits /register
2. User fills registration form (name, email, password)
3. System creates user account
4. System creates default agent for user
5. User is logged in automatically
6. User is redirected to /chat

### 2. Login Flow

1. User visits /login
2. User enters email and password
3. System validates credentials
4. System returns JWT tokens
5. Frontend stores tokens
6. User is redirected to /chat

### 3. Chat Flow

1. User sees empty chat interface
2. User clicks "New Conversation" or types in input
3. User types message and clicks send
4. Frontend sends message via REST API
5. Backend processes message with Bruno agent
6. Backend stores message and response
7. Backend returns response to frontend
8. Frontend displays assistant response
9. User can continue conversation

### 4. Conversation Management

1. User can see list of conversations in sidebar
2. User can click conversation to view messages
3. User can create new conversation
4. User can see conversation title (auto-generated from first message)

---

## 📊 SUCCESS CRITERIA

### Functional Requirements

- ✅ User can register and create account
- ✅ User can login with email/password
- ✅ User can logout
- ✅ User can send chat messages
- ✅ System responds using Bruno agent
- ✅ Conversations are persisted
- ✅ User can view conversation history
- ✅ User can create multiple conversations
- ✅ User can switch between conversations

### Technical Requirements

- ✅ Frontend and backend are separate projects
- ✅ API is RESTful and documented
- ✅ Authentication uses JWT tokens
- ✅ Database migrations are automated
- ✅ Development environment runs in Docker
- ✅ Code follows style guidelines
- ✅ Basic error handling is implemented
- ✅ Environment variables are used for configuration

### Quality Requirements

- ✅ API response time < 500ms (excluding LLM calls)
- ✅ LLM response time < 10s
- ✅ UI is responsive (mobile-friendly)
- ✅ No console errors in browser
- ✅ No critical security vulnerabilities
- ✅ Code is properly documented

---

## 🚀 DEPLOYMENT (ITERATION 1)

### Development Environment

- Docker Compose with PostgreSQL, Django, and Next.js
- Hot reload enabled for both frontend and backend
- Shared network for container communication
- Volume mounts for live code updates

### Production (Future)

- Deferred to later iterations
- Will use proper hosting (Vercel for frontend, Railway/Render for backend)

---

## 📝 NOTES & ASSUMPTIONS

### Assumptions

1. Users will use OpenAI API for LLM (bruno-llm)
2. Users provide their own OpenAI API key in agent configuration
3. Basic conversation memory is sufficient for iteration 1
4. No real-time streaming needed in iteration 1 (REST is sufficient)
5. English-only interface for iteration 1
6. Desktop-first design (mobile support but not optimized)

### Risks & Mitigations

1. **Risk:** Bruno package integration issues  
   **Mitigation:** Test integration early, maintain close communication with package documentation

2. **Risk:** Database schema changes  
   **Mitigation:** Plan schema carefully upfront, use migrations properly

3. **Risk:** Authentication security  
   **Mitigation:** Use well-tested libraries (simplejwt), follow Django security best practices

4. **Risk:** Scope creep  
   **Mitigation:** Stick strictly to defined scope, document deferred features clearly

---

## 📚 DOCUMENTATION REQUIREMENTS

### Developer Documentation

- Setup instructions for local development
- API endpoint documentation
- Database schema documentation
- Authentication flow documentation
- Bruno integration guide

### User Documentation

- How to register and login
- How to use chat interface
- How to manage conversations
- FAQ for common issues

---

## ✅ DEFINITION OF DONE

An iteration 1 feature is considered "done" when:

1. ✅ Code is written and follows style guidelines
2. ✅ Code is reviewed (if working in team)
3. ✅ Unit tests are written (where applicable)
4. ✅ Feature works in development environment
5. ✅ API endpoint is documented
6. ✅ No known critical bugs
7. ✅ Error handling is implemented
8. ✅ Commits are properly documented
9. ✅ README is updated if needed

---

**Ready to proceed to implementation planning!** 🎉
