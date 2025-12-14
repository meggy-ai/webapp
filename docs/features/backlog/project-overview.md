# BRUNO-PA (PERSONAL ASSISTANT) PROJECT IMPLEMENTATION OVERVIEW

Based on thorough analysis of your completed repos (bruno-core, bruno-llm, bruno-memory, bruno-abilities) and your existing webapp frontend, here's the comprehensive implementation overview for bruno-pa.

---

## **PROJECT SCOPE & VISION**

Bruno-PA is the flagship web application that brings all Bruno components together into a cohesive, user-facing personal assistant platform. It provides a modern, mobile-first web interface for users to interact with their personal AI assistant through chat, voice, and visual interfaces, while managing their timers, notes, alarms, and other abilities through an intuitive dashboard.

---

## **TECHNOLOGY STACK**

### **Frontend (Already Started)**

- **Framework:** Next.js 14+ (App Router)
- **UI Library:** shadcn/ui + Radix UI primitives
- **Styling:** Tailwind CSS
- **State Management:** Zustand or React Context
- **Real-time:** Socket.io client or WebSockets
- **API Client:** TanStack Query (React Query) for data fetching
- **Forms:** React Hook Form + Zod validation
- **Authentication:** NextAuth.js or Auth0
- **Voice:** Web Speech API or custom integration

### **Backend**

- **Framework:** Django 5.0+
- **API:** Django REST Framework (DRF) or Django Ninja
- **Real-time:** Django Channels (WebSocket support)
- **Authentication:** Django Allauth + JWT tokens
- **Task Queue:** Celery with Redis broker
- **Database:** PostgreSQL (primary) + Redis (cache/sessions)
- **File Storage:** Local or S3-compatible storage
- **API Documentation:** drf-spectacular or Django Ninja's built-in docs

### **Integration Layer**

- **Bruno Packages:** bruno-core, bruno-llm, bruno-memory, bruno-abilities
- **Message Queue:** Redis pub/sub or RabbitMQ
- **Caching:** Redis
- **Search:** PostgreSQL full-text or Elasticsearch (optional)

---

## **REPOSITORY STRUCTURE**

### **Monorepo Organization**

```
bruno-pa/
├── frontend/              # Next.js application
├── backend/               # Django application
├── shared/                # Shared types, schemas
├── docker/                # Docker configurations
├── infrastructure/        # Deployment configs
└── docs/                  # Documentation
```

**Rationale:** Monorepo keeps frontend and backend synchronized, enables atomic commits across stack, simplifies deployment, and makes it easier to share types and schemas.

---

## **BACKEND ARCHITECTURE (DJANGO)**

### **1. PROJECT FOUNDATION**

#### **Django Project Structure**

```
backend/
├── config/                # Django settings & config
│   ├── settings/
│   │   ├── base.py       # Common settings
│   │   ├── development.py
│   │   ├── production.py
│   │   └── testing.py
│   ├── urls.py           # Root URL config
│   ├── asgi.py           # ASGI for Channels
│   └── wsgi.py           # WSGI for production
├── apps/                  # Django apps
│   ├── accounts/         # User management
│   ├── chat/             # Chat/conversation
│   ├── abilities/        # Ability management
│   ├── agents/           # Agent instances
│   └── api/              # API endpoints
├── core/                  # Core business logic
├── integrations/          # Bruno package integrations
├── utils/                 # Shared utilities
├── manage.py
└── requirements/
    ├── base.txt
    ├── development.txt
    └── production.txt
```

**Key Libraries:**

- **Django 5.0+** - Web framework
- **djangorestframework** - REST API
- **channels** - WebSocket support
- **daphne** - ASGI server
- **celery** - Background tasks
- **django-cors-headers** - CORS for Next.js
- **django-allauth** - Authentication
- **djangorestframework-simplejwt** - JWT tokens
- **psycopg2-binary** - PostgreSQL adapter
- **redis** - Caching and Celery broker
- **python-decouple** - Environment config
- **gunicorn** - Production WSGI server

---

### **2. ACCOUNTS APP (User Management)**

