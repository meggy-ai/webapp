# BRUNO-PA - ITERATION 1 IMPLEMENTATION PLAN

> **Comprehensive task breakdown for first iteration**

**Created:** December 12, 2025  
**Iteration Duration:** 2-3 weeks  
**Status:** Planning Complete, Ready for Implementation

---

## 📊 IMPLEMENTATION OVERVIEW

### Phases

| Phase | Name                        | Duration | Dependencies | Status      |
| ----- | --------------------------- | -------- | ------------ | ----------- |
| 0     | Project Restructuring       | 2 days   | None         | Not Started |
| 1     | Backend Foundation          | 3 days   | Phase 0      | Not Started |
| 2     | Backend Apps Implementation | 4 days   | Phase 1      | Not Started |
| 3     | Frontend Foundation         | 2 days   | Phase 0      | Not Started |
| 4     | Frontend Features           | 4 days   | Phase 2, 3   | Not Started |
| 5     | Integration & Testing       | 2 days   | Phase 2, 4   | Not Started |

**Total Estimated Time:** 17 days (2.5 weeks)

---

## 🗂️ PHASE 0: PROJECT RESTRUCTURING (2 Days)

**Goal:** Reorganize repository into monorepo structure with separate frontend and backend

### Parent Task 0.1: Repository Restructuring (4 hours)

**Children:**

- [ ] **0.1.1** - Create monorepo root directory structure
  - Create `/frontend` directory
  - Create `/backend` directory
  - Create `/docker` directory
  - Create `/docs` directory
  - Create root `.gitignore`
  - Create root `README.md`

- [ ] **0.1.2** - Move existing Next.js project to /frontend
  - Move all Next.js files to `/frontend`
  - Update package.json paths
  - Test that frontend still runs
  - Update import paths if needed

- [ ] **0.1.3** - Clean up existing frontend code
  - Remove unused components
  - Remove old test files that are not needed
  - Consolidate duplicate code
  - Update folder structure to match plan
  - Remove old progress tracking files

- [ ] **0.1.4** - Create backend project directory structure
  - Create `/backend/config` directory
  - Create `/backend/apps` directory
  - Create `/backend/core` directory
  - Create `/backend/requirements` directory
  - Create `/backend/manage.py` placeholder

### Parent Task 0.2: Development Environment Setup (4 hours)

**Children:**

- [ ] **0.2.1** - Create Docker configuration
  - Create `docker/backend.Dockerfile`
  - Create `docker/frontend.Dockerfile`
  - Create `docker/docker-compose.yml` with PostgreSQL, Django, Next.js
  - Create `docker/.env.example`
  - Test Docker compose up

- [ ] **0.2.2** - Set up development environment variables
  - Create `/backend/.env.example`
  - Create `/frontend/.env.local.example`
  - Document required environment variables
  - Add environment validation

- [ ] **0.2.3** - Update documentation
  - Create `/docs/setup/DEVELOPMENT.md` with setup instructions
  - Update root README.md with monorepo structure
  - Document Docker setup process
  - Add troubleshooting section

---

## 🔧 PHASE 1: BACKEND FOUNDATION (3 Days)

**Goal:** Set up Django project with core configuration

### Parent Task 1.1: Django Project Setup (4 hours)

**Children:**

- [ ] **1.1.1** - Initialize Django project
  - Install Django 5.0+
  - Create Django project in `/backend/config`
  - Configure project structure
  - Set up manage.py

- [ ] **1.1.2** - Configure Django settings
  - Create `settings/base.py` with common settings
  - Create `settings/development.py`
  - Create `settings/production.py`
  - Configure INSTALLED_APPS
  - Configure MIDDLEWARE
  - Set up SECRET_KEY management

- [ ] **1.1.3** - Configure database
  - Set up PostgreSQL connection in settings
  - Configure DATABASE settings
  - Test database connection
  - Create initial migration

