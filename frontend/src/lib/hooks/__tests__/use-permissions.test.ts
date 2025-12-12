import { renderHook } from "@testing-library/react";
import { usePermissions } from "@/lib/hooks/use-permissions";
import { UserRole } from "@/lib/permissions";

// Mock the auth store
const createMockUser = (role: UserRole = "user") => ({
  id: "1",
  email: "test@example.com",
  first_name: "John",
  last_name: "Doe",
  role,
});

jest.mock("@/lib/stores/auth-store", () => ({
  useAuth: jest.fn(),
}));

describe("usePermissions", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("User role permissions", () => {
    beforeEach(() => {
      const { useAuth } = jest.requireMock("@/lib/stores/auth-store");
      useAuth.mockReturnValue({
        user: createMockUser("user"),
        isAuthenticated: true,
      });
    });

    it("should have basic user permissions", () => {
      const { result } = renderHook(() => usePermissions());

      expect(result.current.isUser()).toBe(true);
      expect(result.current.isModerator()).toBe(false);
      expect(result.current.isAdmin()).toBe(false);

      expect(result.current.hasPermission("user.read")).toBe(true);
      expect(result.current.hasPermission("content.create")).toBe(true);
      expect(result.current.hasPermission("admin.access")).toBe(false);
      expect(result.current.hasPermission("system.settings")).toBe(false);
    });

    it("should not access admin features", () => {
      const { result } = renderHook(() => usePermissions());

      expect(result.current.canAccessAdmin()).toBe(false);
      expect(result.current.canManageUsers()).toBe(false);
    });

    it("should not manage other roles", () => {
      const { result } = renderHook(() => usePermissions());

      expect(result.current.canManageRole("user")).toBe(false);
      expect(result.current.canManageRole("moderator")).toBe(false);
      expect(result.current.canManageRole("admin")).toBe(false);
    });
  });

  describe("Moderator role permissions", () => {
    beforeEach(() => {
      const { useAuth } = jest.requireMock("@/lib/stores/auth-store");
      useAuth.mockReturnValue({
        user: createMockUser("moderator"),
        isAuthenticated: true,
      });
    });

    it("should have moderator permissions", () => {
      const { result } = renderHook(() => usePermissions());

      expect(result.current.isUser()).toBe(false);
      expect(result.current.isModerator()).toBe(true);
      expect(result.current.isAdmin()).toBe(false);

      expect(result.current.hasPermission("user.read")).toBe(true);
      expect(result.current.hasPermission("admin.access")).toBe(true);
      expect(result.current.hasPermission("content.moderate")).toBe(true);
      expect(result.current.hasPermission("system.settings")).toBe(false);
    });

    it("should access admin panel but not all admin features", () => {
      const { result } = renderHook(() => usePermissions());

      expect(result.current.canAccessAdmin()).toBe(true);
      expect(result.current.canManageUsers()).toBe(true);
    });

    it("should manage lower roles only", () => {
      const { result } = renderHook(() => usePermissions());

      expect(result.current.canManageRole("user")).toBe(true);
      expect(result.current.canManageRole("moderator")).toBe(false);
      expect(result.current.canManageRole("admin")).toBe(false);
    });
  });

  describe("Admin role permissions", () => {
    beforeEach(() => {
      const { useAuth } = jest.requireMock("@/lib/stores/auth-store");
      useAuth.mockReturnValue({
        user: createMockUser("admin"),
        isAuthenticated: true,
      });
    });

    it("should have all permissions", () => {
      const { result } = renderHook(() => usePermissions());

      expect(result.current.isUser()).toBe(false);
      expect(result.current.isModerator()).toBe(false);
      expect(result.current.isAdmin()).toBe(true);

      expect(result.current.hasPermission("user.read")).toBe(true);
      expect(result.current.hasPermission("admin.access")).toBe(true);
      expect(result.current.hasPermission("content.moderate")).toBe(true);
      expect(result.current.hasPermission("system.settings")).toBe(true);
    });

    it("should access all admin features", () => {
      const { result } = renderHook(() => usePermissions());

      expect(result.current.canAccessAdmin()).toBe(true);
      expect(result.current.canManageUsers()).toBe(true);
    });

    it("should manage all roles", () => {
      const { result } = renderHook(() => usePermissions());

      expect(result.current.canManageRole("user")).toBe(true);
      expect(result.current.canManageRole("moderator")).toBe(true);
      expect(result.current.canManageRole("admin")).toBe(false); // Cannot manage same level
    });
  });

  describe("Permission arrays", () => {
    beforeEach(() => {
      const { useAuth } = jest.requireMock("@/lib/stores/auth-store");
      useAuth.mockReturnValue({
        user: createMockUser("moderator"),
        isAuthenticated: true,
      });
    });

    it("should check multiple permissions with hasAnyPermission", () => {
      const { result } = renderHook(() => usePermissions());

      expect(result.current.hasAnyPermission(["user.create", "user.read"])).toBe(true);
      expect(result.current.hasAnyPermission(["system.backup", "system.settings"])).toBe(false);
    });

    it("should check multiple permissions with hasAllPermissions", () => {
      const { result } = renderHook(() => usePermissions());

      expect(result.current.hasAllPermissions(["user.read", "content.read"])).toBe(true);
      expect(result.current.hasAllPermissions(["user.read", "system.settings"])).toBe(false);
    });
  });

  describe("No user logged in", () => {
    beforeEach(() => {
      const { useAuth } = jest.requireMock("@/lib/stores/auth-store");
      useAuth.mockReturnValue({
        user: null,
        isAuthenticated: false,
      });
    });

    it("should default to user role with no permissions", () => {
      const { result } = renderHook(() => usePermissions());

      expect(result.current.getUserRole()).toBe("user");
      expect(result.current.canAccessAdmin()).toBe(false);
      expect(result.current.canManageUsers()).toBe(false);
    });
  });
});
