# Meggy AI Frontend - Development Plan

## 📋 Project Overview

**Project Name:** Meggy AI Frontend  
**Platform:** India's First Open Source AI Platform  
**Purpose:** Building agents for personal AI assistants, AI friends, and various use cases  
**Repository:** https://github.com/meggy-ai/frontend

### Technology Stack

**Frontend Framework:**
- **Next.js 14+** (App Router with React Server Components)
- **TypeScript** (Full type safety)
- **Tailwind CSS** (Utility-first styling)
- **shadcn/ui** (Headless, accessible components)

**State Management & Data Fetching:**
- **Zustand** (Lightweight state management)
- **TanStack Query (React Query)** (Server state management)
- **SWR** (Alternative for real-time data)

**Chat Module Specific:**
- **Vercel AI SDK** (Streaming AI responses)
- **Socket.io-client** or **Django Channels client** (WebSocket/real-time)
- **react-markdown** + **remark-gfm** (Markdown rendering)
- **react-syntax-highlighter** (Code highlighting)
- **framer-motion** (Smooth animations)

**Backend Integration:**
- **Django 5.x** (REST API)
- **Django REST Framework** (API endpoints)
- **Django Channels** (WebSocket support)
- **Django CORS Headers** (Cross-origin requests)

**Design System:**
- **Color Palette:** Zinc/Slate scale (GitHub/Medium dark theme inspired)
- **Typography:** Inter or Geist font
- **Theme:** Minimalistic black & white with dark mode focus

**Development Tools:**
- **ESLint** + **Prettier** (Code quality)
- **Husky** + **lint-staged** (Git hooks with pre-commit checks)
- **commitlint** (Commit message validation - Conventional Commits)
- **Jest** + **React Testing Library** (Unit tests)
- **Playwright** or **Cypress** (E2E tests)
- **Storybook** (Component documentation - optional for Phase 1)

**CI/CD & Deployment:**
- **GitHub Actions** (CI/CD pipeline with starter templates)
- **Vercel** (Recommended for easy deployment) or **Self-hosted**
- **Docker** (Containerization for production/self-hosted)

---

## 🎯 Project Goals

1. **Mobile-First Design:** Optimized for mobile devices with responsive layouts
2. **Minimalistic UI:** Clean, distraction-free interface inspired by GitHub/Medium dark themes
3. **Real-time Chat:** Streaming AI responses with WebSocket support
4. **Modular Architecture:** Plugin-based system aligned with bruno-core and bruno-llm
5. **Open Source Excellence:** Well-documented, tested, and contributor-friendly
6. **Production Ready:** Scalable, performant, and maintainable codebase

---

## 📐 Repository Structure