- [ ] **1.1.4** - Set up requirements files
  - Create `requirements/base.txt`
  - Create `requirements/development.txt`
  - Create `requirements/production.txt`
  - Add Django, DRF, psycopg2, python-decouple
  - Add bruno-core, bruno-llm, bruno-memory

### Parent Task 1.2: Django REST Framework Setup (2 hours)

**Children:**

- [ ] **1.2.1** - Install and configure DRF
  - Add DRF to INSTALLED_APPS
  - Configure DRF settings (pagination, permissions)
  - Set up API URL routing
  - Configure CORS headers

- [ ] **1.2.2** - Set up API documentation
  - Install drf-spectacular
  - Configure schema generation
  - Create API documentation endpoint
  - Test Swagger UI access

### Parent Task 1.3: Authentication Setup (3 hours)

**Children:**

- [ ] **1.3.1** - Install JWT authentication
  - Install djangorestframework-simplejwt
  - Configure JWT settings (token lifetime, etc.)
  - Add JWT URLs to routing
  - Test token generation

- [ ] **1.3.2** - Configure CORS for Next.js
  - Install django-cors-headers
  - Configure CORS_ALLOWED_ORIGINS
  - Configure CORS_ALLOW_CREDENTIALS
  - Test CORS from frontend

### Parent Task 1.4: Create Django Apps (2 hours)

**Children:**

- [ ] **1.4.1** - Create accounts app
  - Run `python manage.py startapp accounts`
  - Move to `/backend/apps/accounts`
  - Add to INSTALLED_APPS
  - Create apps.py with proper config

- [ ] **1.4.2** - Create agents app
  - Run `python manage.py startapp agents`
  - Move to `/backend/apps/agents`
  - Add to INSTALLED_APPS

- [ ] **1.4.3** - Create chat app
  - Run `python manage.py startapp chat`
  - Move to `/backend/apps/chat`
  - Add to INSTALLED_APPS

- [ ] **1.4.4** - Create api app
  - Run `python manage.py startapp api`
  - Move to `/backend/apps/api`
  - Add to INSTALLED_APPS

---

## 👥 PHASE 2: BACKEND APPS IMPLEMENTATION (4 Days)

**Goal:** Implement core backend functionality

### Parent Task 2.1: Accounts App Implementation (6 hours)

**Children:**

- [ ] **2.1.1** - Create custom User model
  - Extend AbstractUser in models.py
  - Add fields: timezone, language_preference, created_at, updated_at
  - Add **str** method
  - Create migration

- [ ] **2.1.2** - Create UserProfile model
  - Create Profile model linked to User (OneToOne)
  - Add fields: avatar, bio, onboarding_completed
  - Create signal to auto-create profile on user creation
  - Create migration

- [ ] **2.1.3** - Create User serializers
  - Create UserSerializer for user data
  - Create UserRegistrationSerializer for signup
  - Create UserProfileSerializer for profile
  - Add validation logic

- [ ] **2.1.4** - Create authentication views
  - Create RegisterView (POST)
  - Create LoginView (using JWT)
  - Create LogoutView
  - Create RefreshTokenView
  - Add URL routing

- [ ] **2.1.5** - Create profile views
  - Create UserProfileView (GET, PUT)
  - Create ChangePasswordView (POST)
  - Add URL routing
  - Add permission classes

### Parent Task 2.2: Agents App Implementation (6 hours)

**Children:**

- [ ] **2.2.1** - Create Agent model
  - Create Agent model with owner (FK to User)
  - Add fields: name, description, llm_provider, llm_model, llm_parameters (JSONField)
  - Add fields: memory_backend, enabled_abilities (JSONField)
  - Add fields: is_active, created_at, updated_at
  - Create migration

- [ ] **2.2.2** - Create Bruno integration service
  - Create `/backend/core/bruno_integration/agent_service.py`
  - Implement BrunoAgentService class
  - Add method: initialize_agent(agent_config)
  - Add method: process_message(agent_instance, message)
  - Add bruno-core BaseAssistant integration