#### **Purpose**

Handle user registration, authentication, profile management, and authorization.

#### **Core Components**

**User Model Extension:**
Extend Django's AbstractUser to add Bruno-specific fields like timezone, language preference, notification settings, voice preference, theme preference, and usage statistics.

**Profile Model:**
Separate profile model with avatar, bio, onboarding completion status, subscription tier, API usage limits, and connected services configuration.

**Authentication System:**
Implement JWT-based authentication with access and refresh tokens, OAuth social login integration (Google, GitHub), email verification flow, password reset functionality, and two-factor authentication (optional).

**User Preferences:**
Store user preferences for default LLM provider, memory backend choice, enabled abilities, conversation style settings, and privacy settings.

#### **API Endpoints**

Authentication endpoints for register, login, logout, token refresh, password reset, and email verification. Profile endpoints for get/update profile, change password, delete account, and export data. Preferences endpoints for get/update preferences, ability toggles, and notification settings.

---

### **3. AGENTS APP (Agent Management)**

#### **Purpose**

Manage personal agent instances - each user has one or more agents with specific configurations.

#### **Core Components**

**Agent Model:**
Store agent configuration including owner (user FK), agent name and description, LLM provider selection, LLM model and parameters, memory backend choice, enabled abilities list, personality settings, system prompt customization, creation and last activity timestamps.

**Agent Instance Manager:**
Handle agent lifecycle including agent initialization with bruno-core, agent state management, agent configuration updates, agent metrics tracking, and concurrent request handling.

**Agent Configuration Service:**
Validate agent configurations, provide configuration templates, handle configuration migrations, and suggest optimal configurations based on usage patterns.

**Agent Analytics:**
Track message count and token usage, average response time, most used abilities, error rates, and user satisfaction ratings.

#### **Integration Layer**

**Bruno-Core Integration:**
Instantiate BaseAssistant from bruno-core with user-selected LLM provider from bruno-llm, memory backend from bruno-memory, and enabled abilities from bruno-abilities. Handle agent initialization on first request or pre-warm on user login.

**Resource Management:**
Implement connection pooling for LLM providers, cache agent instances per user session, implement automatic cleanup for inactive agents, and rate limiting per user tier.

---

### **4. CHAT APP (Conversation Management)**

#### **Purpose**

Handle real-time chat interactions between users and their agents.

#### **Core Components**

**Conversation Model:**
Store conversations with user and agent FK, conversation title (auto-generated or user-set), conversation status (active, archived), creation and last message timestamps, message count, and total tokens used.

**Message Model:**
Store individual messages with conversation FK, role (user or assistant), content (text), message type (text, voice, image), timestamp, metadata (tokens, latency, ability used), and embedding vector for semantic search.

**WebSocket Consumer:**
Django Channels consumer for real-time chat handling connection authentication, receiving user messages, routing to agent processor, streaming LLM responses back, handling reconnection logic, and rate limiting.

**Message Processor:**
Service layer that receives message from WebSocket, creates Message object in database, calls agent.process_message() from bruno-core, handles streaming responses, stores assistant response, emits events for UI updates, and logs conversation metrics.

**Conversation Manager:**
Business logic for creating new conversations, loading conversation history, archiving old conversations, searching conversations by content, exporting conversations, and conversation summarization using LLM.

#### **Real-Time Architecture**

**Django Channels Setup:**
Configure channel layers with Redis backend, routing for WebSocket endpoints, authentication middleware, and connection lifecycle management.

**Message Flow:**
User types in Next.js chat UI → WebSocket send to Django → Consumer receives → Authenticate user → Load agent instance → Process with bruno-core → Stream response tokens → WebSocket send chunks → Next.js updates UI incrementally.

**Streaming Implementation:**
Use Django Channels' async support, stream LLM tokens as they arrive, send partial message updates via WebSocket, handle backpressure if client is slow, and implement fallback for non-streaming clients.

---

### **5. ABILITIES APP (Ability Management UI)**

#### **Purpose**

Provide backend endpoints for managing, executing, and monitoring abilities.