```
frontend/
├── .github/                      # GitHub specific files
│   ├── workflows/                # CI/CD workflows
│   │   ├── ci.yml               # Continuous Integration
│   │   ├── cd.yml               # Continuous Deployment
│   │   ├── test.yml             # Test automation
│   │   └── release.yml          # Release automation
│   ├── ISSUE_TEMPLATE/          # Issue templates
│   ├── PULL_REQUEST_TEMPLATE.md # PR template
│   └── dependabot.yml           # Dependency updates
│
├── .vscode/                      # VS Code settings
│   ├── settings.json            # Workspace settings
│   ├── extensions.json          # Recommended extensions
│   └── launch.json              # Debug configurations
│
├── public/                       # Static assets
│   ├── images/                  # Image assets
│   ├── fonts/                   # Custom fonts
│   ├── favicon.ico              # Favicon
│   └── manifest.json            # PWA manifest
│
├── src/                          # Source code
│   ├── app/                     # Next.js App Router
│   │   ├── (auth)/              # Auth route group
│   │   │   ├── login/           # Login page
│   │   │   └── register/        # Register page
│   │   ├── (dashboard)/         # Dashboard route group
│   │   │   ├── layout.tsx       # Dashboard layout
│   │   │   ├── page.tsx         # Dashboard home
│   │   │   ├── chat/            # Chat module
│   │   │   ├── agents/          # Agent management
│   │   │   ├── settings/        # User settings
│   │   │   └── profile/         # User profile
│   │   ├── api/                 # API routes (Next.js)
│   │   │   ├── auth/            # Auth endpoints
│   │   │   ├── chat/            # Chat endpoints
│   │   │   └── health/          # Health check
│   │   ├── layout.tsx           # Root layout
│   │   ├── page.tsx             # Landing page
│   │   ├── globals.css          # Global styles
│   │   └── providers.tsx        # Context providers
│   │
│   ├── components/              # React components
│   │   ├── ui/                  # shadcn/ui components
│   │   │   ├── button.tsx
│   │   │   ├── input.tsx
│   │   │   ├── card.tsx
│   │   │   └── ...
│   │   ├── chat/                # Chat components
│   │   │   ├── ChatContainer.tsx
│   │   │   ├── MessageList.tsx
│   │   │   ├── MessageInput.tsx
│   │   │   ├── StreamingMessage.tsx
│   │   │   └── CodeBlock.tsx
│   │   ├── layout/              # Layout components
│   │   │   ├── Header.tsx
│   │   │   ├── Sidebar.tsx
│   │   │   ├── Footer.tsx
│   │   │   └── Navigation.tsx
│   │   ├── agents/              # Agent components
│   │   │   ├── AgentCard.tsx
│   │   │   ├── AgentList.tsx
│   │   │   └── AgentForm.tsx
│   │   └── shared/              # Shared components
│   │       ├── Loading.tsx
│   │       ├── ErrorBoundary.tsx
│   │       └── ThemeToggle.tsx
│   │
│   ├── lib/                     # Utility libraries
│   │   ├── api/                 # API client
│   │   │   ├── client.ts        # Axios/Fetch wrapper
│   │   │   ├── endpoints.ts     # API endpoints
│   │   │   └── websocket.ts     # WebSocket client
│   │   ├── hooks/               # Custom React hooks
│   │   │   ├── useAuth.ts
│   │   │   ├── useChat.ts
│   │   │   ├── useWebSocket.ts
│   │   │   └── useAgents.ts
│   │   ├── stores/              # Zustand stores
│   │   │   ├── authStore.ts
│   │   │   ├── chatStore.ts
│   │   │   └── agentStore.ts
│   │   ├── utils/               # Utility functions
│   │   │   ├── cn.ts            # Class name utility
│   │   │   ├── formatters.ts    # Data formatters
│   │   │   └── validators.ts    # Input validators
│   │   └── constants/           # Constants
│   │       ├── routes.ts
│   │       ├── api.ts
│   │       └── theme.ts
│   │
│   ├── types/                   # TypeScript types
│   │   ├── api.ts               # API types
│   │   ├── chat.ts              # Chat types
│   │   ├── agent.ts             # Agent types
│   │   └── user.ts              # User types
│   │
│   ├── styles/                  # Additional styles
│   │   ├── theme.css            # Theme variables
│   │   └── animations.css       # Custom animations
│   │
│   └── config/                  # Configuration files
│       ├── env.ts               # Environment variables
│       ├── site.ts              # Site configuration
│       └── api.ts               # API configuration
│
├── tests/                        # Test files
│   ├── unit/                    # Unit tests
│   │   ├── components/
│   │   ├── hooks/
│   │   └── utils/
│   ├── integration/             # Integration tests
│   │   ├── api/
│   │   └── chat/
│   ├── e2e/                     # End-to-end tests
│   │   ├── auth.spec.ts
│   │   ├── chat.spec.ts
│   │   └── agents.spec.ts
│   └── setup/                   # Test setup
│       ├── jest.setup.ts
│       └── test-utils.tsx
│
├── docs/                         # Documentation
│   ├── architecture/            # Architecture docs
│   │   ├── overview.md
│   │   ├── chat-module.md
│   │   └── state-management.md
│   ├── api/                     # API documentation
│   │   ├── rest-api.md
│   │   └── websocket-api.md
│   ├── guides/                  # Development guides
│   │   ├── getting-started.md
│   │   ├── component-guide.md
│   │   └── testing-guide.md
│   └── DEPLOYMENT.md            # Deployment guide
│
├── scripts/                      # Build and utility scripts
│   ├── setup.sh                 # Initial setup script
│   ├── dev.sh                   # Development script
│   ├── build.sh                 # Build script
│   └── deploy.sh                # Deployment script
│
├── docker/                       # Docker files
│   ├── Dockerfile               # Production Dockerfile
│   ├── Dockerfile.dev           # Development Dockerfile
│   └── docker-compose.yml       # Docker Compose
│
├── .env.example                  # Environment variables template
├── .env.local                    # Local environment (gitignored)
├── .eslintrc.json               # ESLint configuration
├── .prettierrc                  # Prettier configuration
├── .gitignore                   # Git ignore rules
├── jest.config.js               # Jest configuration
├── next.config.js               # Next.js configuration
├── tailwind.config.ts           # Tailwind configuration
├── tsconfig.json                # TypeScript configuration
├── package.json                 # Dependencies
├── pnpm-lock.yaml               # Lock file (using pnpm)
│
├── CHANGELOG.md                 # Version history
├── CONTRIBUTING.md              # Contribution guidelines
├── CODE_OF_CONDUCT.md           # Code of conduct
├── LICENSE                      # MIT License
├── README.md                    # Project overview
├── DEVELOPMENT_PLAN.md          # This file
└── PROGRESS_TRACKER.md          # Implementation progress

```

---

## 📊 Development Phases

### **PHASE 0: Project Setup & Infrastructure** 
**Status:** 🔲 Not Started  
**Timeline:** Week 1  
**Priority:** Critical

#### Parent Task 0.1: Repository Structure Setup
- [ ] 0.1.1 - Initialize Next.js 14 project with TypeScript
- [ ] 0.1.2 - Configure Tailwind CSS and PostCSS
- [ ] 0.1.3 - Install and configure shadcn/ui
- [ ] 0.1.4 - Set up folder structure as per specification
- [ ] 0.1.5 - Create .env.example with all required variables

#### Parent Task 0.2: Development Environment
- [ ] 0.2.1 - Configure ESLint and Prettier
- [ ] 0.2.2 - Set up Husky and lint-staged (pre-commit hooks)
- [ ] 0.2.3 - Configure pre-commit checks (lint, format, type-check)
- [ ] 0.2.4 - Add commitlint for commit message validation
- [ ] 0.2.5 - Configure VS Code settings and extensions
- [ ] 0.2.6 - Set up TypeScript strict mode
- [ ] 0.2.7 - Configure path aliases (@/, @components/, etc.)

