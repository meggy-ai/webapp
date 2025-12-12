"use client";

import { ReactNode } from "react";
import { usePermissions } from "@/lib/hooks/use-permissions";
import { Permission, UserRole } from "@/lib/permissions";

interface PermissionGateProps {
  children: ReactNode;
  permission?: Permission;
  permissions?: Permission[];
  role?: UserRole;
  requireAll?: boolean;
  fallback?: ReactNode;
}

/**
 * PermissionGate - A component that conditionally renders children based on user permissions
 *
 * @param permission - Single permission to check
 * @param permissions - Array of permissions to check
 * @param role - Specific role required
 * @param requireAll - If true, user must have ALL permissions. If false, ANY permission is enough
 * @param fallback - Component to render if permission check fails
 */
export function PermissionGate({
  children,
  permission,
  permissions = [],
  role,
  requireAll = false,
  fallback = null,
}: PermissionGateProps) {
  const { hasPermission, hasAnyPermission, hasAllPermissions, getUserRole } = usePermissions();

  // Check specific role requirement
  if (role && getUserRole() !== role) {
    return <>{fallback}</>;
  }

  // Check single permission
  if (permission && !hasPermission(permission)) {
    return <>{fallback}</>;
  }

  // Check multiple permissions
  if (permissions.length > 0) {
    const hasRequiredPermissions = requireAll
      ? hasAllPermissions(permissions)
      : hasAnyPermission(permissions);

    if (!hasRequiredPermissions) {
      return <>{fallback}</>;
    }
  }

  return <>{children}</>;
}

// Convenience components for common permission checks
export function AdminOnly({
  children,
  fallback = null,
}: {
  children: ReactNode;
  fallback?: ReactNode;
}) {
  return (
    <PermissionGate role="admin" fallback={fallback}>
      {children}
    </PermissionGate>
  );
}

export function ModeratorOrAdmin({
  children,
  fallback = null,
}: {
  children: ReactNode;
  fallback?: ReactNode;
}) {
  return (
    <PermissionGate permissions={["admin.access"]} fallback={fallback}>
      {children}
    </PermissionGate>
  );
}

export function UserManagementAccess({
  children,
  fallback = null,
}: {
  children: ReactNode;
  fallback?: ReactNode;
}) {
  return (
    <PermissionGate permissions={["admin.users", "user.list"]} fallback={fallback}>
      {children}
    </PermissionGate>
  );
}
