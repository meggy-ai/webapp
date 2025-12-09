import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AdminDashboard } from "@/components/admin/admin-dashboard";
import { useUsers, useSystemStats, useUserActions } from "@/lib/hooks/use-admin";
import { usePermissions } from "@/lib/hooks/use-permissions";

// Mock the admin hooks
jest.mock("@/lib/hooks/use-admin", () => ({
  useUsers: jest.fn(),
  useSystemStats: jest.fn(),
  useUserActions: jest.fn(),
}));

jest.mock("@/lib/hooks/use-permissions", () => ({
  usePermissions: jest.fn(),
}));

const mockUsers = [
  {
    id: "1",
    name: "John Doe",
    email: "john@example.com",
    role: "user",
    status: "active",
    createdAt: "2024-01-01T00:00:00Z",
    lastLoginAt: "2024-01-15T10:00:00Z",
  },
  {
    id: "2",
    name: "Jane Admin",
    email: "jane@example.com",
    role: "admin",
    status: "active",
    createdAt: "2024-01-02T00:00:00Z",
    lastLoginAt: "2024-01-15T11:00:00Z",
  },
];

const mockStats = {
  totalUsers: 150,
  activeUsers: 120,
  newUsersToday: 5,
  totalSessions: 1200,
  avgSessionDuration: 1800, // 30 minutes
  errorRate: 0.02,
  systemUptime: 0.999,
};

