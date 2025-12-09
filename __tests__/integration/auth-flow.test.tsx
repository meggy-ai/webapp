import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import AuthFlow from "@/app/(auth)/login/page";
import { useAuth } from "@/lib/hooks/use-auth";

// Mock the auth hook
jest.mock("@/lib/hooks/use-auth");

// Mock next/navigation
jest.mock("next/navigation", () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
  }),
  redirect: jest.fn(),
}));

// Mock API calls
global.fetch = jest.fn();

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  const Wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
  Wrapper.displayName = "TestWrapper";
  return Wrapper;
};

describe("Auth Flow Integration", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (fetch as jest.Mock).mockClear();
    (useAuth as jest.Mock).mockReturnValue({
      user: null,
      isLoading: false,
    });
  });

  it("should complete full login flow", async () => {
    const user = userEvent.setup();

    // Mock successful login API response
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        user: {
          id: "1",
          email: "test@example.com",
          name: "Test User",
          role: "user",
        },
        token: "mock-jwt-token",
      }),
    });

    render(<AuthFlow />, { wrapper: createWrapper() });

    // Fill out login form
    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const submitButton = screen.getByRole("button", { name: /sign in/i });

    await user.type(emailInput, "test@example.com");
    await user.type(passwordInput, "password123");
    await user.click(submitButton);

    // Verify API call
    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: "test@example.com",
          password: "password123",
        }),
      });
    });
  });

  it("should handle login error gracefully", async () => {
    const user = userEvent.setup();

    // Mock failed login API response
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      status: 401,
      json: async () => ({
        error: "Invalid credentials",
      }),
    });

    render(<AuthFlow />, { wrapper: createWrapper() });

    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const submitButton = screen.getByRole("button", { name: /sign in/i });

    await user.type(emailInput, "test@example.com");
    await user.type(passwordInput, "wrongpassword");
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/invalid credentials/i)).toBeInTheDocument();
    });
  });

  it("should redirect authenticated users", () => {
    (useAuth as jest.Mock).mockReturnValue({
      user: {
        id: "1",
        email: "test@example.com",
        name: "Test User",
      },
      isLoading: false,
    });

    render(<AuthFlow />, { wrapper: createWrapper() });

    // Should redirect to dashboard
    expect(screen.queryByText(/welcome back/i)).not.toBeInTheDocument();
  });

  it("should complete registration to login flow", async () => {
    const user = userEvent.setup();

    // Mock successful registration API response
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        user: {
          id: "1",
          email: "newuser@example.com",
          name: "New User",
          role: "user",
        },
        token: "mock-jwt-token",
      }),
    });

    render(<AuthFlow />, { wrapper: createWrapper() });

    // Switch to register form
    const registerLink = screen.getByRole("link", { name: /create account/i });
    await user.click(registerLink);

    // Fill out registration form
    const nameInput = screen.getByLabelText(/full name/i);
    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/^password/i);
    const confirmPasswordInput = screen.getByLabelText(/confirm password/i);
    const submitButton = screen.getByRole("button", { name: /create account/i });

    await user.type(nameInput, "New User");
    await user.type(emailInput, "newuser@example.com");
    await user.type(passwordInput, "SecurePass123!");
    await user.type(confirmPasswordInput, "SecurePass123!");
    await user.click(submitButton);

    // Verify API call
    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: "New User",
          email: "newuser@example.com",
          password: "SecurePass123!",
          confirmPassword: "SecurePass123!",
        }),
      });
    });
  });

  it("should handle session expiration during flow", async () => {
    const user = userEvent.setup();

    // Mock session expired response
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      status: 401,
      json: async () => ({
        error: "Session expired",
      }),
    });

    render(<AuthFlow />, { wrapper: createWrapper() });

    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const submitButton = screen.getByRole("button", { name: /sign in/i });

    await user.type(emailInput, "test@example.com");
    await user.type(passwordInput, "password123");
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/session expired/i)).toBeInTheDocument();
    });
  });

  it("should remember user preference across sessions", async () => {
    const user = userEvent.setup();

    // Mock localStorage
    const localStorageMock = {
      getItem: jest.fn().mockReturnValue("true"),
      setItem: jest.fn(),
      removeItem: jest.fn(),
    };
    Object.defineProperty(window, "localStorage", {
      value: localStorageMock,
    });

    render(<AuthFlow />, { wrapper: createWrapper() });

    const rememberMeCheckbox = screen.getByLabelText(/remember me/i);
    expect(rememberMeCheckbox).toBeChecked();

    await user.click(rememberMeCheckbox);
    expect(localStorageMock.setItem).toHaveBeenCalledWith("rememberMe", "false");
  });

  it("should handle network errors gracefully", async () => {
    const user = userEvent.setup();

    // Mock network error
    (fetch as jest.Mock).mockRejectedValueOnce(new Error("Network error"));

    render(<AuthFlow />, { wrapper: createWrapper() });

    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const submitButton = screen.getByRole("button", { name: /sign in/i });

    await user.type(emailInput, "test@example.com");
    await user.type(passwordInput, "password123");
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/network error/i)).toBeInTheDocument();
    });
  });

  it("should validate form fields before submission", async () => {
    const user = userEvent.setup();

    render(<AuthFlow />, { wrapper: createWrapper() });

    const submitButton = screen.getByRole("button", { name: /sign in/i });
    await user.click(submitButton);

    // Should not make API call with invalid form
    expect(fetch).not.toHaveBeenCalled();

    // Should show validation errors
    const emailInput = screen.getByLabelText(/email/i);
    expect(emailInput).toBeInvalid();
  });
});