#### Parent Task 0.3: Git & GitHub Setup
- [ ] 0.3.1 - Create .gitignore with Next.js defaults
- [ ] 0.3.2 - Set up branch protection rules
- [ ] 0.3.3 - Create issue templates
- [ ] 0.3.4 - Create pull request template
- [ ] 0.3.5 - Configure Dependabot

#### Parent Task 0.4: Documentation Foundation
- [ ] 0.4.1 - Write comprehensive README.md
- [ ] 0.4.2 - Create CONTRIBUTING.md
- [ ] 0.4.3 - Add CODE_OF_CONDUCT.md
- [ ] 0.4.4 - Create LICENSE (MIT)
- [ ] 0.4.5 - Initialize CHANGELOG.md

---

### **PHASE 1: Core Foundation & Design System**
**Status:** 🔲 Not Started  
**Timeline:** Week 2-3  
**Priority:** Critical

#### Parent Task 1.1: Design System Setup
- [ ] 1.1.1 - Define color palette (Zinc/Slate for dark theme)
- [ ] 1.1.2 - Configure custom fonts (Inter/Geist)
- [ ] 1.1.3 - Set up Tailwind theme with custom colors
- [ ] 1.1.4 - Create CSS variables for theme switching
- [ ] 1.1.5 - Implement dark mode toggle

#### Parent Task 1.2: UI Component Library
- [ ] 1.2.1 - Install shadcn/ui base components (Button, Input, Card, etc.)
- [ ] 1.2.2 - Customize components for meggy-ai theme
- [ ] 1.2.3 - Create component documentation with Storybook
- [ ] 1.2.4 - Build layout components (Header, Sidebar, Footer)
- [ ] 1.2.5 - Create shared utility components (Loading, Error, etc.)

#### Parent Task 1.3: Layout & Navigation
- [ ] 1.3.1 - Build root layout with navigation
- [ ] 1.3.2 - Create dashboard layout
- [ ] 1.3.3 - Implement responsive sidebar
- [ ] 1.3.4 - Add mobile navigation drawer
- [ ] 1.3.5 - Create breadcrumb navigation

#### Parent Task 1.4: Type System & Constants
- [ ] 1.4.1 - Define TypeScript types for API responses
- [ ] 1.4.2 - Create types for chat messages and agents
- [ ] 1.4.3 - Set up API endpoint constants
- [ ] 1.4.4 - Define route constants
- [ ] 1.4.5 - Create error type definitions

---

### **PHASE 2: Backend Integration & API Layer**
**Status:** 🔲 Not Started  
**Timeline:** Week 4-5  
**Priority:** High

#### Parent Task 2.1: Django Backend Setup (Parallel Development)
- [ ] 2.1.1 - Set up Django 5.x project structure
- [ ] 2.1.2 - Configure Django REST Framework
- [ ] 2.1.3 - Set up Django CORS headers
- [ ] 2.1.4 - Configure Django Channels for WebSocket
- [ ] 2.1.5 - Set up Redis for message queue

#### Parent Task 2.2: API Client Layer
- [ ] 2.2.1 - Create Axios/Fetch wrapper with interceptors
- [ ] 2.2.2 - Implement request/response error handling
- [ ] 2.2.3 - Add authentication token management
- [ ] 2.2.4 - Create API endpoint definitions
- [ ] 2.2.5 - Set up TanStack Query (React Query) configuration

#### Parent Task 2.3: WebSocket Integration
- [ ] 2.3.1 - Create WebSocket client wrapper
- [ ] 2.3.2 - Implement connection state management
- [ ] 2.3.3 - Add reconnection logic
- [ ] 2.3.4 - Create event handlers for chat messages
- [ ] 2.3.5 - Implement heartbeat/ping-pong mechanism

#### Parent Task 2.4: State Management
- [ ] 2.4.1 - Create Zustand store structure
- [ ] 2.4.2 - Implement auth store (user, token, login/logout)
- [ ] 2.4.3 - Create chat store (messages, conversations)
- [ ] 2.4.4 - Build agent store (agent list, active agent)
- [ ] 2.4.5 - Add persistence middleware (localStorage)

---

### **PHASE 3: Authentication & User Management**
**Status:** 🔲 Not Started  
**Timeline:** Week 5-6  
**Priority:** High

#### Authentication Features Overview

**Complete Authentication System includes:**

1. **User Registration** (/register)
   - Email + password signup
   - Form validation (password strength, email format)
   - Terms of service acceptance
   - Automatic email verification trigger
   - Success message with next steps

2. **User Login** (/login)
   - Email + password authentication
   - "Remember Me" checkbox
   - OAuth options (Google, GitHub)
   - Redirect to dashboard on success
   - Error handling (invalid credentials, account not verified)

3. **User Logout** 
   - Logout button in header/sidebar
   - Clear tokens from localStorage/cookies
   - Redirect to landing/login page
   - Optional: "Are you sure?" confirmation

4. **Forgot Password** (/forgot-password)
   - Email input form
   - Send password reset email with token
   - Success message: "Check your email"
   - Rate limiting (prevent abuse)