describe("AdminDashboard", () => {
  const mockUpdateUser = jest.fn();
  const mockDeleteUser = jest.fn();
  const mockSuspendUser = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (usePermissions as jest.Mock).mockReturnValue({
      hasPermission: jest.fn().mockReturnValue(true),
      canPerform: jest.fn().mockReturnValue(true),
    });
    (useUsers as jest.Mock).mockReturnValue({
      data: mockUsers,
      isLoading: false,
      error: null,
    });
    (useSystemStats as jest.Mock).mockReturnValue({
      data: mockStats,
      isLoading: false,
      error: null,
    });
    (useUserActions as jest.Mock).mockReturnValue({
      updateUser: { mutateAsync: mockUpdateUser, isPending: false },
      deleteUser: { mutateAsync: mockDeleteUser, isPending: false },
      suspendUser: { mutateAsync: mockSuspendUser, isPending: false },
    });
  });

  it("should render dashboard sections", () => {
    render(<AdminDashboard />);

    expect(screen.getByText("Admin Dashboard")).toBeInTheDocument();
    expect(screen.getByText("System Overview")).toBeInTheDocument();
    expect(screen.getByText("User Management")).toBeInTheDocument();
  });

  it("should display system statistics", () => {
    render(<AdminDashboard />);

    expect(screen.getByText("150")).toBeInTheDocument(); // Total Users
    expect(screen.getByText("120")).toBeInTheDocument(); // Active Users
    expect(screen.getByText("5")).toBeInTheDocument(); // New Users Today
    expect(screen.getByText("99.9%")).toBeInTheDocument(); // System Uptime
  });

  it("should render users table with user data", () => {
    render(<AdminDashboard />);

    expect(screen.getByText("John Doe")).toBeInTheDocument();
    expect(screen.getByText("john@example.com")).toBeInTheDocument();
    expect(screen.getByText("Jane Admin")).toBeInTheDocument();
    expect(screen.getByText("jane@example.com")).toBeInTheDocument();
  });

  it("should filter users by search term", async () => {
    const user = userEvent.setup();

    render(<AdminDashboard />);

    const searchInput = screen.getByPlaceholderText(/search users/i);
    await user.type(searchInput, "John");

    await waitFor(() => {
      expect(screen.getByText("John Doe")).toBeInTheDocument();
      expect(screen.queryByText("Jane Admin")).not.toBeInTheDocument();
    });
  });

  it("should filter users by role", async () => {
    const user = userEvent.setup();

    render(<AdminDashboard />);

    const roleFilter = screen.getByLabelText(/filter by role/i);
    await user.selectOptions(roleFilter, "admin");

    await waitFor(() => {
      expect(screen.getByText("Jane Admin")).toBeInTheDocument();
      expect(screen.queryByText("John Doe")).not.toBeInTheDocument();
    });
  });

  it("should filter users by status", async () => {
    const user = userEvent.setup();

    render(<AdminDashboard />);

    const statusFilter = screen.getByLabelText(/filter by status/i);
    await user.selectOptions(statusFilter, "active");

    await waitFor(() => {
      expect(screen.getByText("John Doe")).toBeInTheDocument();
      expect(screen.getByText("Jane Admin")).toBeInTheDocument();
    });
  });

  it("should open edit user modal", async () => {
    const user = userEvent.setup();

    render(<AdminDashboard />);

    const editButtons = screen.getAllByRole("button", { name: /edit/i });
    await user.click(editButtons[0]);

    expect(screen.getByText("Edit User")).toBeInTheDocument();
    expect(screen.getByDisplayValue("John Doe")).toBeInTheDocument();
    expect(screen.getByDisplayValue("john@example.com")).toBeInTheDocument();
  });

  it("should update user information", async () => {
    const user = userEvent.setup();

    render(<AdminDashboard />);

    const editButtons = screen.getAllByRole("button", { name: /edit/i });
    await user.click(editButtons[0]);

    const nameInput = screen.getByDisplayValue("John Doe");
    const roleSelect = screen.getByDisplayValue("user");
    const saveButton = screen.getByRole("button", { name: /save/i });

    await user.clear(nameInput);
    await user.type(nameInput, "John Smith");
    await user.selectOptions(roleSelect, "moderator");
    await user.click(saveButton);

    expect(mockUpdateUser).toHaveBeenCalledWith({
      id: "1",
      name: "John Smith",
      role: "moderator",
    });
  });

  it("should suspend user with confirmation", async () => {
    const user = userEvent.setup();

    render(<AdminDashboard />);

    const suspendButtons = screen.getAllByRole("button", { name: /suspend/i });
    await user.click(suspendButtons[0]);

    expect(screen.getByText(/are you sure you want to suspend/i)).toBeInTheDocument();

    const confirmButton = screen.getByRole("button", { name: /confirm/i });
    await user.click(confirmButton);

    expect(mockSuspendUser).toHaveBeenCalledWith("1");
  });

  it("should delete user with confirmation", async () => {
    const user = userEvent.setup();

    render(<AdminDashboard />);

    const moreButtons = screen.getAllByRole("button", { name: /more actions/i });
    await user.click(moreButtons[0]);

    const deleteButton = screen.getByRole("button", { name: /delete/i });
    await user.click(deleteButton);

    expect(screen.getByText(/are you sure you want to delete/i)).toBeInTheDocument();
    expect(screen.getByText(/this action cannot be undone/i)).toBeInTheDocument();

    const confirmButton = screen.getByRole("button", { name: /delete user/i });
    await user.click(confirmButton);

    expect(mockDeleteUser).toHaveBeenCalledWith("1");
  });

  it("should show loading state", () => {
    (useUsers as jest.Mock).mockReturnValue({
      data: null,
      isLoading: true,
      error: null,
    });
    (useSystemStats as jest.Mock).mockReturnValue({
      data: null,
      isLoading: true,
      error: null,
    });

    render(<AdminDashboard />);

    expect(screen.getByText(/loading/i)).toBeInTheDocument();
  });

  it("should show error state", () => {
    (useUsers as jest.Mock).mockReturnValue({
      data: null,
      isLoading: false,
      error: new Error("Failed to load users"),
    });

    render(<AdminDashboard />);

    expect(screen.getByText(/error loading users/i)).toBeInTheDocument();
  });

  it("should respect permissions for actions", () => {
    (usePermissions as jest.Mock).mockReturnValue({
      hasPermission: jest.fn((permission) => {
        return permission === "users:read"; // Only allow read permissions
      }),
      canPerform: jest.fn().mockReturnValue(false),
    });

    render(<AdminDashboard />);

    // Should not show edit/delete buttons without permissions
    expect(screen.queryByRole("button", { name: /edit/i })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /suspend/i })).not.toBeInTheDocument();
  });

  it("should sort users by column", async () => {
    const user = userEvent.setup();

    render(<AdminDashboard />);

    const nameHeader = screen.getByRole("button", { name: /sort by name/i });
    await user.click(nameHeader);

    // Users should be sorted by name
    const userRows = screen.getAllByTestId("user-row");
    expect(userRows[0]).toHaveTextContent("Jane Admin");
    expect(userRows[1]).toHaveTextContent("John Doe");
  });

  it("should paginate users table", () => {
    // Mock more users for pagination
    const manyUsers = Array.from({ length: 50 }, (_, i) => ({
      id: `${i + 1}`,
      name: `User ${i + 1}`,
      email: `user${i + 1}@example.com`,
      role: "user",
      status: "active",
      createdAt: "2024-01-01T00:00:00Z",
      lastLoginAt: "2024-01-15T10:00:00Z",
    }));

    (useUsers as jest.Mock).mockReturnValue({
      data: manyUsers,
      isLoading: false,
      error: null,
    });

    render(<AdminDashboard />);

    expect(screen.getByRole("navigation", { name: /pagination/i })).toBeInTheDocument();
    expect(screen.getByText(/showing 1-20 of 50/i)).toBeInTheDocument();
  });

  it("should have proper accessibility attributes", () => {
    render(<AdminDashboard />);

    const table = screen.getByRole("table");
    expect(table).toHaveAttribute("aria-label", "Users table");

    const searchInput = screen.getByLabelText(/search users/i);
    expect(searchInput).toBeInTheDocument();

    const roleFilter = screen.getByLabelText(/filter by role/i);
    expect(roleFilter).toBeInTheDocument();
  });
});