- [ ] **2.2.3** - Create LLM provider service
  - Create `/backend/core/bruno_integration/llm_service.py`
  - Implement LLMProviderService class
  - Add method: get_provider(provider_name, config)
  - Integrate with bruno-llm
  - Support OpenAI provider

- [ ] **2.2.4** - Create Agent serializers
  - Create AgentSerializer for agent data
  - Create AgentConfigSerializer for configuration
  - Add validation for LLM parameters
  - Add validation for enabled abilities

- [ ] **2.2.5** - Create Agent views
  - Create AgentViewSet (list, retrieve, update)
  - Create InitializeAgentView (POST)
  - Add auto-creation of default agent on user registration
  - Add URL routing

### Parent Task 2.3: Chat App Implementation (8 hours)

**Children:**

- [ ] **2.3.1** - Create Conversation model
  - Create Conversation model with user (FK to User)
  - Add fields: title, created_at, updated_at, message_count
  - Add method: generate_title_from_first_message()
  - Create migration

- [ ] **2.3.2** - Create Message model
  - Create Message model with conversation (FK to Conversation)
  - Add fields: role (user/assistant), content, metadata (JSONField)
  - Add fields: created_at, tokens_used
  - Add ordering by created_at
  - Create migration

- [ ] **2.3.3** - Create memory integration service
  - Create `/backend/core/bruno_integration/memory_service.py`
  - Implement MemoryService class
  - Add method: store_conversation(conversation_id, messages)
  - Add method: retrieve_context(conversation_id)
  - Integrate with bruno-memory

- [ ] **2.3.4** - Create message processor service
  - Create `/backend/core/services/message_processor.py`
  - Implement MessageProcessor class
  - Add method: process_user_message(user, conversation, message)
  - Call BrunoAgentService to process message
  - Store user message and assistant response
  - Handle errors gracefully

- [ ] **2.3.5** - Create Chat serializers
  - Create ConversationSerializer with nested messages
  - Create MessageSerializer
  - Create CreateMessageSerializer for sending messages
  - Add validation

- [ ] **2.3.6** - Create Chat views
  - Create ConversationViewSet (list, retrieve, create, destroy)
  - Create MessageViewSet (list, create)
  - Create SendMessageView (POST) - processes and returns response
  - Add URL routing
  - Add pagination for messages

### Parent Task 2.4: API Integration (4 hours)

**Children:**

- [ ] **2.4.1** - Set up API URL routing
  - Create `/backend/apps/api/urls.py`
  - Register all viewsets with routers
  - Set up nested routing (conversations/messages)
  - Include in main urls.py

- [ ] **2.4.2** - Add API permissions
  - Create custom permission: IsOwner
  - Apply permissions to all viewsets
  - Test permission enforcement

- [ ] **2.4.3** - Add error handling middleware
  - Create custom exception handler
  - Format error responses consistently
  - Add logging for errors
  - Handle bruno-core exceptions

- [ ] **2.4.4** - Test API endpoints
  - Test all endpoints with Postman/Insomnia
  - Verify authentication works
  - Verify CORS works
  - Verify error handling
  - Document any issues

---

## 💻 PHASE 3: FRONTEND FOUNDATION (2 Days)

**Goal:** Set up frontend core structure and services

### Parent Task 3.1: Frontend Structure Cleanup (3 hours)

**Children:**

- [ ] **3.1.1** - Reorganize folder structure
  - Move components to proper folders (auth, chat, layouts)
  - Create `/src/services` directory
  - Create `/src/stores` directory
  - Create `/src/types` directory
  - Remove unused files

- [ ] **3.1.2** - Update dependencies
  - Install axios
  - Install zustand
  - Install react-markdown
  - Update shadcn/ui components
  - Remove unused dependencies

- [ ] **3.1.3** - Set up TypeScript types
  - Create `/src/types/auth.ts`
  - Create `/src/types/chat.ts`
  - Create `/src/types/agent.ts`
  - Create `/src/types/api.ts`
  - Define interfaces matching backend models

### Parent Task 3.2: API Service Layer (4 hours)

