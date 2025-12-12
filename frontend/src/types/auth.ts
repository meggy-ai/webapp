// User Management & Authentication Types
// Note: Chat, Agent, and Dashboard types are DEFERRED until bruno-core ecosystem is ready

// Base user interface
export interface User {
  id: string;
  email: string;
  username: string;
  first_name: string;
  last_name: string;
  avatar?: string;
  is_active: boolean;
  is_email_verified: boolean;
  is_onboarding_completed: boolean;
  role: "admin" | "user" | "moderator";
  date_joined: string;
  last_login?: string;
  bio?: string;
  location?: string;
  company?: string;
  job_title?: string;
  website?: string;
  preferences: UserPreferences;
}

// User preferences interface
export interface UserPreferences {
  theme: "light" | "dark" | "system";
  language: string;
  timezone: string;
  emailNotifications: boolean;
  pushNotifications: boolean;
  marketingEmails: boolean;
}

// Authentication interfaces
export interface LoginCredentials {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface RegisterData {
  email: string;
  username: string;
  password: string;
  firstName: string;
  lastName: string;
  acceptTerms: boolean;
}

export interface AuthTokens {
  access: string;
  refresh: string;
}

export interface AuthResponse {
  tokens: AuthTokens;
  user: User;
  message?: string;
}

// Password management interfaces
export interface ChangePasswordData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface ForgotPasswordData {
  email: string;
}

export interface ResetPasswordData {
  token: string;
  newPassword: string;
  confirmPassword: string;
}

// User profile update interface
export interface UpdateProfileData {
  firstName?: string;
  lastName?: string;
  username?: string;
  avatar?: File;
}

// API response interfaces
export type LoginResponse = AuthResponse;

export interface RegisterResponse extends AuthResponse {
  emailVerificationSent: boolean;
}

export interface ProfileResponse {
  user: User;
}

// Error interfaces
export interface ValidationError {
  field: string;
  message: string;
}

export interface ApiErrorResponse {
  message: string;
  code?: string;
  details?: Record<string, string[]>;
  validationErrors?: ValidationError[];
}

// Auth state interface for store
export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

// Query keys for TanStack Query
export const QUERY_KEYS = {
  AUTH: {
    USER: ["auth", "user"] as const,
    PROFILE: ["auth", "profile"] as const,
  },
  USERS: {
    PREFERENCES: (userId: string) => ["users", "preferences", userId] as const,
  },
  HEALTH: {
    STATUS: ["health", "status"] as const,
  },
} as const;

// Form validation schemas (to be used with react-hook-form or similar)
export type LoginFormData = LoginCredentials;
export type RegisterFormData = RegisterData;
export type ProfileFormData = UpdateProfileData;
export type ChangePasswordFormData = ChangePasswordData;

// Future types (DEFERRED - will be implemented after bruno-core)
// export interface ChatMessage { ... }
// export interface Agent { ... }
// export interface Conversation { ... }
// export interface DashboardStats { ... }
