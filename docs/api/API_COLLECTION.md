# Bruno PA API Collection

Complete reference guide for all available API endpoints with sample payloads and responses.

## Base URL
```
http://localhost:8000/api/
```

## Authentication
All endpoints (except registration and login) require JWT authentication. Include the token in the Authorization header:
```
Authorization: Bearer <access_token>
```

---

## 🔐 Authentication Endpoints

### 1. Register User
```http
POST /api/auth/register/
```
**Payload:**
```json
{
  "email": "user@example.com",
  "name": "John Doe",
  "password": "securepassword123"
}
```
**Response:**
```json
{
  "user": {
    "id": "uuid-here",
    "email": "user@example.com",
    "name": "John Doe",
    "avatar_url": null,
    "is_active": true,
    "created_at": "2025-12-18T16:45:00Z",
    "updated_at": "2025-12-18T16:45:00Z"
  },
  "access_token": "jwt-access-token",
  "refresh_token": "jwt-refresh-token"
}
```

### 2. Login
```http
POST /api/auth/login/
```
**Payload:**
```json
{
  "email": "user@example.com",
  "password": "securepassword123"
}
```
**Response:** Same as registration

### 3. Refresh Token
```http
POST /api/auth/refresh/
```
**Payload:**
```json
{
  "refresh_token": "jwt-refresh-token"
}
```
**Response:**
```json
{
  "access_token": "new-jwt-access-token"
}
```

### 4. Logout
```http
POST /api/auth/logout/
```
**Response:**
```json
{
  "message": "Successfully logged out"
}
```

---

## 👤 User Endpoints

### 1. Get Current User
```http
GET /api/users/me/
```
**Response:**
```json
{
  "id": "uuid-here",
  "email": "user@example.com",
  "name": "John Doe",
  "avatar_url": null,
  "is_active": true,
  "created_at": "2025-12-18T16:45:00Z",
  "updated_at": "2025-12-18T16:45:00Z"
}
```

### 2. List Users (Admin Only)
```http
GET /api/users/
```

### 3. Update Current User
```http
PATCH /api/users/{id}/
```
**Payload:**
```json
{
  "name": "Updated Name",
  "avatar_url": "https://example.com/avatar.jpg"
}
```

### 4. Get User by ID
```http
GET /api/users/{id}/
```

---

## 🤖 Agent Endpoints

### 1. Get Default Agent
```http
GET /api/agents/default/
```
**Response:**
```json
{
  "id": "agent-uuid",
  "name": "Bruno",
  "description": "",
  "llm_provider": "ollama",
  "model": "mistral:7b",
  "temperature": 0.7,
  "max_tokens": 2000,
  "system_prompt": "You are Bruno, a helpful AI assistant.",
  "is_default": true,
  "is_active": true,
  "created_at": "2025-12-18T16:45:00Z",
  "updated_at": "2025-12-18T16:45:00Z"
}
```

### 2. List User Agents
```http
GET /api/agents/
```
**Response:**
```json
[
  {
    "id": "agent-uuid",
    "name": "Bruno",
    "description": "Default AI assistant",
    "llm_provider": "ollama",
    "model": "mistral:7b",
    "temperature": 0.7,
    "max_tokens": 2000,
    "system_prompt": "You are Bruno, a helpful AI assistant.",
    "is_default": true,
    "is_active": true,
    "created_at": "2025-12-18T16:45:00Z",
    "updated_at": "2025-12-18T16:45:00Z"
  }
]
```

### 3. Create Agent
```http
POST /api/agents/
```
**Payload:**
```json
{
  "name": "Custom Bruno",
  "description": "My custom AI assistant",
  "llm_provider": "openai",
  "model": "gpt-4",
  "temperature": 0.8,
  "max_tokens": 4000,
  "system_prompt": "You are a specialized assistant for coding tasks."
}
```

### 4. Update Agent
```http
PATCH /api/agents/{id}/
```
**Payload:**
```json
{
  "name": "Updated Bruno",
  "temperature": 0.9,
  "system_prompt": "Updated system prompt"
}
```

### 5. Delete Agent
```http
DELETE /api/agents/{id}/
```

### 6. Get Agent by ID
```http
GET /api/agents/{id}/
```

---

## 💬 Conversation Endpoints

### 1. Get or Create Main Conversation
```http
GET /api/conversations/get_or_create/
```
**Response:**
```json
{
  "conversation": {
    "id": "conv-uuid",
    "agent": "agent-uuid",
    "title": "New Conversation",
    "messages": [],
    "message_count": 0,
    "created_at": "2025-12-18T16:45:00Z",
    "updated_at": "2025-12-18T16:45:00Z"
  },
  "created": true
}
```