#### **Core Components**

**Ability Registry Service:**
Query available abilities from bruno-abilities, get ability metadata and parameters, check ability availability and dependencies, and filter abilities by category or capability.

**Ability Execution Service:**
Execute abilities on demand from UI, validate parameters before execution, handle ability errors gracefully, return structured results to frontend, and track execution metrics.

**Ability Configuration:**
Per-user ability settings, API keys for external services (weather, etc.), ability preferences and defaults, and scheduled ability executions.

**Ability History:**
Track all ability executions with user, ability name, parameters, execution time, success/failure status, result data, and error messages if any.

#### **API Endpoints**

Abilities endpoints for list available abilities, get ability details, execute ability with parameters, get execution history, and configure ability settings. Integration endpoints for save API keys securely, test integrations, and refresh integration status.

---

### **6. API APP (REST API Layer)**

#### **Purpose**

Centralized REST API using Django REST Framework for non-real-time operations.

#### **Core Components**

**API Views:**
Use DRF ViewSets for CRUD operations, implement filtering with django-filter, add pagination for list endpoints, support ordering and searching, and implement proper HTTP status codes.

**Serializers:**
Create serializers for all models, implement nested serializers for related data, add custom validation logic, support read-only and write-only fields, and implement hyperlinked relationships.

**Permissions:**
Use DRF permission classes, implement custom permissions for agent ownership, add rate limiting per user tier, enforce subscription-based access control, and implement ability-level permissions.

**API Documentation:**
Auto-generate API docs with drf-spectacular, provide interactive API playground, include authentication examples, document WebSocket endpoints separately, and version API endpoints properly.

#### **REST vs WebSocket Decision**

**Use REST for:**

- CRUD operations (create conversation, update profile)
- Data fetching (list abilities, get history)
- Configuration (save settings)
- Batch operations (export data)

**Use WebSocket for:**

- Real-time chat messages
- Streaming LLM responses
- Live ability execution status
- Notifications and alerts

---

### **7. CORE MODULE (Business Logic)**

#### **Purpose**

Shared business logic not tied to specific Django apps.

#### **Core Components**

**Bruno Integration Layer:**
Wrapper services for bruno-core's BaseAssistant, bruno-llm provider management, bruno-memory backend switching, and bruno-abilities registry access.

**Session Manager:**
Manage user sessions and agent instances, implement session persistence with Redis, handle session expiration and cleanup, and support multi-device sessions per user.

**Event System:**
Django signals for cross-app communication, event logging for audit trails, webhook support for external integrations, and analytics event tracking.

**Error Handling:**
Centralized exception handling, custom exception classes for Bruno-specific errors, error reporting and logging, and user-friendly error messages.

---

### **8. INTEGRATIONS MODULE (External Services)**

#### **Purpose**

Handle integrations with external services and Bruno packages.

#### **Core Components**

**Bruno Package Manager:**
Initialize Bruno packages on application startup, manage package versions and compatibility, handle package configuration from environment, and provide health checks for packages.

**External Service Adapters:**
Email service integration (SendGrid, SES), SMS service integration (Twilio), push notification service (Firebase, OneSignal), file storage service (S3, Cloudflare R2), and monitoring service (Sentry, DataDog).

**API Key Management:**
Secure storage of API keys using Django's encryption, per-user API key management for abilities, validation and testing of API keys, and rotation and revocation support.

**Rate Limiting Service:**
Implement rate limiting per user and endpoint, track usage against subscription quotas, provide usage dashboards, and alert users approaching limits.

---

### **9. BACKGROUND TASKS (CELERY)**

#### **Purpose**

Handle asynchronous operations that shouldn't block requests.

#### **Core Components**

**Task Definitions:**

**Conversation Tasks:** Summarize long conversations, archive old conversations, index conversations for search, and export conversation data.

**Ability Tasks:** Execute scheduled abilities, retry failed ability executions, cleanup temporary ability data, and batch ability executions.

**Maintenance Tasks:** Database backups, cleanup old sessions and logs, update usage statistics, and send digest emails.