**Children:**

- [ ] **3.2.1** - Create API client
  - Create `/src/services/api/client.ts`
  - Set up axios instance with base URL
  - Add request interceptor to attach JWT token
  - Add response interceptor for error handling
  - Implement token refresh logic

- [ ] **3.2.2** - Create auth service
  - Create `/src/services/api/auth.ts`
  - Add login(email, password) method
  - Add register(name, email, password) method
  - Add logout() method
  - Add refreshToken() method
  - Add getProfile() method

- [ ] **3.2.3** - Create chat service
  - Create `/src/services/api/chat.ts`
  - Add getConversations() method
  - Add getConversation(id) method
  - Add createConversation() method
  - Add sendMessage(conversationId, message) method
  - Add deleteConversation(id) method

- [ ] **3.2.4** - Create agent service
  - Create `/src/services/api/agent.ts`
  - Add getAgent() method
  - Add updateAgent(config) method

### Parent Task 3.3: State Management Setup (3 hours)

**Children:**

- [ ] **3.3.1** - Create auth store
  - Create `/src/stores/authStore.ts`
  - Add state: user, tokens, isAuthenticated
  - Add actions: login, logout, setUser, setTokens
  - Add persist middleware for tokens
  - Add token expiry check

- [ ] **3.3.2** - Create chat store
  - Create `/src/stores/chatStore.ts`
  - Add state: conversations, activeConversationId, messages
  - Add actions: setConversations, setActiveConversation, addMessage
  - Add computed: activeConversation, activeMessages

- [ ] **3.3.3** - Create agent store
  - Create `/src/stores/agentStore.ts`
  - Add state: agent, configuration
  - Add actions: setAgent, updateConfiguration

### Parent Task 3.4: Authentication Context (2 hours)

**Children:**

- [ ] **3.4.1** - Create auth provider
  - Create `/src/components/providers/AuthProvider.tsx`
  - Use auth store
  - Handle initial token validation
  - Set up automatic token refresh

- [ ] **3.4.2** - Create protected route wrapper
  - Create `/src/components/auth/ProtectedRoute.tsx`
  - Check authentication status
  - Redirect to login if not authenticated
  - Show loading state during check

---

## 🎨 PHASE 4: FRONTEND FEATURES (4 Days)

**Goal:** Implement user-facing features

### Parent Task 4.1: Authentication Pages (4 hours)

**Children:**

- [ ] **4.1.1** - Create login page
  - Create `/src/app/(auth)/login/page.tsx`
  - Create login form component with validation
  - Add email and password fields
  - Handle form submission
  - Show error messages
  - Redirect to /chat on success

- [ ] **4.1.2** - Create register page
  - Create `/src/app/(auth)/register/page.tsx`
  - Create register form component
  - Add name, email, password, confirm password fields
  - Add validation (password strength, etc.)
  - Handle form submission
  - Show success message
  - Redirect to /chat on success

- [ ] **4.1.3** - Style auth pages
  - Use shadcn/ui components
  - Add responsive design
  - Add loading states
  - Add error states
  - Match existing design system

### Parent Task 4.2: Dashboard Layout (4 hours)

**Children:**

- [ ] **4.2.1** - Create main layout
  - Create `/src/app/(dashboard)/layout.tsx`
  - Add ProtectedRoute wrapper
  - Set up sidebar and main content area
  - Make responsive (collapse sidebar on mobile)

- [ ] **4.2.2** - Create sidebar component
  - Create `/src/components/layouts/Sidebar.tsx`
  - Add navigation items (Chat, Settings)
  - Add user menu at bottom
  - Add collapse/expand functionality
  - Style with Tailwind

- [ ] **4.2.3** - Create top navigation
  - Create `/src/components/layouts/TopNav.tsx`
  - Add breadcrumbs
  - Add user avatar and dropdown
  - Add logout functionality

- [ ] **4.2.4** - Create user menu
  - Create `/src/components/layouts/UserMenu.tsx`
  - Show user name and email
  - Add Settings link
  - Add Logout button
  - Add dropdown animations