5. **Reset Password** (/reset-password?token=xxx)
   - Validate reset token from email link
   - New password + confirm password form
   - Password strength indicator
   - Success message + redirect to login
   - Handle expired/invalid tokens

6. **Email Verification** (/verify-email?token=xxx)
   - Verify email from registration
   - Show success/error message
   - Automatic redirect to login
   - Resend verification email option

7. **Session Management**
   - JWT access token (short-lived, 15 min)
   - JWT refresh token (long-lived, 7 days)
   - Auto-refresh before expiry
   - Auto-logout on token expiration
   - Protected routes (redirect if not authenticated)

#### Parent Task 3.1: Auth Pages (UI/Forms)
- [ ] 3.1.1 - Create login page with form validation (email + password)
- [ ] 3.1.2 - Build user registration page with validation (email, password, confirm password, name)
- [ ] 3.1.3 - Add "Forgot Password" page (email input to request reset)
- [ ] 3.1.4 - Create "Reset Password" page (new password form with token validation)
- [ ] 3.1.5 - Implement email verification page (verify account after registration)
- [ ] 3.1.6 - Add OAuth integration (Google, GitHub social login)
- [ ] 3.1.7 - Create logout confirmation (optional modal/redirect)

#### Parent Task 3.2: Auth Logic & Hooks
- [ ] 3.2.1 - Create useAuth hook (login, logout, register, getCurrentUser)
- [ ] 3.2.2 - Implement JWT token management (access token + refresh token)
- [ ] 3.2.3 - Add protected route middleware (redirect to login if not authenticated)
- [ ] 3.2.4 - Create auth context provider (global auth state)
- [ ] 3.2.5 - Implement auto-logout on token expiry
- [ ] 3.2.6 - Add "Remember Me" functionality (persistent sessions)

#### Parent Task 3.3: User Profile & Settings
- [ ] 3.3.1 - Build user profile page
- [ ] 3.3.2 - Create profile edit form
- [ ] 3.3.3 - Add avatar upload functionality
- [ ] 3.3.4 - Implement settings page (preferences, theme, etc.)
- [ ] 3.3.5 - Add password change functionality

---

### **PHASE 4: Chat Module Development** 🎯 **CORE FEATURE**
**Status:** 🔲 Not Started  
**Timeline:** Week 7-9  
**Priority:** Critical

#### Parent Task 4.1: Chat UI Components
- [ ] 4.1.1 - Create ChatContainer layout
- [ ] 4.1.2 - Build MessageList with virtual scrolling
- [ ] 4.1.3 - Create MessageBubble component (user/assistant)
- [ ] 4.1.4 - Implement MessageInput with auto-resize
- [ ] 4.1.5 - Add typing indicator component

#### Parent Task 4.2: Chat Functionality
- [ ] 4.2.1 - Implement send message functionality
- [ ] 4.2.2 - Add message history loading (infinite scroll)
- [ ] 4.2.3 - Create conversation management (new chat, list chats)
- [ ] 4.2.4 - Add message delete/edit functionality
- [ ] 4.2.5 - Implement search within chat

#### Parent Task 4.3: Streaming & Real-time
- [ ] 4.3.1 - Integrate Vercel AI SDK for streaming
- [ ] 4.3.2 - Create StreamingMessage component
- [ ] 4.3.3 - Implement token-by-token rendering
- [ ] 4.3.4 - Add WebSocket message handling
- [ ] 4.3.5 - Create streaming cancellation

#### Parent Task 4.4: Rich Content Support
- [ ] 4.4.1 - Integrate react-markdown for message rendering
- [ ] 4.4.2 - Add syntax highlighting with react-syntax-highlighter
- [ ] 4.4.3 - Implement code block copy functionality
- [ ] 4.4.4 - Add image/file preview
- [ ] 4.4.5 - Create LaTeX rendering support (optional)

#### Parent Task 4.5: Chat Enhancements
- [ ] 4.5.1 - Add voice input (Web Speech API)
- [ ] 4.5.2 - Implement message reactions/emoji
- [ ] 4.5.3 - Create message export functionality (PDF/JSON)
- [ ] 4.5.4 - Add chat templates/prompts
- [ ] 4.5.5 - Implement multi-agent conversation UI

---

### **PHASE 5: Agent Management**
**Status:** 🔲 Not Started  
**Timeline:** Week 10-11  
**Priority:** High

#### Parent Task 5.1: Agent UI
- [ ] 5.1.1 - Create agent listing page
- [ ] 5.1.2 - Build AgentCard component
- [ ] 5.1.3 - Implement agent detail/preview modal
- [ ] 5.1.4 - Add agent creation wizard
- [ ] 5.1.5 - Create agent edit form

#### Parent Task 5.2: Agent Configuration
- [ ] 5.2.1 - Build LLM provider selection UI
- [ ] 5.2.2 - Create system prompt editor
- [ ] 5.2.3 - Add ability/plugin configuration
- [ ] 5.2.4 - Implement agent parameters (temperature, max_tokens, etc.)
- [ ] 5.2.5 - Create agent sharing/export functionality