**Analytics Tasks:** Calculate user engagement metrics, aggregate ability usage statistics, generate usage reports, and track performance metrics.

**Celery Configuration:**
Use Redis as message broker, configure multiple queues for priority, implement task result backend with Redis, set up periodic tasks with Celery Beat, and configure task retry policies.

**Task Monitoring:**
Use Flower for Celery monitoring, implement task failure alerting, track task execution metrics, and provide task history in admin interface.

---

### **10. UTILITIES MODULE**

#### **Purpose**

Shared utilities and helper functions.

#### **Core Components**

**Logging Configuration:**
Structured logging with python-json-logger, separate logs by environment (dev, prod), implement log rotation and retention, and integrate with external logging services.

**Cache Management:**
Redis cache wrapper functions, cache invalidation strategies, cache warming for common queries, and cache metrics tracking.

**Time and Date Utilities:**
Timezone-aware datetime handling, human-readable time formatting, duration calculations, and scheduling utilities.

**Validation Helpers:**
Custom validators for API inputs, sanitization for user inputs, format validation for common types, and security validation utilities.

**Pagination Helpers:**
Custom pagination classes, cursor-based pagination for real-time feeds, infinite scroll support, and pagination metadata in responses.

---

## **FRONTEND ARCHITECTURE (NEXT.JS)**

### **11. PROJECT FOUNDATION**

#### **Next.js Project Structure**

```
frontend/
├── src/
│   ├── app/              # App router pages
│   │   ├── (auth)/       # Auth routes
│   │   ├── (dashboard)/  # Protected routes
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── components/       # React components
│   │   ├── ui/           # shadcn components
│   │   ├── chat/         # Chat components
│   │   ├── abilities/    # Ability components
│   │   └── layouts/      # Layout components
│   ├── hooks/            # Custom React hooks
│   ├── lib/              # Utility functions
│   ├── services/         # API service layer
│   ├── store/            # State management
│   ├── types/            # TypeScript types
│   └── styles/           # Global styles
├── public/               # Static assets
└── package.json
```

**Key Libraries:**

- **next** - Framework
- **react** and **react-dom** - UI library
- **@tanstack/react-query** - Data fetching
- **zustand** - State management
- **socket.io-client** - WebSocket client
- **react-hook-form** - Form management
- **zod** - Schema validation
- **next-auth** - Authentication
- **tailwindcss** - Styling
- **@radix-ui/react-\*** - UI primitives
- **lucide-react** - Icons
- **recharts** or **tremor** - Data visualization
- **sonner** - Toast notifications
- **date-fns** - Date utilities
- **framer-motion** - Animations

---

### **12. AUTHENTICATION & USER MANAGEMENT**

#### **Purpose**

Handle user authentication flow and session management on frontend.

#### **Core Components**

**Authentication Pages:**
Login page with email/password and social login, registration page with email verification flow, password reset flow, email verification confirmation, and onboarding wizard for new users.

**Auth Context:**
Next-Auth configuration with JWT strategy, session provider for app-wide auth state, authentication hooks for components, protected route wrapper component, and automatic token refresh logic.

**User Profile Management:**
Profile view and edit page, avatar upload with crop tool, account settings page, connected services management, and subscription management interface.

---

### **13. DASHBOARD LAYOUT**

#### **Purpose**

Main application shell for authenticated users.

#### **Core Components**

**Layout Structure:**
Responsive sidebar navigation, collapsible on mobile with slide-out menu, top navigation bar with user menu and notifications, main content area with proper spacing, and breadcrumb navigation for nested pages.

**Sidebar Navigation:**
Dashboard home, chat interface, abilities page, history/archives, settings, help and documentation, and visual active state for current page.

**User Menu:**
Profile quick view, settings shortcut, subscription status, usage statistics, theme toggle (light/dark), and logout action.

**Notifications Center:**
Real-time notification badge, notification panel with list, notification types (ability complete, system alerts, etc.), mark as read functionality, and notification preferences link.

---

### **14. CHAT INTERFACE**

#### **Purpose**

Primary interface for conversing with Bruno agent.