### Parent Task 4.3: Chat Interface (8 hours)

**Children:**

- [ ] **4.3.1** - Create chat page layout
  - Create `/src/app/(dashboard)/chat/page.tsx`
  - Set up two-column layout (sidebar + chat)
  - Make responsive (hide sidebar on mobile, add toggle)

- [ ] **4.3.2** - Create conversation list component
  - Create `/src/components/chat/ConversationList.tsx`
  - Fetch conversations from API
  - Display conversation items with title and timestamp
  - Highlight active conversation
  - Add "New Conversation" button
  - Handle click to switch conversation
  - Add loading and empty states

- [ ] **4.3.3** - Create message list component
  - Create `/src/components/chat/MessageList.tsx`
  - Display messages for active conversation
  - Style user messages (right-aligned)
  - Style assistant messages (left-aligned)
  - Add timestamps
  - Auto-scroll to bottom on new message
  - Add loading state while fetching

- [ ] **4.3.4** - Create message bubble component
  - Create `/src/components/chat/MessageBubble.tsx`
  - Different styles for user vs assistant
  - Show avatar/icon
  - Render markdown content with react-markdown
  - Add code syntax highlighting
  - Add copy button for code blocks

- [ ] **4.3.5** - Create message input component
  - Create `/src/components/chat/MessageInput.tsx`
  - Multi-line textarea with auto-resize
  - Send button
  - Handle Enter key to send (Shift+Enter for new line)
  - Disable while sending
  - Show character count or limit

- [ ] **4.3.6** - Implement send message flow
  - Connect input to chat service
  - Optimistically add user message to UI
  - Call API to send message
  - Add assistant response when received
  - Handle errors (show retry option)
  - Show loading indicator

- [ ] **4.3.7** - Implement conversation management
  - Create new conversation on first message
  - Auto-generate conversation title from first message
  - Switch between conversations
  - Delete conversation with confirmation
  - Update conversation list on changes

### Parent Task 4.4: Settings Page (3 hours)

**Children:**

- [ ] **4.4.1** - Create settings page
  - Create `/src/app/(dashboard)/settings/page.tsx`
  - Add tabs for different settings sections

- [ ] **4.4.2** - Create profile settings
  - Show current user info (name, email)
  - Add edit profile form
  - Add change password section
  - Handle form submissions

- [ ] **4.4.3** - Create agent configuration settings
  - Show current agent configuration
  - Add LLM provider selection
  - Add model selection
  - Add parameter sliders (temperature, max tokens)
  - Save configuration to backend

### Parent Task 4.5: UI Polish (3 hours)

**Children:**

- [ ] **4.5.1** - Add loading states
  - Skeleton screens for lists
  - Spinners for actions
  - Loading overlays where appropriate

- [ ] **4.5.2** - Add error handling UI
  - Error messages with icons
  - Retry buttons for failed actions
  - Toast notifications for success/error
  - 404 and error pages

- [ ] **4.5.3** - Add empty states
  - Empty conversation list state
  - No messages in conversation state
  - Helpful messages and CTAs

- [ ] **4.5.4** - Improve mobile responsiveness
  - Test on mobile viewport
  - Fix any layout issues
  - Ensure touch targets are adequate
  - Test chat interface on mobile

---

## 🔗 PHASE 5: INTEGRATION & TESTING (2 Days)

**Goal:** Connect everything and ensure it works end-to-end

### Parent Task 5.1: Backend Integration Testing (4 hours)

**Children:**

- [ ] **5.1.1** - Test bruno-core integration
  - Verify agent initialization works
  - Test message processing
  - Verify responses are generated
  - Check error handling

- [ ] **5.1.2** - Test bruno-llm integration
  - Verify OpenAI provider works
  - Test with actual API key
  - Verify token counting
  - Check rate limiting

- [ ] **5.1.3** - Test bruno-memory integration
  - Verify conversation storage
  - Test context retrieval
  - Verify messages are persisted
  - Check conversation history