#### Parent Task 5.3: Agent Integration
- [ ] 5.3.1 - Connect agent selection to chat module
- [ ] 5.3.2 - Implement agent switching in active chat
- [ ] 5.3.3 - Add agent status indicators
- [ ] 5.3.4 - Create agent performance metrics
- [ ] 5.3.5 - Implement agent version control

---

### **PHASE 6: Dashboard & Analytics**
**Status:** 🔲 Not Started  
**Timeline:** Week 12  
**Priority:** Medium

#### Parent Task 6.1: Dashboard Home
- [ ] 6.1.1 - Create dashboard overview page
- [ ] 6.1.2 - Add recent conversations widget
- [ ] 6.1.3 - Build quick actions panel
- [ ] 6.1.4 - Create agent statistics cards
- [ ] 6.1.5 - Add activity feed

#### Parent Task 6.2: Analytics & Insights
- [ ] 6.2.1 - Implement usage statistics page
- [ ] 6.2.2 - Create charts with recharts/Chart.js
- [ ] 6.2.3 - Add conversation analytics
- [ ] 6.2.4 - Build cost tracking (API usage)
- [ ] 6.2.5 - Create export reports functionality

---

### **PHASE 7: Testing & Quality Assurance**
**Status:** 🔲 Not Started  
**Timeline:** Week 13-14  
**Priority:** High

#### Parent Task 7.1: Unit Testing
- [ ] 7.1.1 - Set up Jest and React Testing Library
- [ ] 7.1.2 - Write component tests (UI components)
- [ ] 7.1.3 - Test custom hooks
- [ ] 7.1.4 - Test utility functions
- [ ] 7.1.5 - Achieve 80%+ code coverage

#### Parent Task 7.2: Integration Testing
- [ ] 7.2.1 - Test API integration with MSW (Mock Service Worker)
- [ ] 7.2.2 - Test WebSocket connections
- [ ] 7.2.3 - Test authentication flows
- [ ] 7.2.4 - Test chat functionality
- [ ] 7.2.5 - Test agent management

#### Parent Task 7.3: E2E Testing
- [ ] 7.3.1 - Set up Playwright or Cypress
- [ ] 7.3.2 - Write auth flow E2E tests
- [ ] 7.3.3 - Write chat interaction E2E tests
- [ ] 7.3.4 - Write agent creation E2E tests
- [ ] 7.3.5 - Test cross-browser compatibility

#### Parent Task 7.4: Accessibility & Performance
- [ ] 7.4.1 - Run Lighthouse audits
- [ ] 7.4.2 - Fix accessibility issues (WCAG 2.1 AA)
- [ ] 7.4.3 - Optimize bundle size
- [ ] 7.4.4 - Implement lazy loading
- [ ] 7.4.5 - Add performance monitoring

---

### **PHASE 8: CI/CD & DevOps**
**Status:** 🔲 Not Started  
**Timeline:** Week 15  
**Priority:** High

#### Parent Task 8.1: GitHub Actions Setup
- [ ] 8.1.1 - Create simple CI workflow using Next.js starter template (lint, test, build)
- [ ] 8.1.2 - Add basic CD workflow for staging (start simple, iterate later)
- [ ] 8.1.3 - Create production deployment workflow (use Vercel or standard Next.js template)
- [ ] 8.1.4 - Set up automatic PR preview deployments (Vercel integration)
- [ ] 8.1.5 - Add security scanning (Dependabot for starters, expand with Snyk later)

#### Parent Task 8.2: Docker & Containerization
- [ ] 8.2.1 - Create production Dockerfile
- [ ] 8.2.2 - Create development Dockerfile
- [ ] 8.2.3 - Set up docker-compose for local development
- [ ] 8.2.4 - Optimize Docker image size
- [ ] 8.2.5 - Create multi-stage builds

#### Parent Task 8.3: Deployment Setup
- [ ] 8.3.1 - Configure environment variables for production
- [ ] 8.3.2 - Set up domain and SSL certificates
- [ ] 8.3.3 - Configure CDN (Cloudflare/CloudFront)
- [ ] 8.3.4 - Implement health checks and monitoring
- [ ] 8.3.5 - Set up error tracking (Sentry)

---

### **PHASE 9: Documentation & Community**
**Status:** 🔲 Not Started  
**Timeline:** Week 16  
**Priority:** Medium

#### Parent Task 9.1: Technical Documentation
- [ ] 9.1.1 - Write architecture overview
- [ ] 9.1.2 - Document API integration
- [ ] 9.1.3 - Create component documentation
- [ ] 9.1.4 - Write testing guide
- [ ] 9.1.5 - Create deployment guide

#### Parent Task 9.2: User Documentation
- [ ] 9.2.1 - Create getting started guide
- [ ] 9.2.2 - Write user manual
- [ ] 9.2.3 - Add troubleshooting guide
- [ ] 9.2.4 - Create FAQ
- [ ] 9.2.5 - Record demo videos

#### Parent Task 9.3: Contributor Guide
- [ ] 9.3.1 - Write detailed CONTRIBUTING.md
- [ ] 9.3.2 - Create development setup guide
- [ ] 9.3.3 - Document code style guidelines
- [ ] 9.3.4 - Add PR review process
- [ ] 9.3.5 - Create "good first issue" labels

---

### **PHASE 10: Polish & Launch Preparation**
**Status:** 🔲 Not Started  
**Timeline:** Week 17-18  
**Priority:** Medium