### 2. List Conversations
```http
GET /api/conversations/
```
**Response:**
```json
[
  {
    "id": "conv-uuid",
    "agent": "agent-uuid",
    "title": "Chat about API Design",
    "message_count": 15,
    "last_message": {
      "role": "assistant",
      "content": "That's a great approach to API design...",
      "created_at": "2025-12-18T16:45:00Z"
    },
    "created_at": "2025-12-18T16:30:00Z",
    "updated_at": "2025-12-18T16:45:00Z"
  }
]
```

### 3. Send Message
```http
POST /api/conversations/{id}/send_message/
```
**Payload:**
```json
{
  "content": "Hello, can you help me with something?",
  "is_response_to_proactive": false,
  "is_task_command": null
}
```
**Response:**
```json
{
  "user_message": {
    "id": "msg-uuid-1",
    "conversation": "conv-uuid",
    "role": "user",
    "content": "Hello, can you help me with something?",
    "tokens_used": 0,
    "model": null,
    "created_at": "2025-12-18T16:45:00Z"
  },
  "assistant_message": {
    "id": "msg-uuid-2",
    "conversation": "conv-uuid",
    "role": "assistant",
    "content": "Hello! I'm Bruno, your AI assistant. I'd be happy to help you with whatever you need.",
    "tokens_used": 25,
    "model": "mistral:7b",
    "created_at": "2025-12-18T16:45:01Z"
  },
  "success": true
}
```

### 4. Check for Proactive Message
```http
GET /api/conversations/{id}/check_proactive/
```
**Response (No proactive message):**
```json
{
  "should_send": false,
  "reason": "Not enough time passed since last message",
  "proactivity_level": 5
}
```
**Response (Proactive message available):**
```json
{
  "should_send": true,
  "message": {
    "id": "msg-uuid",
    "conversation": "conv-uuid",
    "role": "assistant",
    "content": "Hey! I noticed you've been working for a while. How's your project going?",
    "tokens_used": 18,
    "model": "mistral:7b",
    "created_at": "2025-12-18T16:45:00Z"
  },
  "proactivity_level": 5,
  "metadata": {
    "trigger_reason": "time_based",
    "engagement_level": "medium"
  }
}
```

### 5. Adjust Proactivity (Manual)
```http
POST /api/conversations/{id}/adjust_proactivity/
```
**Response:**
```json
{
  "old_level": 5,
  "new_level": 6,
  "total_proactive": 10,
  "responses_received": 7,
  "response_rate": 0.7
}
```

### 6. Get Proactivity Settings
```http
GET /api/conversations/{id}/proactivity_settings/
```
**Response:**
```json
{
  "proactive_messages_enabled": true,
  "auto_adjust_proactivity": true,
  "proactivity_level": 5,
  "min_proactivity_level": 1,
  "max_proactivity_level": 10,
  "quiet_hours_start": "22:00:00",
  "quiet_hours_end": "08:00:00",
  "total_proactive_messages": 3,
  "proactive_responses_received": 2,
  "response_rate": 0.67
}
```

### 7. Update Proactivity Settings
```http
PATCH /api/conversations/{id}/update_proactivity_settings/
```
**Payload:**
```json
{
  "proactive_messages_enabled": true,
  "auto_adjust_proactivity": false,
  "proactivity_level": 7,
  "min_proactivity_level": 3,
  "max_proactivity_level": 8,
  "quiet_hours_start": "23:00",
  "quiet_hours_end": "07:00"
}
```
**Response:**
```json
{
  "message": "Proactivity settings updated successfully",
  "settings": {
    "proactive_messages_enabled": true,
    "auto_adjust_proactivity": false,
    "proactivity_level": 7,
    "min_proactivity_level": 3,
    "max_proactivity_level": 8,
    "quiet_hours_start": "23:00:00",
    "quiet_hours_end": "07:00:00"
  }
}
```

### 8. Get Conversation by ID
```http
GET /api/conversations/{id}/
```
**Response:**
```json
{
  "id": "conv-uuid",
  "agent": "agent-uuid",
  "title": "Chat about API Design",
  "messages": [
    {
      "id": "msg-uuid-1",
      "conversation": "conv-uuid",
      "role": "user",
      "content": "Can you help me design an API?",
      "tokens_used": 0,
      "model": null,
      "created_at": "2025-12-18T16:30:00Z"
    },
    {
      "id": "msg-uuid-2",
      "conversation": "conv-uuid",
      "role": "assistant",
      "content": "I'd be happy to help you design an API! What kind of application are you building?",
      "tokens_used": 20,
      "model": "mistral:7b",
      "created_at": "2025-12-18T16:30:05Z"
    }
  ],
  "message_count": 2,
  "created_at": "2025-12-18T16:30:00Z",
  "updated_at": "2025-12-18T16:30:05Z"
}
```

### 9. Create Conversation
```http
POST /api/conversations/
```
**Payload:**
```json
{
  "title": "New Project Discussion",
  "agent": "agent-uuid"
}
```