- [ ] **5.1.4** - Test API endpoints comprehensively
  - Test all CRUD operations
  - Test authentication flow
  - Test permissions
  - Test error cases
  - Document any bugs

### Parent Task 5.2: Frontend Integration Testing (4 hours)

**Children:**

- [ ] **5.2.1** - Test authentication flow
  - Test registration
  - Test login
  - Test logout
  - Test token refresh
  - Test protected routes

- [ ] **5.2.2** - Test chat functionality
  - Send messages and verify responses
  - Test conversation creation
  - Test conversation switching
  - Test conversation deletion
  - Test markdown rendering

- [ ] **5.2.3** - Test settings functionality
  - Update profile information
  - Change agent configuration
  - Verify changes persist

- [ ] **5.2.4** - Test error handling
  - Test with network errors
  - Test with invalid inputs
  - Test with expired tokens
  - Verify error messages are helpful

### Parent Task 5.3: End-to-End User Flows (3 hours)

**Children:**

- [ ] **5.3.1** - Test complete registration to chat flow
  - Register new account
  - Verify default agent is created
  - Send first message
  - Verify response
  - Create multiple conversations

- [ ] **5.3.2** - Test returning user flow
  - Login with existing account
  - View conversation history
  - Continue previous conversation
  - Create new conversation

- [ ] **5.3.3** - Test mobile experience
  - Test on mobile device or emulator
  - Verify responsive design works
  - Test all interactions on touch
  - Note any mobile-specific issues

### Parent Task 5.4: Bug Fixes & Polish (5 hours)

**Children:**

- [ ] **5.4.1** - Fix critical bugs
  - Address any bugs found during testing
  - Prioritize by severity
  - Test fixes thoroughly

- [ ] **5.4.2** - Performance optimization
  - Check API response times
  - Optimize slow queries
  - Add database indexes if needed
  - Optimize frontend bundle size

- [ ] **5.4.3** - Code cleanup
  - Remove console.logs
  - Remove commented code
  - Add missing comments
  - Format code consistently

- [ ] **5.4.4** - Update documentation
  - Document API endpoints
  - Update README with current state
  - Add setup instructions
  - Document known limitations

---

## 📝 TASK TRACKING GUIDELINES

### Task Status

- **Not Started** - Task hasn't been begun
- **In Progress** - Currently working on task
- **Blocked** - Can't proceed due to dependency or issue
- **Completed** - Task is done and verified
- **Skipped** - Task was intentionally skipped

### Marking Tasks Complete

When completing a task:

1. Mark checkbox as [x]
2. Update status in progress tracker
3. Note completion time
4. Document any issues or deviations
5. Update dependencies if needed

### Handling Blockers

If blocked:

1. Mark task as Blocked
2. Document what's blocking
3. Note workarounds if any
4. Escalate if needed

---

## ⚠️ CRITICAL NOTES

### Must Do First

1. Set up Docker environment before starting backend
2. Get OpenAI API key for testing
3. Set up PostgreSQL database
4. Configure environment variables properly

### Dependencies

- Frontend development can start in parallel with backend (Phase 3)
- Frontend features (Phase 4) require backend API (Phase 2) to be complete
- Integration (Phase 5) requires both frontend and backend complete

### Risk Areas

1. **Bruno package integration** - Test early and often
2. **Authentication tokens** - Ensure refresh logic works properly
3. **Database migrations** - Be careful with schema changes
4. **CORS configuration** - Must be set correctly for local development

---

## 🎯 NEXT STEPS

After completing this plan:

1. Review with team (if applicable)
2. Set up project management tool (GitHub Projects, Jira, etc.)
3. Create iteration-1-progress.md tracker
4. Begin Phase 0: Project Restructuring
5. Have daily check-ins to track progress
6. Update progress tracker as tasks complete

---

**Ready to start implementation!** 🚀

_Refer to requirement-overview.md for detailed scope and iteration-1-progress.md for tracking._
