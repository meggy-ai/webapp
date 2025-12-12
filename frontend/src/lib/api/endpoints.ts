// API Endpoints Configuration for User Management & Authentication
// Note: Chat, Agent, and Dashboard endpoints are DEFERRED until bruno-core ecosystem is ready

export const API_ENDPOINTS = {
  // Authentication endpoints
  AUTH: {
    LOGIN: "/auth/login/",
    REGISTER: "/auth/register/",
    LOGOUT: "/auth/logout/",
    REFRESH: "/auth/refresh/",
    VERIFY_EMAIL: "/auth/verify-email/",
    FORGOT_PASSWORD: "/auth/forgot-password/",
    RESET_PASSWORD: "/auth/reset-password/",
    CHANGE_PASSWORD: "/auth/change-password/",
  },

  // User management endpoints
  USERS: {
    PROFILE: "/users/profile/",
    UPDATE_PROFILE: "/users/profile/",
    DELETE_ACCOUNT: "/users/delete/",
    UPLOAD_AVATAR: "/users/avatar/",
    PREFERENCES: "/users/preferences/",
    COMPLETE_ONBOARDING: "/users/complete-onboarding/",
  },

  // Health and utility endpoints
  HEALTH: {
    STATUS: "/health/",
    VERSION: "/version/",
  },

  // Future endpoints (DEFERRED - will be implemented after bruno-core)
  // CHAT: {
  //   CONVERSATIONS: '/chat/conversations/',
  //   MESSAGES: '/chat/messages/',
  //   SEND_MESSAGE: '/chat/send/',
  // },
  //
  // AGENTS: {
  //   LIST: '/agents/',
  //   CREATE: '/agents/',
  //   UPDATE: (id: string) => `/agents/${id}/`,
  //   DELETE: (id: string) => `/agents/${id}/`,
  //   DEPLOY: (id: string) => `/agents/${id}/deploy/`,
  // },
  //
  // DASHBOARD: {
  //   STATS: '/dashboard/stats/',
  //   ANALYTICS: '/dashboard/analytics/',
  //   ACTIVITY: '/dashboard/activity/',
  // },
} as const;

// Helper function to build endpoint URLs
export const buildEndpoint = (
  endpoint: string,
  params?: Record<string, string | number>
): string => {
  let url = endpoint;

  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      url = url.replace(`:${key}`, String(value));
    });
  }

  return url;
};

// Export endpoint types for type safety
export type AuthEndpoints = typeof API_ENDPOINTS.AUTH;
export type UserEndpoints = typeof API_ENDPOINTS.USERS;
export type HealthEndpoints = typeof API_ENDPOINTS.HEALTH;