#### Parent Task 10.1: UI/UX Polish
- [ ] 10.1.1 - Conduct UI/UX review
- [ ] 10.1.2 - Add loading states and skeletons
- [ ] 10.1.3 - Implement smooth transitions/animations
- [ ] 10.1.4 - Add error state illustrations
- [ ] 10.1.5 - Create empty state designs

#### Parent Task 10.2: Performance Optimization
- [ ] 10.2.1 - Optimize images (WebP, lazy loading)
- [ ] 10.2.2 - Implement code splitting
- [ ] 10.2.3 - Add service worker for caching
- [ ] 10.2.4 - Optimize font loading
- [ ] 10.2.5 - Reduce JavaScript bundle size

#### Parent Task 10.3: Security Hardening
- [ ] 10.3.1 - Implement Content Security Policy
- [ ] 10.3.2 - Add rate limiting
- [ ] 10.3.3 - Sanitize user inputs
- [ ] 10.3.4 - Add CSRF protection
- [ ] 10.3.5 - Conduct security audit

#### Parent Task 10.4: Launch Checklist
- [ ] 10.4.1 - Set up analytics (Google Analytics/Plausible)
- [ ] 10.4.2 - Add social meta tags (Open Graph, Twitter)
- [ ] 10.4.3 - Create sitemap.xml
- [ ] 10.4.4 - Set up robots.txt
- [ ] 10.4.5 - Perform final testing

---

## 🎨 Design Specifications

### Color Palette (Inspired by GitHub/Medium Dark)

```css
/* Dark Theme (Primary) */
--background: 0 0% 8%;          /* #141414 - Almost black */
--foreground: 0 0% 95%;         /* #F2F2F2 - Off white */

--card: 0 0% 10%;               /* #1A1A1A - Dark gray */
--card-foreground: 0 0% 95%;    /* #F2F2F2 - Off white */

--primary: 0 0% 98%;            /* #FAFAFA - Near white */
--primary-foreground: 0 0% 9%;  /* #171717 - Dark */

--secondary: 0 0% 15%;          /* #262626 - Medium gray */
--secondary-foreground: 0 0% 95%; /* #F2F2F2 - Off white */

--muted: 0 0% 18%;              /* #2E2E2E - Muted gray */
--muted-foreground: 0 0% 64%;   /* #A3A3A3 - Muted text */

--accent: 0 0% 20%;             /* #333333 - Accent gray */
--accent-foreground: 0 0% 95%;  /* #F2F2F2 - Off white */

--border: 0 0% 20%;             /* #333333 - Subtle borders */
--input: 0 0% 20%;              /* #333333 - Input background */
--ring: 0 0% 30%;               /* #4D4D4D - Focus ring */

/* Semantic Colors */
--success: 142 76% 36%;         /* #16A34A - Green */
--warning: 38 92% 50%;          /* #F59E0B - Orange */
--error: 0 84% 60%;             /* #EF4444 - Red */
--info: 217 91% 60%;            /* #3B82F6 - Blue */
```

### Typography

```css
/* Font Stack */
--font-sans: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
--font-mono: 'JetBrains Mono', 'Fira Code', monospace;

/* Font Sizes */
--text-xs: 0.75rem;    /* 12px */
--text-sm: 0.875rem;   /* 14px */
--text-base: 1rem;     /* 16px */
--text-lg: 1.125rem;   /* 18px */
--text-xl: 1.25rem;    /* 20px */
--text-2xl: 1.5rem;    /* 24px */
--text-3xl: 1.875rem;  /* 30px */
```

### Spacing & Layout

```css
/* Mobile-First Breakpoints */
--breakpoint-sm: 640px;
--breakpoint-md: 768px;
--breakpoint-lg: 1024px;
--breakpoint-xl: 1280px;
--breakpoint-2xl: 1536px;

/* Container Max Width */
--container-sm: 640px;
--container-md: 768px;
--container-lg: 1024px;
--container-xl: 1280px;
```

---

## 🔗 Integration with Meggy AI Platform

### bruno-core Integration
- Follow interface-based design patterns
- Use plugin architecture for extensibility
- Implement event-driven communication
- Maintain type safety with TypeScript equivalents

### bruno-llm Integration
- Support multiple LLM providers (Ollama, OpenAI, Claude)
- Implement streaming responses
- Add cost tracking UI
- Support context management visualization

### Common Patterns
- **Error Handling:** Follow bruno-core exception hierarchy
- **Logging:** Structured logging similar to bruno's approach
- **Configuration:** Environment-based configuration
- **Testing:** High test coverage (aim for 80%+)

---

## 🔄 CI/CD Workflow Templates (Simplified for Starters)

### Approach: Start Simple, Iterate Later

For the initial setup, we'll use **simple, battle-tested templates** rather than complex custom workflows. This approach:
- ✅ Gets CI/CD running quickly
- ✅ Uses proven patterns from the community
- ✅ Can be enhanced incrementally as needs grow
- ✅ Reduces maintenance burden

### Recommended Workflow Structure

#### 1. **CI Workflow** (`.github/workflows/ci.yml`) - Run on every PR

**Purpose:** Catch issues before merging

