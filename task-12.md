# Task 12: Frontend API URL Configuration Centralization

## Overview
Review frontend code to identify hardcoded backend API URLs and centralize configuration in a single config file.

## Analysis Summary

### Current Issues Found:

1. **API Base URL**: Currently using `process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api"` in multiple files
2. **WebSocket URL**: Hardcoded `localhost:8000` in chat components
3. **Missing Environment File**: No `.env.local` file exists in frontend

### Hardcoded URLs Identified:

1. **`src/lib/api.ts`** (Line 3-4):
   ```typescript
   const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";
   ```

2. **`lib/api.ts`** (Line 3-4):
   ```typescript  
   const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";
   ```

3. **`app/chat/page.tsx`** (Line 76):
   ```typescript
   const wsUrl = `${wsProtocol}//localhost:8000/ws/chat/?token=${token}`;
   ```

4. **Environment Variable Dependencies**:
   - `NEXT_PUBLIC_API_URL` (fallback: http://localhost:8000/api)
   - `NEXT_PUBLIC_WS_URL` (not implemented, using hardcoded)

## Implementation Plan

### Parent Tasks:

#### 1. Create Centralized Configuration System
- [x] Create frontend environment configuration file
- [x] Define configuration interface/types
- [x] Implement configuration loader utility

#### 2. Replace Hardcoded URLs
- [x] Update API base URL references
- [x] Update WebSocket URL references  
- [x] Remove duplicate api.ts files

#### 3. Environment Management
- [x] Create .env.local template
- [x] Update documentation
- [x] Add environment validation

#### 4. Testing & Validation
- [ ] Test all API endpoints work
- [ ] Test WebSocket connections work
- [ ] Verify environment variable loading

## Detailed Children Tasks:

### 1.1 Create Frontend Environment Config
- [x] Create `lib/config.ts` for centralized configuration
- [x] Define TypeScript interfaces for config structure
- [x] Add validation for required environment variables
- [x] Export typed config object

### 1.2 Create Environment Template
- [x] Create `.env.local.example` with all required variables
- [x] Add documentation comments for each variable
- [x] Include development and production examples

### 2.1 Update API Configuration  
- [x] Replace hardcoded URLs in `src/lib/api.ts`
- [x] Replace hardcoded URLs in `lib/api.ts` (check if duplicate)
- [x] Import config from centralized location
- [x] Remove fallback hardcoded values

### 2.2 Update WebSocket Configuration
- [x] Add `NEXT_PUBLIC_WS_URL` environment variable support
- [x] Update `app/chat/page.tsx` WebSocket connection
- [x] Use centralized config for WebSocket URL
- [x] Add fallback/validation for WebSocket URL

### 2.3 Code Cleanup
- [x] Remove duplicate `lib/api.ts` if it exists  
- [x] Consolidate API configuration in one location
- [x] Update all imports to use centralized config

### 3.1 Environment File Management
- [x] Create `.env.local` for local development
- [x] Update `.gitignore` to include/exclude env files appropriately
- [x] Add environment variable documentation

### 3.2 Update Documentation
- [x] Update setup instructions with environment variables
- [x] Add troubleshooting guide for configuration issues
- [x] Document all available environment variables

### 4.1 Validation & Testing
- [ ] Test API calls with environment variables
- [ ] Test WebSocket connections with environment variables  
- [ ] Test fallback behavior when env vars missing
- [ ] Verify no hardcoded URLs remain

### 4.2 Error Handling  
- [ ] Add meaningful error messages for missing config
- [ ] Add development vs production config validation
- [ ] Handle environment loading failures gracefully

## Recommended Configuration Structure

### Suggested `lib/config.ts`:
```typescript
interface AppConfig {
  api: {
    baseUrl: string;
    timeout: number;
  };
  websocket: {
    url: string;
    reconnectInterval: number;
  };
  app: {
    name: string;
    environment: 'development' | 'production' | 'test';
  };
}
```

### Suggested `.env.local.example`:
```env
# Backend API Configuration
NEXT_PUBLIC_API_URL=http://localhost:8000/api

# WebSocket Configuration  
NEXT_PUBLIC_WS_URL=ws://localhost:8000/ws

# App Configuration
NEXT_PUBLIC_APP_NAME=Bruno Personal Assistant
NEXT_PUBLIC_APP_ENV=development

# Optional: Disable Next.js telemetry
NEXT_TELEMETRY_DISABLED=1
```

## Progress Tracking

### ✅ Completed:
- [x] Frontend structure exploration
- [x] Hardcoded URL identification
- [x] Analysis documentation
- [x] Created centralized configuration system
- [x] Built lib/config.ts with TypeScript interfaces
- [x] Added environment validation and error handling
- [x] Created .env.local.example template
- [x] Removed duplicate api.ts files
- [x] Updated API configuration to use centralized config
- [x] Updated WebSocket URL in chat page
- [x] Created .env.local for local development
- [x] Tested configuration integration
- [x] Updated .gitignore for proper env file handling
- [x] Enhanced README with comprehensive setup guide
- [x] Created detailed troubleshooting section
- [x] Added environment variables reference table
- [x] Created comprehensive ENVIRONMENT_VARIABLES.md documentation

### 🚧 In Progress:
- [ ] Final testing and validation

### ⏳ Pending:
- [ ] URL replacement
- [ ] Environment file creation  
- [ ] Testing and validation

## Notes:
- Two `api.ts` files found (`src/lib/api.ts` and `lib/api.ts`) - need to check if duplicate
- WebSocket URL is completely hardcoded, needs environment variable support
- No `.env.local` file currently exists
- Current fallback of `localhost:8000` works for development but needs to be configurable