### 10. Update Conversation
```http
PATCH /api/conversations/{id}/
```
**Payload:**
```json
{
  "title": "Updated Conversation Title"
}
```

### 11. Delete Conversation
```http
DELETE /api/conversations/{id}/
```

---

## 📨 Message Endpoints

### 1. List Messages
```http
GET /api/messages/
```
**Query Parameters:**
- `conversation`: Filter by conversation ID
- `before`: Load messages before this message ID (for pagination)
- `limit`: Maximum number of messages to return

**Example:**
```http
GET /api/messages/?conversation=conv-uuid&limit=50&before=msg-uuid
```
**Response:**
```json
[
  {
    "id": "msg-uuid-1",
    "conversation": "conv-uuid",
    "role": "user",
    "content": "Hello, how are you?",
    "tokens_used": 0,
    "model": null,
    "created_at": "2025-12-18T16:45:00Z"
  },
  {
    "id": "msg-uuid-2",
    "conversation": "conv-uuid",
    "role": "assistant",
    "content": "Hello! I'm doing well, thank you for asking. How can I help you today?",
    "tokens_used": 18,
    "model": "mistral:7b",
    "created_at": "2025-12-18T16:45:02Z"
  }
]
```

### 2. Get Message by ID
```http
GET /api/messages/{id}/
```
**Response:**
```json
{
  "id": "msg-uuid",
  "conversation": "conv-uuid",
  "role": "assistant",
  "content": "Here's a detailed response to your question...",
  "tokens_used": 45,
  "model": "mistral:7b",
  "created_at": "2025-12-18T16:45:00Z"
}
```

---

## ⏰ Timer Endpoints

### 1. Create Timer
```http
POST /api/timers/
```
**Payload:**
```json
{
  "name": "Work Session",
  "duration_seconds": 1500
}
```
**Response:**
```json
{
  "id": "timer-uuid",
  "name": "Work Session",
  "duration_seconds": 1500,
  "end_time": "2025-12-18T17:10:00Z",
  "status": "active",
  "time_remaining": 1500,
  "time_remaining_display": "25:00",
  "three_minute_warning_sent": false,
  "completion_notification_sent": false,
  "created_at": "2025-12-18T16:45:00Z",
  "updated_at": "2025-12-18T16:45:00Z"
}
```

### 2. List User Timers
```http
GET /api/timers/
```
**Response:**
```json
[
  {
    "id": "timer-uuid-1",
    "name": "Work Session",
    "duration_seconds": 1500,
    "end_time": "2025-12-18T17:10:00Z",
    "status": "active",
    "time_remaining": 1200,
    "time_remaining_display": "20:00",
    "three_minute_warning_sent": false,
    "completion_notification_sent": false,
    "created_at": "2025-12-18T16:45:00Z",
    "updated_at": "2025-12-18T16:45:00Z"
  },
  {
    "id": "timer-uuid-2",
    "name": "Break Timer",
    "duration_seconds": 300,
    "end_time": "2025-12-18T16:50:00Z",
    "status": "completed",
    "time_remaining": 0,
    "time_remaining_display": "00:00",
    "three_minute_warning_sent": true,
    "completion_notification_sent": true,
    "created_at": "2025-12-18T16:40:00Z",
    "updated_at": "2025-12-18T16:50:00Z"
  }
]
```

### 3. Get Active Timers Only
```http
GET /api/timers/active/
```
**Response:**
```json
[
  {
    "id": "timer-uuid",
    "name": "Work Session",
    "duration_seconds": 1500,
    "end_time": "2025-12-18T17:10:00Z",
    "status": "active",
    "time_remaining": 1200,
    "time_remaining_display": "20:00",
    "three_minute_warning_sent": false,
    "completion_notification_sent": false,
    "created_at": "2025-12-18T16:45:00Z",
    "updated_at": "2025-12-18T16:45:00Z"
  }
]
```

### 4. Get Timer by ID
```http
GET /api/timers/{id}/
```

### 5. Update Timer
```http
PATCH /api/timers/{id}/
```
**Payload:**
```json
{
  "name": "Updated Timer Name"
}
```

### 6. Pause Timer
```http
POST /api/timers/{id}/pause/
```
**Response:**
```json
{
  "id": "timer-uuid",
  "name": "Work Session",
  "duration_seconds": 1500,
  "end_time": null,
  "status": "paused",
  "time_remaining": 1200,
  "time_remaining_display": "20:00",
  "three_minute_warning_sent": false,
  "completion_notification_sent": false,
  "created_at": "2025-12-18T16:45:00Z",
  "updated_at": "2025-12-18T16:50:00Z"
}
```