```yaml
name: CI

on:
  pull_request:
    branches: [main, develop]
  push:
    branches: [main, develop]

jobs:
  lint-and-test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v2
        with:
          version: 8
      - uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'pnpm'
      
      - run: pnpm install --frozen-lockfile
      - run: pnpm lint
      - run: pnpm type-check
      - run: pnpm test:ci
      - run: pnpm build
```

**What it does:**
- Installs dependencies
- Runs linter (ESLint)
- Type checks (TypeScript)
- Runs tests (Jest)
- Builds the app (validates no build errors)

#### 2. **CD Workflow for Vercel** (`.github/workflows/deploy.yml`) - Auto-deploy

**Purpose:** Automatic deployments to staging/production

```yaml
name: Deploy

on:
  push:
    branches: [main]  # Production
  pull_request:
    branches: [main]  # Preview deployments

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          vercel-args: ${{ github.ref == 'refs/heads/main' && '--prod' || '' }}
```

**Alternative: Manual Deployment**
If using self-hosted or other platforms, Vercel's GitHub integration handles this automatically.

#### 3. **Test Workflow** (`.github/workflows/test.yml`) - Comprehensive Testing

**Purpose:** Run full test suite including E2E tests

```yaml
name: Tests

on:
  schedule:
    - cron: '0 0 * * *'  # Daily at midnight
  workflow_dispatch:  # Manual trigger

jobs:
  unit-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v2
      - uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'pnpm'
      
      - run: pnpm install
      - run: pnpm test:coverage
      
      - uses: codecov/codecov-action@v3  # Optional: upload coverage
        if: always()

  e2e-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v2
      - uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'pnpm'
      
      - run: pnpm install
      - run: pnpm playwright install --with-deps
      - run: pnpm test:e2e
```

#### 4. **Release Workflow** (`.github/workflows/release.yml`) - Automated Releases

**Purpose:** Create releases and changelogs

```yaml
name: Release

on:
  push:
    tags:
      - 'v*'

jobs:
  release:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0  # Get all tags
      
      - uses: actions/setup-node@v4
        with:
          node-version: '18'
      
      # Auto-generate release notes
      - uses: actions/create-release@v1
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
        with:
          tag_name: ${{ github.ref }}
          release_name: Release ${{ github.ref }}
          draft: false
          prerelease: false
```

### Starter Templates to Use

Instead of building from scratch, use these proven templates:

1. **Next.js Official Template:**
   - https://github.com/vercel/next.js/tree/canary/.github/workflows
   - Pre-configured for Next.js best practices

2. **TypeScript React Template:**
   - https://github.com/actions/starter-workflows/blob/main/ci/node.js.yml
   - Covers basic CI needs

3. **Vercel GitHub Integration:**
   - Recommended: Just connect repository to Vercel
   - Auto-handles preview deployments and production
   - No workflow file needed initially

### Progressive Enhancement Strategy

**Phase 1 (Weeks 1-5):** Minimal CI
```
✓ Basic CI workflow (lint, type-check, test, build)
✓ Vercel auto-deployment
✓ Dependabot for dependency updates
```

**Phase 2 (Weeks 6-10):** Add Testing
```
✓ Separate test workflow with coverage
✓ E2E tests in CI
✓ PR preview deployments
```

**Phase 3 (Weeks 11-15):** Production-Ready
```
✓ Release automation
✓ Security scanning (Snyk)
✓ Performance monitoring
✓ Lighthouse CI
```

**Phase 4 (Post-Launch):** Advanced Features
```
✓ Automated dependency updates with testing
✓ Canary deployments
✓ A/B testing infrastructure
✓ Advanced monitoring and alerts
```

### Package.json Scripts for CI/CD

Add these scripts to support CI workflows:

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "lint:fix": "next lint --fix",
    "format": "prettier --check \"**/*.{ts,tsx,js,jsx,json,md}\"",
    "format:fix": "prettier --write \"**/*.{ts,tsx,js,jsx,json,md}\"",
    "type-check": "tsc --noEmit",
    "test": "jest",
    "test:ci": "jest --ci --coverage --maxWorkers=2",
    "test:coverage": "jest --coverage",
    "test:watch": "jest --watch",
    "test:e2e": "playwright test",
    "test:e2e:ui": "playwright test --ui",
    "prepare": "husky install",
    "precommit": "lint-staged"
  }
}
```

### Benefits of This Approach

✅ **Quick Setup:** Workflows can be set up in < 1 hour  
✅ **Low Maintenance:** Using standard templates means less debugging  
✅ **Community Support:** Popular patterns have extensive documentation  
✅ **Scalable:** Easy to add more checks as project grows  
✅ **Cost Effective:** Minimal GitHub Actions minutes usage  

### When to Enhance Workflows

**Add more complexity when:**
- Team grows beyond 3-5 developers
- Deployment frequency increases (> 5 per day)
- Need advanced features (canary, blue-green deployments)
- Experiencing CI/CD bottlenecks
- Security/compliance requirements increase

---

## 📝 Coding Standards

### TypeScript Best Practices
```typescript
// Use explicit types, avoid 'any'
interface UserProfile {
  id: string;
  name: string;
  email: string;
}

