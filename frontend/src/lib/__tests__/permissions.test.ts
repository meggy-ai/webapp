import {
  hasPermission,
  hasAnyPermission,
  hasAllPermissions,
  getPermissions,
  canManageRole,
  ROLE_PERMISSIONS,
  ROLE_HIERARCHY,
} from "@/lib/permissions";

describe("Permissions System", () => {
  describe("hasPermission", () => {
    it("should return true for valid permissions", () => {
      expect(hasPermission("user", "user.read")).toBe(true);
      expect(hasPermission("admin", "system.settings")).toBe(true);
      expect(hasPermission("moderator", "content.moderate")).toBe(true);
    });

    it("should return false for invalid permissions", () => {
      expect(hasPermission("user", "admin.access")).toBe(false);
      expect(hasPermission("user", "system.settings")).toBe(false);
      expect(hasPermission("moderator", "system.backup")).toBe(false);
    });
  });

  describe("hasAnyPermission", () => {
    it("should return true if user has any of the permissions", () => {
      expect(hasAnyPermission("user", ["user.read", "admin.access"])).toBe(true);
      expect(hasAnyPermission("moderator", ["system.settings", "admin.access"])).toBe(true);
    });

    it("should return false if user has none of the permissions", () => {
      expect(hasAnyPermission("user", ["admin.access", "system.settings"])).toBe(false);
      expect(hasAnyPermission("moderator", ["system.backup", "system.maintenance"])).toBe(false);
    });
  });

  describe("hasAllPermissions", () => {
    it("should return true if user has all permissions", () => {
      expect(hasAllPermissions("admin", ["user.read", "admin.access"])).toBe(true);
      expect(hasAllPermissions("moderator", ["user.read", "content.moderate"])).toBe(true);
    });

    it("should return false if user is missing any permission", () => {
      expect(hasAllPermissions("user", ["user.read", "admin.access"])).toBe(false);
      expect(hasAllPermissions("moderator", ["admin.access", "system.settings"])).toBe(false);
    });
  });

  describe("getPermissions", () => {
    it("should return correct permissions for each role", () => {
      const userPermissions = getPermissions("user");
      const moderatorPermissions = getPermissions("moderator");
      const adminPermissions = getPermissions("admin");

      expect(userPermissions).toEqual(ROLE_PERMISSIONS.user);
      expect(moderatorPermissions).toEqual(ROLE_PERMISSIONS.moderator);
      expect(adminPermissions).toEqual(ROLE_PERMISSIONS.admin);

      // Verify admin has the most permissions
      expect(adminPermissions.length).toBeGreaterThan(moderatorPermissions.length);
      expect(moderatorPermissions.length).toBeGreaterThan(userPermissions.length);
    });
  });

  describe("canManageRole", () => {
    it("should allow higher roles to manage lower roles", () => {
      expect(canManageRole("admin", "user")).toBe(true);
      expect(canManageRole("admin", "moderator")).toBe(true);
      expect(canManageRole("moderator", "user")).toBe(true);
    });

    it("should not allow lower roles to manage higher roles", () => {
      expect(canManageRole("user", "moderator")).toBe(false);
      expect(canManageRole("user", "admin")).toBe(false);
      expect(canManageRole("moderator", "admin")).toBe(false);
    });

    it("should not allow same level role management", () => {
      expect(canManageRole("user", "user")).toBe(false);
      expect(canManageRole("moderator", "moderator")).toBe(false);
      expect(canManageRole("admin", "admin")).toBe(false);
    });
  });

  describe("ROLE_HIERARCHY", () => {
    it("should have correct hierarchy values", () => {
      expect(ROLE_HIERARCHY.user).toBe(1);
      expect(ROLE_HIERARCHY.moderator).toBe(2);
      expect(ROLE_HIERARCHY.admin).toBe(3);
    });
  });

  describe("ROLE_PERMISSIONS structure", () => {
    it("should have permissions for all roles", () => {
      expect(ROLE_PERMISSIONS.user).toBeDefined();
      expect(ROLE_PERMISSIONS.moderator).toBeDefined();
      expect(ROLE_PERMISSIONS.admin).toBeDefined();
    });

    it("should have basic user permissions for all roles", () => {
      expect(ROLE_PERMISSIONS.user).toContain("user.read");
      expect(ROLE_PERMISSIONS.moderator).toContain("user.read");
      expect(ROLE_PERMISSIONS.admin).toContain("user.read");
    });

    it("should have admin access for moderator and admin only", () => {
      expect(ROLE_PERMISSIONS.user).not.toContain("admin.access");
      expect(ROLE_PERMISSIONS.moderator).toContain("admin.access");
      expect(ROLE_PERMISSIONS.admin).toContain("admin.access");
    });

    it("should have system permissions for admin only", () => {
      expect(ROLE_PERMISSIONS.user).not.toContain("system.settings");
      expect(ROLE_PERMISSIONS.moderator).not.toContain("system.settings");
      expect(ROLE_PERMISSIONS.admin).toContain("system.settings");
    });
  });
});
