# Task 10: Database Configuration Standardization

**Objective**: Ensure all database configuration details are loaded exclusively from `backend/.env` with no hardcoded values throughout the codebase.

---

## Current State Analysis

After reviewing the codebase, I found the following database configuration setup:

### Current Configuration Files:

- **`backend/config/settings/base.py`** - Uses `decouple.config()` to read from .env
- **`backend/config/settings/development.py`** - Has hardcoded PostgreSQL config overriding base.py
- **`backend/config/settings/production.py`** - Inherits from base.py (correct)
- **`backend/.env`** - Contains database configuration variables
- **`backend/manage.py`** - Hardcoded settings module reference

### Issues Identified:

1. **development.py** overrides database config with hardcoded values and `os.environ.get()` instead of using decouple
2. **manage.py** has hardcoded Django settings module path
3. **apps/api/apps.py** has SQLite-specific code that should be environment-dependent
4. Database files exist (db.sqlite3\*) suggesting mixed usage
5. Missing support for DATABASE_URL environment variable parsing

---

## Parent Tasks

### 1. **Standardize Database Configuration Loading**

- **Priority**: HIGH
- **Estimated Time**: 2 hours
- **Child Tasks**: 1.1, 1.2, 1.3, 1.4

### 2. **Environment Variable Management**

- **Priority**: MEDIUM
- **Estimated Time**: 1 hour
- **Child Tasks**: 2.1, 2.2

### 3. **Database Type Flexibility**

- **Priority**: MEDIUM
- **Estimated Time**: 1.5 hours
- **Child Tasks**: 3.1, 3.2, 3.3

### 4. **Code Cleanup and Validation**

- **Priority**: LOW
- **Estimated Time**: 30 minutes
- **Child Tasks**: 4.1, 4.2

---

## Child Tasks

### 1.1 **Fix development.py Database Configuration**

- **Status**: NOT STARTED
- **Description**: Remove hardcoded database config from development.py
- **Actions**:
  - Replace `os.environ.get()` calls with `decouple.config()`
  - Remove hardcoded DATABASES dictionary
  - Use base.py configuration with proper .env overrides
- **Files**: `backend/config/settings/development.py`

### 1.2 **Add DATABASE_URL Support**

- **Status**: NOT STARTED
- **Description**: Add support for single DATABASE_URL environment variable
- **Actions**:
  - Install and configure `dj-database-url` package
  - Modify base.py to parse DATABASE_URL if provided
  - Fallback to individual DB\_\* variables if DATABASE_URL not set
- **Files**: `backend/config/settings/base.py`, `backend/requirements/production.txt`

### 1.3 **Standardize Settings Module Loading**

- **Status**: NOT STARTED
- **Description**: Make Django settings module configurable via environment
- **Actions**:
  - Modify manage.py to use DJANGO_SETTINGS_MODULE from environment
  - Update startup scripts to set appropriate settings module
  - Document environment-based configuration
- **Files**: `backend/manage.py`, `scripts/start-dev-windows.ps1`

### 1.4 **Update Redis Configuration**

- **Status**: NOT STARTED
- **Description**: Ensure Redis URL is loaded from .env consistently
- **Actions**:
  - Verify Redis configuration uses decouple in all settings files
  - Add REDIS_URL to .env.example
  - Update development.py Redis config to use decouple
- **Files**: `backend/config/settings/development.py`, `backend/.env`

### 2.1 **Environment Variable Documentation**

- **Status**: NOT STARTED
- **Description**: Document all database-related environment variables
- **Actions**:
  - Update .env.example with all database options
  - Add comments explaining PostgreSQL vs SQLite configuration
  - Document DATABASE_URL format and individual variable format
- **Files**: `backend/.env.example`

### 2.2 **Environment Validation**

- **Status**: NOT STARTED
- **Description**: Add validation for required database environment variables
- **Actions**:
  - Add startup validation in Django settings
  - Provide clear error messages for missing required variables
  - Add database connectivity check
- **Files**: `backend/config/settings/base.py`

### 3.1 **Database Type Detection**

- **Status**: NOT STARTED
- **Description**: Make database engine selection environment-driven
- **Actions**:
  - Add DB_ENGINE environment variable support
  - Support 'postgresql', 'sqlite3' engine types
  - Provide sensible defaults based on environment
- **Files**: `backend/config/settings/base.py`, `backend/.env`

### 3.2 **SQLite Configuration Handling**

- **Status**: NOT STARTED
- **Description**: Make SQLite optimizations conditional on database type
- **Actions**:
  - Update apps.py SQLite WAL mode to check DB_ENGINE
  - Only apply SQLite-specific optimizations when using SQLite
  - Add database engine detection utility
- **Files**: `backend/apps/api/apps.py`

### 3.3 **Database File Management**

- **Status**: NOT STARTED
- **Description**: Handle existing SQLite files and provide migration path
- **Actions**:
  - Document SQLite vs PostgreSQL usage
  - Provide migration instructions if switching database types
  - Add .gitignore entries for SQLite files in correct locations
- **Files**: `backend/.gitignore`, documentation

### 4.1 **Remove Hardcoded Values Audit**

- **Status**: NOT STARTED
- **Description**: Final audit to ensure no hardcoded database values remain
- **Actions**:
  - Search entire codebase for hardcoded database references
  - Replace any remaining hardcoded values with environment variables
  - Verify all database connections use centralized configuration
- **Files**: All backend files

### 4.2 **Configuration Testing**

- **Status**: NOT STARTED
- **Description**: Test configuration works with both PostgreSQL and SQLite
- **Actions**:
  - Test startup with PostgreSQL configuration
  - Test startup with SQLite configuration
  - Verify DATABASE_URL and individual variables both work
  - Test configuration validation and error messages
- **Files**: Test configuration files

---

## Implementation Instructions

### Progress Tracking

Update this file as work progresses:

1. **Change task status** from "NOT STARTED" → "IN PROGRESS" → "COMPLETED"
2. **Add implementation notes** under each completed task
3. **Document any issues encountered** and their resolutions
4. **Update estimated time** if significantly different from actual time spent

### Task Status Format:

```
### X.Y **Task Name**
- **Status**: [NOT STARTED | IN PROGRESS | COMPLETED | BLOCKED]
- **Actual Time**: [X hours] (add when completed)
- **Implementation Notes**: [Add details about changes made]
- **Issues Encountered**: [Document any problems and solutions]
```

### Validation Checklist

When all tasks are completed, verify:

- [ ] No hardcoded database values anywhere in codebase
- [ ] All database config loaded from backend/.env exclusively
- [ ] Supports both PostgreSQL and SQLite via environment variables
- [ ] DATABASE*URL and individual DB*\* variables both supported
- [ ] All database-related environment variables documented
- [ ] Configuration validated at startup with helpful error messages
- [ ] Settings module configurable via DJANGO_SETTINGS_MODULE
- [ ] SQLite-specific optimizations only apply when using SQLite
- [ ] Redis configuration also loaded from .env consistently

---

## Dependencies

- **dj-database-url** package for DATABASE_URL parsing
- **python-decouple** (already installed) for environment variable management
- **PostgreSQL** or **SQLite** database system
- **Redis** for WebSocket channel layers

## Risk Assessment

- **Low Risk**: Most changes are configuration updates
- **Medium Risk**: Database connection changes could cause startup issues if misconfigured
- **Mitigation**: Test thoroughly with both database types before deployment

---

_Last Updated: December 16, 2025_
_Estimated Total Time: 5 hours_
_Priority: HIGH - Essential for deployment flexibility and environment consistency_