#### **Core Components**

**Chat Layout:**
Conversation list sidebar showing recent chats, active conversation indicator, new conversation button, archive access, and search conversations.

Main chat area with message list container, message input composer, voice input button, attachment support, and typing indicators.

**Message Components:**
User message bubble with right alignment, timestamp, edit/delete options, and copy to clipboard. Assistant message bubble with left alignment, streaming animation during generation, ability execution indicators, regenerate option, and feedback buttons (thumbs up/down).

System messages for ability executions, errors, and session events. Rich message types for code blocks with syntax highlighting, tables and structured data, images and media, links with previews, and markdown rendering.

**Message Input:**
Multi-line text input with auto-resize, emoji picker integration, markdown formatting shortcuts, voice input toggle, file attachment option, send on Enter (configurable), and character/token counter.

**Conversation Management:**
New conversation creation, rename conversation, archive conversation, delete conversation with confirmation, share conversation (generate public link), and export conversation to various formats.

**WebSocket Integration:**
Establish WebSocket connection on mount, handle connection states (connecting, connected, disconnected), implement automatic reconnection with exponential backoff, send messages via WebSocket, receive streaming responses incrementally, show connection status indicator, and handle offline mode gracefully.

**Streaming Response Handling:**
Display partial responses as tokens arrive, smooth scrolling to follow new content, typing animation for natural feel, handle stream interruption/errors, allow stopping generation mid-stream, and accumulate full message in state.

---

### **15. ABILITY INTERFACES**

#### **Purpose**

Dedicated UIs for interacting with specific abilities beyond chat.

#### **Core Components**

**Ability Dashboard:**
Grid/list view of available abilities, ability categories and filtering, search abilities by name or description, ability status indicators (available, configured, unavailable), quick action buttons for common abilities, and recently used abilities section.

**Timer Interface:**
Visual timer cards showing remaining time, create new timer form with duration input and label, active timers list with pause/resume/cancel, timer completion notifications, and timer history view.

**Alarm Interface:**
Alarm list with on/off toggles, create alarm with time picker and recurrence, snooze and dismiss actions, alarm sound preview, and multiple alarm support.

**Notes Interface:**
Note list with preview cards, rich text editor using TipTap or similar, note categorization with tags, note search and filtering, markdown support, note sharing options, and note export functionality.

**To-Do List Interface:**
Task list with checkboxes, create task with quick add, task editing and deletion, task priorities and due dates, subtasks and task dependencies, task filtering by status, and completed tasks archive.

**Calendar Interface:**
Month/week/day calendar views, event creation and editing, integration with alarm reminders, event search and filtering, and recurring event support.

**Weather Display:**
Current weather card with icon and temperature, weather forecast for multiple days, location selection or detection, weather alerts display, and visual weather representation.

**Ability Configuration:**
Per-ability settings panel, API key input with secure storage, test connection buttons, reset to defaults option, and ability-specific preferences.

---

### **16. HISTORY & ANALYTICS**

#### **Purpose**

View past interactions and usage statistics.

#### **Core Components**

**Conversation History:**
Paginated list of all conversations, search conversations by content, filter by date range, archive and unarchive, bulk operations (delete, export), and conversation statistics.

**Ability Execution History:**
Timeline of ability executions, filter by ability type, filter by success/failure, execution details view, retry failed executions, and export history data.

**Usage Analytics:**
Message count over time chart, most used abilities breakdown, token usage statistics, response time metrics, ability success rates, and daily/weekly/monthly views.

**Personal Insights:**
Most active times of day, conversation topics analysis, productivity metrics, goal tracking if applicable, and usage trends.

---

### **17. SETTINGS PAGES**

#### **Purpose**

Configure application and user preferences.

#### **Core Components**

**Account Settings:**
Email and password management, two-factor authentication setup, connected accounts (social logins), danger zone (delete account), and data export requests.

**Appearance Settings:**
Theme selection (light, dark, auto), font size preferences, UI density options, and accessibility settings.

