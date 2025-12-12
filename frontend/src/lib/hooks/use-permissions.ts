import { useAuth } from "@/lib/stores/auth-store";
import {
  Permission,
  hasPermission,
  hasAnyPermission,
  hasAllPermissions,
  getPermissions,
  canManageRole,
  UserRole,
} from "@/lib/permissions";

export interface PermissionsHook {
  // Permission checks
  hasPermission: (permission: Permission) => boolean;
  hasAnyPermission: (permissions: Permission[]) => boolean;
  hasAllPermissions: (permissions: Permission[]) => boolean;

  // Role management
  canManageRole: (targetRole: UserRole) => boolean;
  getUserRole: () => UserRole;
  getAllPermissions: () => Permission[];

  // Convenience methods
  isAdmin: () => boolean;
  isModerator: () => boolean;
  isUser: () => boolean;
  canAccessAdmin: () => boolean;
  canManageUsers: () => boolean;
}

export const usePermissions = (): PermissionsHook => {
  const { user } = useAuth();
  const userRole: UserRole = user?.role || "user";

  return {
    hasPermission: (permission: Permission) => {
      return hasPermission(userRole, permission);
    },

    hasAnyPermission: (permissions: Permission[]) => {
      return hasAnyPermission(userRole, permissions);
    },

    hasAllPermissions: (permissions: Permission[]) => {
      return hasAllPermissions(userRole, permissions);
    },

    canManageRole: (targetRole: UserRole) => {
      return canManageRole(userRole, targetRole);
    },

    getUserRole: () => userRole,

    getAllPermissions: () => {
      return getPermissions(userRole);
    },

    // Convenience methods
    isAdmin: () => userRole === "admin",
    isModerator: () => userRole === "moderator",
    isUser: () => userRole === "user",
    canAccessAdmin: () => hasPermission(userRole, "admin.access"),
    canManageUsers: () => hasPermission(userRole, "admin.users"),
  };
};
