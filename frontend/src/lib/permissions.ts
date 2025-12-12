// User Roles and Permissions System

export type UserRole = "admin" | "moderator" | "user";

export type Permission =
  // User management permissions
  | "user.create"
  | "user.read"
  | "user.update"
  | "user.delete"
  | "user.list"
  | "user.ban"
  | "user.unban"
  // Admin permissions
  | "admin.access"
  | "admin.settings"
  | "admin.users"
  | "admin.analytics"
  // Content permissions
  | "content.create"
  | "content.read"
  | "content.update"
  | "content.delete"
  | "content.moderate"
  // System permissions
  | "system.backup"
  | "system.settings"
  | "system.maintenance";

// Role definitions with their permissions
export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  admin: [
    // Full access to everything
    "user.create",
    "user.read",
    "user.update",
    "user.delete",
    "user.list",
    "user.ban",
    "user.unban",
    "admin.access",
    "admin.settings",
    "admin.users",
    "admin.analytics",
    "content.create",
    "content.read",
    "content.update",
    "content.delete",
    "content.moderate",
    "system.backup",
    "system.settings",
    "system.maintenance",
  ],
  moderator: [
    // Limited admin access
    "user.read",
    "user.update",
    "user.list",
    "user.ban",
    "user.unban",
    "admin.access",
    "admin.users",
    "content.create",
    "content.read",
    "content.update",
    "content.delete",
    "content.moderate",
  ],
  user: [
    // Basic user permissions
    "user.read",
    "content.create",
    "content.read",
    "content.update",
  ],
};

// Check if a role has a specific permission
export const hasPermission = (role: UserRole, permission: Permission): boolean => {
  return ROLE_PERMISSIONS[role].includes(permission);
};

// Check if a role has any of the specified permissions
export const hasAnyPermission = (role: UserRole, permissions: Permission[]): boolean => {
  return permissions.some((permission) => hasPermission(role, permission));
};

// Check if a role has all of the specified permissions
export const hasAllPermissions = (role: UserRole, permissions: Permission[]): boolean => {
  return permissions.every((permission) => hasPermission(role, permission));
};

// Get all permissions for a role
export const getPermissions = (role: UserRole): Permission[] => {
  return ROLE_PERMISSIONS[role];
};

// Role hierarchy - higher roles inherit permissions from lower roles
export const ROLE_HIERARCHY: Record<UserRole, number> = {
  user: 1,
  moderator: 2,
  admin: 3,
};

// Check if a role can manage another role
export const canManageRole = (managerRole: UserRole, targetRole: UserRole): boolean => {
  return ROLE_HIERARCHY[managerRole] > ROLE_HIERARCHY[targetRole];
};

// Permission groups for UI organization
export const PERMISSION_GROUPS = {
  "User Management": [
    "user.create",
    "user.read",
    "user.update",
    "user.delete",
    "user.list",
    "user.ban",
    "user.unban",
  ],
  Administration: ["admin.access", "admin.settings", "admin.users", "admin.analytics"],
  "Content Management": [
    "content.create",
    "content.read",
    "content.update",
    "content.delete",
    "content.moderate",
  ],
  "System Operations": ["system.backup", "system.settings", "system.maintenance"],
} as const;

// Permission labels for UI display
export const PERMISSION_LABELS: Record<Permission, string> = {
  // User management
  "user.create": "Create Users",
  "user.read": "View Users",
  "user.update": "Edit Users",
  "user.delete": "Delete Users",
  "user.list": "List Users",
  "user.ban": "Ban Users",
  "user.unban": "Unban Users",

  // Admin
  "admin.access": "Access Admin Panel",
  "admin.settings": "Manage Admin Settings",
  "admin.users": "Manage Users",
  "admin.analytics": "View Analytics",

  // Content
  "content.create": "Create Content",
  "content.read": "View Content",
  "content.update": "Edit Content",
  "content.delete": "Delete Content",
  "content.moderate": "Moderate Content",

  // System
  "system.backup": "System Backup",
  "system.settings": "System Settings",
  "system.maintenance": "System Maintenance",
};

// Role labels for UI display
export const ROLE_LABELS: Record<UserRole, string> = {
  admin: "Administrator",
  moderator: "Moderator",
  user: "User",
};

// Role descriptions
export const ROLE_DESCRIPTIONS: Record<UserRole, string> = {
  admin: "Full system access with all permissions",
  moderator: "Limited administrative access for content and user management",
  user: "Basic user access with content creation and viewing",
};