**Agent Configuration:**
Select LLM provider and model, adjust model parameters (temperature, max tokens), select memory backend, enable/disable specific abilities, and personality customization.

**Notification Settings:**
Email notification preferences, push notification permissions, notification types toggle, quiet hours configuration, and notification delivery methods.

**Privacy Settings:**
Conversation retention policy, data sharing preferences, analytics opt-out, conversation encryption toggle, and third-party integrations.

**Subscription Management:**
Current plan display, usage against quotas, upgrade/downgrade options, billing history, payment method management, and cancel subscription flow.

---

### **18. STATE MANAGEMENT**

#### **Purpose**

Manage global application state efficiently.

#### **Core Components**

**Zustand Stores:**

**Auth Store:** User authentication state, token management, user profile data, login/logout actions, and token refresh logic.

**Chat Store:** Active conversation ID, conversations list, current conversation messages, WebSocket connection state, and streaming message state.

**Agent Store:** Agent configuration, selected LLM provider, enabled abilities list, and agent status.

**UI Store:** Sidebar collapsed state, theme preference, notification badge count, modal open states, and loading states.

**TanStack Query Configuration:**
Configure default query options, implement query caching strategy, setup mutation hooks for data updates, implement optimistic updates, and configure retry logic and error handling.

**Data Fetching Hooks:**
useConversations for fetching conversation list, useMessages for fetching conversation messages, useAbilities for available abilities, useProfile for user profile data, useHistory for execution history, and useAnalytics for usage statistics.

---

### **19. API SERVICE LAYER**

#### **Purpose**

Centralize all API communication logic.

#### **Core Components**

**API Client Setup:**
Axios or Fetch wrapper with base URL configuration, automatic JWT token attachment, request/response interceptors, error handling and retry logic, and request cancellation support.

**Service Modules:**

**Auth Service:** Login, logout, register, refresh token, password reset, email verification, and social login callbacks.

**Chat Service:** Create conversation, fetch conversations, fetch messages, send message (REST fallback), delete conversation, and archive conversation.

**Agent Service:** Get agent configuration, update agent configuration, get agent status, and reset agent.

**Ability Service:** List abilities, get ability details, execute ability, configure ability, and get execution history.

**User Service:** Get profile, update profile, change password, delete account, export data, and update preferences.

**WebSocket Service:**
Connect to WebSocket, send messages via WebSocket, handle incoming message events, implement reconnection logic, and close connection on unmount.

---

### **20. CUSTOM HOOKS**

#### **Purpose**

Reusable React hooks for common patterns.

#### **Core Components**

**useWebSocket Hook:**
Establish WebSocket connection, send messages helper, receive message handler, connection state management, and automatic cleanup.

**useChat Hook:**
Load conversation messages, send message with streaming, handle streaming response, update message list optimistically, and scroll to bottom on new message.

**useAbility Hook:**
Execute ability with parameters, handle execution state (loading, success, error), parse and display ability results, and retry failed executions.

**useAuth Hook:**
Access auth state, login/logout actions, check authentication status, and refresh token automatically.

**useInfiniteScroll Hook:**
Detect scroll to bottom/top, trigger load more function, loading state management, and work with TanStack Query's infinite queries.

**useMediaQuery Hook:**
Detect breakpoints for responsive design, track window size changes, and optimize layout based on device.

**useLocalStorage Hook:**
Persist state to localStorage, sync across tabs, handle serialization, and provide TypeScript types.

---

### **21. RESPONSIVE DESIGN**

#### **Purpose**

Ensure excellent experience across all devices (mobile-first).

#### **Core Components**

**Breakpoint Strategy:**
Mobile: < 640px (sm), Tablet: 640px - 1024px (md, lg), Desktop: > 1024px (xl, 2xl), and use Tailwind's responsive prefixes.

**Mobile Optimizations:**
Bottom navigation for primary actions on mobile, swipe gestures for common actions, touch-friendly button sizes (min 44px), optimized keyboard handling on mobile, and reduced animations for performance.

**Layout Adaptations:**
Single column on mobile, sidebar becomes slide-out drawer, chat takes full viewport height, abilities in card grid that flows responsively, and collapsible sections to save space.