### 7. Resume Timer
```http
POST /api/timers/{id}/resume/
```
**Response:**
```json
{
  "id": "timer-uuid",
  "name": "Work Session",
  "duration_seconds": 1500,
  "end_time": "2025-12-18T17:15:00Z",
  "status": "active",
  "time_remaining": 1200,
  "time_remaining_display": "20:00",
  "three_minute_warning_sent": false,
  "completion_notification_sent": false,
  "created_at": "2025-12-18T16:45:00Z",
  "updated_at": "2025-12-18T16:55:00Z"
}
```

### 8. Cancel Timer
```http
POST /api/timers/{id}/cancel/
```
**Response:**
```json
{
  "id": "timer-uuid",
  "name": "Work Session",
  "duration_seconds": 1500,
  "end_time": null,
  "status": "cancelled",
  "time_remaining": 0,
  "time_remaining_display": "00:00",
  "three_minute_warning_sent": false,
  "completion_notification_sent": false,
  "created_at": "2025-12-18T16:45:00Z",
  "updated_at": "2025-12-18T16:50:00Z"
}
```

### 9. Cancel All Timers
```http
POST /api/timers/cancel_all/
```
**Response:**
```json
{
  "message": "Successfully cancelled 2 timers",
  "count": 2
}
```

### 10. Delete Timer
```http
DELETE /api/timers/{id}/
```

---

## 🏥 Health & Status Endpoints

### 1. API Root
```http
GET /api/
```
**Response:**
```json
{
  "message": "Bruno PA API is running",
  "version": "1.0.0",
  "status": "healthy"
}
```

### 2. Health Check
```http
GET /api/health/
```
**Response:**
```json
{
  "status": "healthy",
  "service": "Bruno PA API"
}
```

---

## 🎯 Special Features

### Timer Commands via Chat
You can create and manage timers through natural language in chat messages. The API automatically detects timer commands and handles them appropriately.

**Examples:**
```http
POST /api/conversations/{id}/send_message/
```

**Set Timer:**
```json
{
  "content": "Set a timer for 25 minutes"
}
```

**Create Named Timer:**
```json
{
  "content": "Create a 10 minute break timer"
}
```

**Cancel All Timers:**
```json
{
  "content": "Cancel all my timers"
}
```

**Pause/Resume Timer:**
```json
{
  "content": "Pause my work timer"
}
```

### WebSocket Integration
Timer updates and other real-time events are sent via WebSocket to channel group `chat_{user_id}`.

**Timer Update Message Format:**
```json
{
  "type": "timer_update",
  "action": "created|paused|resumed|cancelled|cancelled_all|completed|warning",
  "timer_id": "timer-uuid",
  "message": "Timer 'Work Session' created"
}
```

**WebSocket Connection:**
```javascript
const ws = new WebSocket(`ws://localhost:8000/ws/chat/${user_id}/`);
```

---

## 📝 Error Responses

All endpoints return consistent error responses:

### 400 Bad Request
```json
{
  "error": "Content is required"
}
```

### 401 Unauthorized
```json
{
  "error": "Invalid credentials"
}
```

### 403 Forbidden
```json
{
  "detail": "Authentication credentials were not provided."
}
```

### 404 Not Found
```json
{
  "detail": "Not found."
}
```

### 500 Internal Server Error
```json
{
  "error": "An internal server error occurred",
  "success": false
}
```

---

## 📊 Rate Limiting

Currently no rate limiting is implemented, but it's recommended to implement reasonable rate limits in production:

- Authentication endpoints: 5 requests/minute
- Message sending: 60 requests/minute
- Other endpoints: 100 requests/minute

---

## 🔐 Security Notes

1. **JWT Tokens**: Access tokens expire after 60 minutes, refresh tokens after 7 days
2. **CORS**: Configured to allow `http://localhost:3000` for development
3. **User Isolation**: Users can only access their own resources
4. **Password Requirements**: Minimum 8 characters for user passwords
5. **HTTPS**: Use HTTPS in production for all API communications

---

## 🧪 Testing

### Using cURL

**Register a user:**
```bash
curl -X POST http://localhost:8000/api/auth/register/ \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "name": "Test User",
    "password": "testpass123"
  }'
```

**Send a message:**
```bash
curl -X POST http://localhost:8000/api/conversations/{id}/send_message/ \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -d '{
    "content": "Hello Bruno, how are you today?"
  }'
```

### Using Python requests

```python
import requests

# Login
response = requests.post('http://localhost:8000/api/auth/login/', json={
    'email': 'test@example.com',
    'password': 'testpass123'
})
token = response.json()['access_token']

# Send message
headers = {'Authorization': f'Bearer {token}'}
response = requests.post(
    'http://localhost:8000/api/conversations/123/send_message/',
    headers=headers,
    json={'content': 'Hello Bruno!'}
)
```

---

This API collection provides comprehensive functionality for user management, AI conversations with proactive messaging capabilities, and timer management for productivity features in the Bruno PA application.