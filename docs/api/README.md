# Bruno-PA REST API Documentation

Version: 1.0.0  
Base URL: `http://localhost:8000/api`

---

## Table of Contents

1. [Authentication](#authentication)
2. [Accounts](#accounts)
3. [Chat](#chat)
4. [Agents](#agents)
5. [Error Handling](#error-handling)
6. [Rate Limiting](#rate-limiting)

---

## Authentication

All API requests (except registration and login) require JWT authentication.

### Headers

```http
Authorization: Bearer <access_token>
```

### Obtain Token (Login)

**Endpoint:** `POST /api/auth/login`

**Request:**
```json
{
  "email": "user@example.com",
  "password": "securepassword"
}
```

**Response:**
```json
{
  "access_token": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "refresh_token": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "token_type": "Bearer",
  "expires_in": 3600,
  "user": {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "email": "user@example.com",
    "name": "John Doe"
  }
}
```

### Refresh Token

**Endpoint:** `POST /api/auth/refresh`

**Request:**
```json
{
  "refresh_token": "eyJ0eXAiOiJKV1QiLCJhbGc..."
}
```

**Response:**
```json
{
  "access_token": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "expires_in": 3600
}
```

---

## Accounts

### Register User

**Endpoint:** `POST /api/accounts/register`

**Request:**
```json
{
  "email": "user@example.com",
  "password": "securepassword",
  "name": "John Doe"
}
```

**Response:**
```json
{
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "email": "user@example.com",
  "name": "John Doe",
  "created_at": "2025-01-15T10:30:00Z"
}
```

### Get Current User

**Endpoint:** `GET /api/accounts/me`

**Headers:** Authorization required

**Response:**
```json
{
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "email": "user@example.com",
  "name": "John Doe",
  "avatar_url": "https://...",
  "created_at": "2025-01-15T10:30:00Z",
  "updated_at": "2025-01-15T10:30:00Z"
}
```

### Update User Profile

**Endpoint:** `PATCH /api/accounts/me`

**Headers:** Authorization required

**Request:**
```json
{
  "name": "Jane Doe",
  "avatar_url": "https://..."
}
```

**Response:**
```json
{
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "email": "user@example.com",
  "name": "Jane Doe",
  "avatar_url": "https://...",
  "updated_at": "2025-01-15T11:00:00Z"
}
```

---

## Chat

### List Conversations

**Endpoint:** `GET /api/chat/conversations`

**Headers:** Authorization required

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `page_size` (optional): Items per page (default: 20)
- `agent_id` (optional): Filter by agent

**Response:**
```json
{
  "count": 25,
  "next": "http://localhost:8000/api/chat/conversations?page=2",
  "previous": null,
  "results": [
    {
      "id": "conv-123",
      "title": "Help with Python code",
      "agent": {
        "id": "agent-456",
        "name": "Bruno"
      },
      "last_message": {
        "content": "Here's how you can...",
        "created_at": "2025-01-15T12:00:00Z"
      },
      "message_count": 10,
      "created_at": "2025-01-15T10:00:00Z",
      "updated_at": "2025-01-15T12:00:00Z"
    }
  ]
}
```

### Create Conversation

**Endpoint:** `POST /api/chat/conversations`

**Headers:** Authorization required

**Request:**
```json
{
  "agent_id": "agent-456",
  "title": "New conversation"
}
```

**Response:**
```json
{
  "id": "conv-123",
  "title": "New conversation",
  "agent": {
    "id": "agent-456",
    "name": "Bruno"
  },
  "message_count": 0,
  "created_at": "2025-01-15T12:00:00Z",
  "updated_at": "2025-01-15T12:00:00Z"
}
```

### Get Conversation

**Endpoint:** `GET /api/chat/conversations/{conversation_id}`

**Headers:** Authorization required

**Response:**
```json
{
  "id": "conv-123",
  "title": "Help with Python code",
  "agent": {
    "id": "agent-456",
    "name": "Bruno",
    "config": {
      "llm_provider": "openai",
      "model": "gpt-4"
    }
  },
  "message_count": 10,
  "created_at": "2025-01-15T10:00:00Z",
  "updated_at": "2025-01-15T12:00:00Z"
}
```

### List Messages

**Endpoint:** `GET /api/chat/conversations/{conversation_id}/messages`

**Headers:** Authorization required

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `page_size` (optional): Items per page (default: 50)

**Response:**
```json
{
  "count": 10,
  "next": null,
  "previous": null,
  "results": [
    {
      "id": "msg-789",
      "role": "user",
      "content": "How do I create a Python class?",
      "created_at": "2025-01-15T11:00:00Z"
    },
    {
      "id": "msg-790",
      "role": "assistant",
      "content": "To create a Python class, use the `class` keyword...",
      "created_at": "2025-01-15T11:00:05Z"
    }
  ]
}
```

### Send Message

**Endpoint:** `POST /api/chat/conversations/{conversation_id}/messages`

**Headers:** Authorization required

**Request:**
```json
{
  "content": "What is a Python decorator?"
}
```

**Response:**
```json
{
  "user_message": {
    "id": "msg-791",
    "role": "user",
    "content": "What is a Python decorator?",
    "created_at": "2025-01-15T12:00:00Z"
  },
  "assistant_message": {
    "id": "msg-792",
    "role": "assistant",
    "content": "A Python decorator is a design pattern...",
    "created_at": "2025-01-15T12:00:02Z"
  }
}
```

### Delete Conversation

**Endpoint:** `DELETE /api/chat/conversations/{conversation_id}`

**Headers:** Authorization required

**Response:**
```
204 No Content
```

---

## Agents

### List Agents

**Endpoint:** `GET /api/agents`

**Headers:** Authorization required

**Response:**
```json
{
  "count": 1,
  "results": [
    {
      "id": "agent-456",
      "name": "Bruno",
      "description": "Your personal AI assistant",
      "config": {
        "llm_provider": "openai",
        "model": "gpt-4",
        "temperature": 0.7,
        "max_tokens": 2000
      },
      "is_default": true,
      "created_at": "2025-01-15T10:00:00Z"
    }
  ]
}
```

### Get Agent

**Endpoint:** `GET /api/agents/{agent_id}`

**Headers:** Authorization required

**Response:**
```json
{
  "id": "agent-456",
  "name": "Bruno",
  "description": "Your personal AI assistant",
  "config": {
    "llm_provider": "openai",
    "model": "gpt-4",
    "temperature": 0.7,
    "max_tokens": 2000,
    "system_prompt": "You are Bruno, a helpful AI assistant..."
  },
  "is_default": true,
  "created_at": "2025-01-15T10:00:00Z",
  "updated_at": "2025-01-15T10:00:00Z"
}
```

### Update Agent Configuration

**Endpoint:** `PATCH /api/agents/{agent_id}`

**Headers:** Authorization required

**Request:**
```json
{
  "config": {
    "llm_provider": "ollama",
    "model": "llama2",
    "temperature": 0.8
  }
}
```

**Response:**
```json
{
  "id": "agent-456",
  "name": "Bruno",
  "config": {
    "llm_provider": "ollama",
    "model": "llama2",
    "temperature": 0.8,
    "max_tokens": 2000,
    "system_prompt": "You are Bruno, a helpful AI assistant..."
  },
  "updated_at": "2025-01-15T13:00:00Z"
}
```

---

## Error Handling

All errors follow this format:

```json
{
  "error": {
    "code": "validation_error",
    "message": "Invalid input data",
    "details": {
      "email": ["This field is required"]
    }
  }
}
```

### HTTP Status Codes

- `200 OK` - Request succeeded
- `201 Created` - Resource created successfully
- `204 No Content` - Request succeeded with no response body
- `400 Bad Request` - Invalid input data
- `401 Unauthorized` - Missing or invalid authentication
- `403 Forbidden` - Insufficient permissions
- `404 Not Found` - Resource not found
- `429 Too Many Requests` - Rate limit exceeded
- `500 Internal Server Error` - Server error

### Common Error Codes

- `validation_error` - Input validation failed
- `authentication_failed` - Invalid credentials
- `token_expired` - JWT token has expired
- `permission_denied` - Insufficient permissions
- `not_found` - Resource not found
- `rate_limit_exceeded` - Too many requests
- `llm_error` - LLM provider error

---

## Rate Limiting

API endpoints are rate-limited to prevent abuse.

**Limits:**
- Authenticated users: 100 requests per minute
- Unauthenticated: 20 requests per minute

**Headers:**
```http
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1642252800
```

---

## Pagination

List endpoints use cursor-based pagination.

**Query Parameters:**
- `page`: Page number (default: 1)
- `page_size`: Items per page (default: 20, max: 100)

**Response:**
```json
{
  "count": 100,
  "next": "http://localhost:8000/api/resource?page=2",
  "previous": null,
  "results": [...]
}
```

---

## Webhooks (Future)

Coming in future iterations:
- Conversation events
- Message delivery status
- Agent status updates

---

## SDKs and Client Libraries

Coming soon:
- Python SDK
- JavaScript/TypeScript SDK
- CLI tool

---

For more information, visit our [GitHub repository](https://github.com/meggy-ai/bruno-pa-webapp).