**Progressive Web App:**
Next.js PWA configuration with next-pwa, service worker for offline support, app manifest for install prompt, offline page for no connection, and background sync for messages.

---

### **22. PERFORMANCE OPTIMIZATION**

#### **Purpose**

Ensure fast load times and smooth interactions.

#### **Core Components**

**Code Splitting:**
Dynamic imports for heavy components, route-based code splitting with Next.js, lazy loading for ability interfaces, and suspense boundaries for loading states.

**Asset Optimization:**
Next.js Image component for automatic optimization, lazy loading images below fold, WebP format with fallbacks, icon sprite sheets or icon fonts, and font optimization with next/font.

**Data Optimization:**
Pagination for large lists, infinite scroll with virtual scrolling for chat, debounced search inputs, optimistic updates for instant feedback, and stale-while-revalidate caching strategy.

**Rendering Optimization:**
React.memo for expensive components, useMemo and useCallback for expensive calculations, virtual scrolling for long message lists using react-window or react-virtuoso, and server components where applicable.

**Bundle Optimization:**
Analyze bundle size with @next/bundle-analyzer, remove unused dependencies, use barrel export patterns carefully, and implement tree shaking.

---

### **23. ERROR HANDLING & FEEDBACK**

#### **Purpose**

Provide clear feedback and handle errors gracefully.

#### **Core Components**

**Error Boundaries:**
Global error boundary for uncaught errors, route-specific error boundaries, component-level error boundaries, and custom error pages (404, 500, etc.).

**Loading States:**
Skeleton screens for initial loads, spinner for actions in progress, progress bars for deterministic operations, and shimmer effects for content loading.

**Toast Notifications:**
Use Sonner or react-hot-toast, success messages for completed actions, error messages with retry options, info messages for system events, and warning messages for approaching limits.

**Form Validation:**
Real-time validation with React Hook Form, show errors inline with form fields, disable submit until valid, provide helpful error messages, and clear errors on input change.

**Network Error Handling:**
Detect offline mode and show banner, queue actions for when back online, show retry button for failed requests, and indicate stale data when offline.

---

### **24. ACCESSIBILITY**

#### **Purpose**

Ensure application is usable by everyone.

#### **Core Components**

**Keyboard Navigation:**
All interactive elements keyboard accessible, clear focus indicators, skip to content link, keyboard shortcuts for common actions, and escape key to close modals.

**Screen Reader Support:**
Semantic HTML elements, ARIA labels for icon buttons, ARIA live regions for dynamic content, descriptive alt text for images, and form labels properly associated.

**Color and Contrast:**
WCAG AA contrast ratios minimum, don't rely on color alone for meaning, test with colorblind simulators, and provide high contrast mode option.

**Focus Management:**
Trap focus in modals, restore focus when closing, manage focus in chat as messages arrive, and announce dynamic changes to screen readers.

---

### **25. TESTING STRATEGY**

#### **Purpose**

Ensure code quality and prevent regressions.

#### **Core Components**

**Unit Tests:**
Test utility functions, test custom hooks with @testing-library/react-hooks, test Redux/Zustand actions and selectors, and test API service functions.

**Component Tests:**
Test with @testing-library/react, test user interactions, test different states and props, test accessibility with jest-axe, and aim for 70%+ coverage.

**Integration Tests:**
Test full user flows, test WebSocket integration with mock server, test API integration with MSW (Mock Service Worker), and test form submissions end-to-end.

**E2E Tests:**
Use Playwright or Cypress, test critical user journeys (login, send message, create timer), test on multiple browsers, test responsive behavior, and run on CI/CD pipeline.

---

## **DEPLOYMENT ARCHITECTURE**

### **26. INFRASTRUCTURE SETUP**

#### **Purpose**

Deploy application to production securely and reliably.

#### **Core Components**

**Docker Configuration:**
Dockerfile for Django backend using multi-stage builds for efficiency, Dockerfile for Next.js frontend, docker-compose for local development with all services, and production docker-compose with security hardening.

