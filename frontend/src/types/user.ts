// User Management Types
// Extends the base user types with additional user-related interfaces

import { User, UserPreferences } from "./auth";

// Extended user profile with additional metadata
export interface UserProfile extends User {
  bio?: string;
  website?: string;
  location?: string;
  company?: string;
  socialLinks: SocialLinks;
  stats: UserStats;
}

// Social media links
export interface SocialLinks {
  twitter?: string;
  linkedin?: string;
  github?: string;
  website?: string;
}

// User statistics
export interface UserStats {
  // Note: AI-related stats are DEFERRED until bruno-core is ready
  accountAge: number; // days since account creation
  lastActiveDate: string;
  loginCount: number;
  profileCompleteness: number; // percentage 0-100

  // Future stats (DEFERRED):
  // totalChats: number
  // activeAgents: number
  // messagesExchanged: number
}

// User account settings
export interface UserSettings extends UserPreferences {
  security: SecuritySettings;
  privacy: PrivacySettings;
  notifications: NotificationSettings;
}

// Security settings
export interface SecuritySettings {
  twoFactorEnabled: boolean;
  loginNotifications: boolean;
  deviceTrustEnabled: boolean;
  sessionTimeout: number; // minutes
  allowMultipleSessions: boolean;
}

// Privacy settings
export interface PrivacySettings {
  profileVisibility: "public" | "private" | "friends";
  showOnlineStatus: boolean;
  allowDirectMessages: boolean;
  dataProcessingConsent: boolean;
}

// Notification preferences
export interface NotificationSettings {
  email: EmailNotifications;
  push: PushNotifications;
  inApp: InAppNotifications;
}

export interface EmailNotifications {
  security: boolean;
  product: boolean;
  marketing: boolean;
  digest: boolean;
}

export interface PushNotifications {
  enabled: boolean;
  // Future notifications (DEFERRED):
  // newMessages: boolean
  // agentUpdates: boolean
  // systemAlerts: boolean
}

export interface InAppNotifications {
  enabled: boolean;
  sound: boolean;
  // Future notifications (DEFERRED):
  // chatNotifications: boolean
  // agentNotifications: boolean
}

// Account management
export interface AccountDeletionRequest {
  reason: string;
  feedback?: string;
  confirmPassword: string;
}

export interface AccountExportRequest {
  includePersonalData: boolean;
  includeActivityData: boolean;
  format: "json" | "csv";
}

// User search and filtering (for admin/future features)
export interface UserSearchFilters {
  query?: string;
  isActive?: boolean;
  isEmailVerified?: boolean;
  dateJoinedFrom?: string;
  dateJoinedTo?: string;
  lastLoginFrom?: string;
  lastLoginTo?: string;
}

export interface UserListResponse {
  users: UserProfile[];
  totalCount: number;
  page: number;
  pageSize: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

// Device and session management
export interface UserDevice {
  id: string;
  deviceName: string;
  deviceType: "desktop" | "mobile" | "tablet";
  browser: string;
  os: string;
  ipAddress: string;
  location?: string;
  lastUsed: string;
  isCurrentDevice: boolean;
  isTrusted: boolean;
}

export interface UserSession {
  id: string;
  device: UserDevice;
  createdAt: string;
  expiresAt: string;
  isActive: boolean;
}

// Activity log
export interface UserActivity {
  id: string;
  type: UserActivityType;
  description: string;
  metadata?: Record<string, unknown>;
  ipAddress: string;
  userAgent: string;
  timestamp: string;
}

export type UserActivityType =
  | "login"
  | "logout"
  | "password_change"
  | "email_change"
  | "profile_update"
  | "settings_change"
  | "account_deletion";
// Future activity types (DEFERRED):
// | 'chat_created'
// | 'agent_created'
// | 'agent_deployed'

export { User, UserPreferences } from "./auth";
