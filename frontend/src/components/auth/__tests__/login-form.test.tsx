import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { LoginForm } from "@/components/auth/login-form";
import { useLogin } from "@/lib/hooks/use-auth";

// Mock the auth hook
jest.mock("@/lib/hooks/use-auth", () => ({
  useLogin: jest.fn(),
}));

// Mock next/navigation
jest.mock("next/navigation", () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
  }),
}));

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

describe("LoginForm", () => {
  const mockMutateAsync = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useLogin as jest.Mock).mockReturnValue({
      mutateAsync: mockMutateAsync,
      isPending: false,
    });
  });

  it("should render login form elements", () => {
    render(
      <div>
        <LoginForm />
      </div>,
      { wrapper: createWrapper() }
    );

    expect(screen.getByText("Welcome Back")).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /sign in/i })).toBeInTheDocument();
  });

  it("should handle form submission with valid data", async () => {
    const user = userEvent.setup();

    render(
      <div>
        <LoginForm />
      </div>,
      { wrapper: createWrapper() }
    );

    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const submitButton = screen.getByRole("button", { name: /sign in/i });

    await user.type(emailInput, "test@example.com");
    await user.type(passwordInput, "password123");
    await user.click(submitButton);

    await waitFor(() => {
      expect(mockMutateAsync).toHaveBeenCalledWith({
        email: "test@example.com",
        password: "password123",
      });
    });
  });

  it("should show validation errors for invalid inputs", async () => {
    const user = userEvent.setup();

    render(
      <div>
        <LoginForm />
      </div>,
      { wrapper: createWrapper() }
    );

    const submitButton = screen.getByRole("button", { name: /sign in/i });
    await user.click(submitButton);

    // Check for HTML5 validation or custom validation messages
    const emailInput = screen.getByLabelText(/email/i);
    expect(emailInput).toBeInvalid();
  });

  it("should show loading state during submission", () => {
    (useLogin as jest.Mock).mockReturnValue({
      mutateAsync: mockMutateAsync,
      isPending: true,
    });

    render(
      <div>
        <LoginForm />
      </div>,
      { wrapper: createWrapper() }
    );

    expect(screen.getByText(/signing in/i)).toBeInTheDocument();
  });

  it("should toggle password visibility", async () => {
    const user = userEvent.setup();

    render(
      <div>
        <LoginForm />
      </div>,
      { wrapper: createWrapper() }
    );

    const passwordInput = screen.getByLabelText(/password/i);
    const toggleButton = screen.getByRole("button", { name: /toggle password visibility/i });

    expect(passwordInput).toHaveAttribute("type", "password");

    await user.click(toggleButton);
    expect(passwordInput).toHaveAttribute("type", "text");

    await user.click(toggleButton);
    expect(passwordInput).toHaveAttribute("type", "password");
  });

  it("should handle remember me checkbox", async () => {
    const user = userEvent.setup();

    render(
      <div>
        <LoginForm />
      </div>,
      { wrapper: createWrapper() }
    );

    const rememberMeCheckbox = screen.getByLabelText(/remember me/i);
    expect(rememberMeCheckbox).not.toBeChecked();

    await user.click(rememberMeCheckbox);
    expect(rememberMeCheckbox).toBeChecked();
  });

  it("should have proper accessibility attributes", () => {
    render(
      <div>
        <LoginForm />
      </div>,
      { wrapper: createWrapper() }
    );

    const form = screen.getByRole("form", { name: /login/i });
    expect(form).toBeInTheDocument();

    const emailInput = screen.getByLabelText(/email/i);
    expect(emailInput).toHaveAttribute("type", "email");
    expect(emailInput).toHaveAttribute("autoComplete", "email");

    const passwordInput = screen.getByLabelText(/password/i);
    expect(passwordInput).toHaveAttribute("autoComplete", "current-password");
  });
});