**Database Setup:**
PostgreSQL as primary database, Redis for caching and Celery, database migrations management, automated backups, and connection pooling with PgBouncer.

**Environment Configuration:**
Separate configs for dev, staging, production, use environment variables for secrets, validate required env vars on startup, and use .env.example as template.

**Reverse Proxy:**
Nginx as reverse proxy and load balancer, SSL/TLS termination, serve static files efficiently, WebSocket proxying configuration, and rate limiting and security headers.

---

### **27. CI/CD PIPELINE**

#### **Purpose**

Automate testing and deployment.

#### **Core Components**

**GitHub Actions Workflow:**

**On Pull Request:** Run linters (ESLint, Ruff), run type checkers (TypeScript, mypy), run unit tests, run integration tests, check code coverage, and check security vulnerabilities.

**On Merge to Main:** Run all PR checks, build Docker images, push to container registry, run E2E tests, and deploy to staging automatically.

**On Release Tag:** Deploy to production, run smoke tests, send deployment notifications, and create release notes.

**Deployment Strategy:**
Blue-green deployment for zero downtime, database migration automation, rollback capability, health checks before switching traffic, and automatic scaling based on load.

---

### **28. MONITORING & OBSERVABILITY**

#### **Purpose**

Track application health and performance.

#### **Core Components**

**Application Monitoring:**
Error tracking with Sentry, performance monitoring with APM tools, log aggregation with Datadog or Cloudwatch, uptime monitoring with Uptime Robot, and custom metrics dashboard.

**Backend Metrics:**
API response times, database query performance, Celery task metrics, WebSocket connection count, and error rates per endpoint.

**Frontend Metrics:**
Core Web Vitals (LCP, FID, CLS), page load times, API call latency from client, error rates in browser, and user engagement metrics.

**Alerting:**
Alert on error rate spikes, alert on slow API responses, alert on high CPU/memory usage, alert on failed deployments, and send to Slack or PagerDuty.

---

## **SECURITY CONSIDERATIONS**

### **29. SECURITY BEST PRACTICES**

#### **Purpose**

Protect user data and prevent attacks.

#### **Core Components**

**Authentication Security:**
Use HTTPS everywhere, implement JWT with short expiration, refresh token rotation, secure cookie settings (HttpOnly, Secure, SameSite), and rate limit login attempts.

**API Security:**
CORS configuration for Next.js origin, CSRF protection for state-changing operations, input validation on all endpoints, SQL injection prevention with ORM, and XSS prevention with content security policy.

**Data Protection:**
Encrypt sensitive data at rest, encrypt API keys in database, use environment variables for secrets, implement data retention policies, and provide GDPR-compliant data export/deletion.

**WebSocket Security:**
Authenticate WebSocket connections, validate message origins, rate limit WebSocket messages, implement message size limits, and prevent WebSocket flooding.

---

## **FEATURE IMPLEMENTATION ROADMAP**

### **Phase 1: Core Infrastructure (Weeks 1-2)**

- Django project setup with all apps
- Database models and migrations
- Basic REST API with DRF
- Next.js project setup with shadcn
- Authentication flow (login, register)
- Basic dashboard layout

### **Phase 2: Chat Functionality (Weeks 3-4)**

- WebSocket setup with Django Channels
- Chat interface in Next.js
- Bruno-core integration
- Message storage with bruno-memory
- Streaming response implementation
- Basic error handling

### **Phase 3: Ability Integration (Weeks 5-6)**

- Timer ability UI and backend
- Alarm ability UI and backend
- Notes ability UI and backend
- Ability execution framework
- Ability history tracking
- Error handling for abilities

### **Phase 4: User Management (Week 7)**

- User profile management
- Agent configuration UI
- Settings pages
- Preference storage
- Account deletion flow

### **Phase 5: Analytics & History (Week 8)**

- Conversation history page
- Ability execution history
- Usage analytics dashboard
- Data visualization
- Export functionality

### **Phase 6: Polish & Launch (Weeks 9-10)**

- Mobile responsive improvements
- Performance optimization
-