// Use type guards
function isValidUser(user: unknown): user is UserProfile {
  return (
    typeof user === 'object' &&
    user !== null &&
    'id' in user &&
    'name' in user
  );
}
```

### React Component Patterns
```typescript
// Prefer functional components with TypeScript
interface ButtonProps {
  variant: 'primary' | 'secondary';
  onClick: () => void;
  children: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({ 
  variant, 
  onClick, 
  children 
}) => {
  // Component logic
};
```

### File Naming Conventions
- Components: `PascalCase.tsx` (e.g., `ChatContainer.tsx`)
- Hooks: `camelCase.ts` (e.g., `useAuth.ts`)
- Utils: `camelCase.ts` (e.g., `formatDate.ts`)
- Types: `camelCase.ts` or `PascalCase.ts` (e.g., `api.ts`, `ChatTypes.ts`)
- Constants: `SCREAMING_SNAKE_CASE` (e.g., `API_ENDPOINTS`)

---

## 🚀 Getting Started (For Developers)

### Prerequisites
```bash
- Node.js 18+ (LTS recommended)
- pnpm 8+ (or npm/yarn)
- Git
- VS Code (recommended)
```

### Initial Setup (Post Phase 0 Completion)
```bash
# Clone repository
git clone https://github.com/meggy-ai/frontend.git
cd frontend

# Install dependencies
pnpm install

# Copy environment variables
cp .env.example .env.local

# Husky will automatically set up pre-commit hooks
# Manual setup if needed:
pnpm prepare

# Run development server
pnpm dev

# Open http://localhost:3000
```

### Pre-commit Hooks

Pre-commit hooks automatically run checks before each commit to catch issues early:

**What gets checked before commit:**
- ✅ Code formatting (Prettier)
- ✅ Linting errors (ESLint)
- ✅ TypeScript type checking
- ✅ Commit message format (Conventional Commits via commitlint)

**If checks fail:**
- Commit is blocked until issues are fixed
- Review error messages and fix the reported issues
- Stage your fixes and commit again

**Manual check commands:**
```bash
# Run all pre-commit checks manually
pnpm lint       # ESLint
pnpm format     # Prettier
pnpm type-check # TypeScript

# Fix auto-fixable issues
pnpm lint:fix
pnpm format:fix
```

**Commit message format (Conventional Commits):**
```bash
# Good commits
git commit -m "feat: add chat streaming functionality"
git commit -m "fix: resolve websocket connection issue"
git commit -m "docs: update API integration guide"
git commit -m "test: add unit tests for chat components"

# Bad commits (will be rejected)
git commit -m "updates"
git commit -m "fixed stuff"
```

---

## 📦 Dependencies (Estimated)

### Core Dependencies
```json
{
  "next": "^14.0.0",
  "react": "^18.2.0",
  "react-dom": "^18.2.0",
  "typescript": "^5.3.0"
}
```

### UI & Styling
```json
{
  "tailwindcss": "^3.4.0",
  "@radix-ui/react-*": "latest",
  "framer-motion": "^10.16.0",
  "lucide-react": "^0.300.0"
}
```

### State & Data
```json
{
  "zustand": "^4.4.0",
  "@tanstack/react-query": "^5.0.0",
  "axios": "^1.6.0"
}
```

### Chat Specific
```json
{
  "ai": "^2.2.0",
  "socket.io-client": "^4.6.0",
  "react-markdown": "^9.0.0",
  "remark-gfm": "^4.0.0",
  "react-syntax-highlighter": "^15.5.0"
}
```

---

## 🎯 Success Metrics

### Technical Metrics
- **Performance:** Lighthouse score > 90
- **Test Coverage:** > 80%
- **Bundle Size:** < 500KB (gzipped)
- **Accessibility:** WCAG 2.1 AA compliant
- **SEO:** Core Web Vitals in green

### User Metrics
- **Mobile Usage:** > 50% of traffic
- **Load Time:** < 2s on 3G
- **Engagement:** > 5 min average session
- **Retention:** > 60% week 1 retention

---

## 📞 Support & Communication

### Communication Channels
- **GitHub Issues:** Bug reports and feature requests
- **GitHub Discussions:** Questions and community discussions
- **Email:** contact@meggy.ai
- **Documentation:** https://meggy-ai.github.io/frontend/

### Release Schedule
- **Alpha:** Week 10 (Internal testing)
- **Beta:** Week 15 (Public beta)
- **v1.0:** Week 18 (Production ready)

---

## 📄 License

This project is licensed under the **MIT License** - see the LICENSE file for details.

---

## 🙏 Acknowledgments

Built on top of:
- [bruno-core](https://github.com/meggy-ai/bruno-core) - Foundation framework
- [bruno-llm](https://github.com/meggy-ai/bruno-llm) - LLM provider implementations
- [Next.js](https://nextjs.org/) - React framework
- [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS
- [shadcn/ui](https://ui.shadcn.com/) - Component library

---

**Last Updated:** December 9, 2025  
**Document Version:** 1.0.0  
**Status:** Ready for Implementation

---

## 🔄 Next Steps

1. **Review this plan** with the team
2. **Start with Phase 0** - Project Setup
3. **Track progress** in PROGRESS_TRACKER.md
4. **Update CHANGELOG.md** after each phase
5. **Iterate and adapt** as needed

Let's build India's first open-source AI platform! 🚀
