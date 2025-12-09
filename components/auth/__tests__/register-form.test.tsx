import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { RegisterForm } from "@/components/auth/register-form";
import { useRegister } from "@/lib/hooks/use-auth";

// Mock the auth hook
jest.mock("@/lib/hooks/use-auth", () => ({
  useRegister: jest.fn(),
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

describe("RegisterForm", () => {
  const mockMutateAsync = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useRegister as jest.Mock).mockReturnValue({
      mutateAsync: mockMutateAsync,
      isPending: false,
    });
  });

  it("should render registration form elements", () => {
    render(
      <div>
        <RegisterForm />
      </div>,
      { wrapper: createWrapper() }
    );

    expect(screen.getByText("Create Account")).toBeInTheDocument();
    expect(screen.getByLabelText(/full name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^password/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/confirm password/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /create account/i })).toBeInTheDocument();
  });

  it("should handle form submission with valid data", async () => {
    const user = userEvent.setup();

    render(
      <div>
        <RegisterForm />
      </div>,
      { wrapper: createWrapper() }
    );

    const nameInput = screen.getByLabelText(/full name/i);
    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/^password/i);
    const confirmPasswordInput = screen.getByLabelText(/confirm password/i);
    const submitButton = screen.getByRole("button", { name: /create account/i });

    await user.type(nameInput, "John Doe");
    await user.type(emailInput, "john@example.com");
    await user.type(passwordInput, "SecurePass123!");
    await user.type(confirmPasswordInput, "SecurePass123!");
    await user.click(submitButton);

    await waitFor(() => {
      expect(mockMutateAsync).toHaveBeenCalledWith({
        name: "John Doe",
        email: "john@example.com",
        password: "SecurePass123!",
        confirmPassword: "SecurePass123!",
      });
    });
  });

  it("should show validation error when passwords do not match", async () => {
    const user = userEvent.setup();

    render(
      <div>
        <RegisterForm />
      </div>,
      { wrapper: createWrapper() }
    );

    const passwordInput = screen.getByLabelText(/^password/i);
    const confirmPasswordInput = screen.getByLabelText(/confirm password/i);
    const submitButton = screen.getByRole("button", { name: /create account/i });

    await user.type(passwordInput, "password123");
    await user.type(confirmPasswordInput, "differentpassword");
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/passwords do not match/i)).toBeInTheDocument();
    });
  });

  it("should show password strength indicator", async () => {
    const user = userEvent.setup();

    render(
      <div>
        <RegisterForm />
      </div>,
      { wrapper: createWrapper() }
    );

    const passwordInput = screen.getByLabelText(/^password/i);

    // Test weak password
    await user.type(passwordInput, "weak");
    expect(screen.getByText(/weak/i)).toBeInTheDocument();

    // Clear and test strong password
    await user.clear(passwordInput);
    await user.type(passwordInput, "StrongPassword123!");
    expect(screen.getByText(/strong/i)).toBeInTheDocument();
  });

  it("should show loading state during submission", () => {
    (useRegister as jest.Mock).mockReturnValue({
      mutateAsync: mockMutateAsync,
      isPending: true,
    });

    render(
      <div>
        <RegisterForm />
      </div>,
      { wrapper: createWrapper() }
    );

    expect(screen.getByText(/creating account/i)).toBeInTheDocument();
  });

  it("should toggle password visibility", async () => {
    const user = userEvent.setup();

    render(
      <div>
        <RegisterForm />
      </div>,
      { wrapper: createWrapper() }
    );

    const passwordInput = screen.getByLabelText(/^password/i);
    const toggleButtons = screen.getAllByRole("button", { name: /toggle password visibility/i });

    expect(passwordInput).toHaveAttribute("type", "password");

    await user.click(toggleButtons[0]);
    expect(passwordInput).toHaveAttribute("type", "text");
  });

  it("should validate required fields", async () => {
    const user = userEvent.setup();

    render(
      <div>
        <RegisterForm />
      </div>,
      { wrapper: createWrapper() }
    );

    const submitButton = screen.getByRole("button", { name: /create account/i });
    await user.click(submitButton);

    const nameInput = screen.getByLabelText(/full name/i);
    const emailInput = screen.getByLabelText(/email/i);

    expect(nameInput).toBeInvalid();
    expect(emailInput).toBeInvalid();
  });

  it("should validate email format", async () => {
    const user = userEvent.setup();

    render(
      <div>
        <RegisterForm />
      </div>,
      { wrapper: createWrapper() }
    );

    const emailInput = screen.getByLabelText(/email/i);
    const submitButton = screen.getByRole("button", { name: /create account/i });

    await user.type(emailInput, "invalid-email");
    await user.click(submitButton);

    expect(emailInput).toBeInvalid();
  });

  it("should have proper accessibility attributes", () => {
    render(
      <div>
        <RegisterForm />
      </div>,
      { wrapper: createWrapper() }
    );

    const form = screen.getByRole("form", { name: /register/i });
    expect(form).toBeInTheDocument();

    const emailInput = screen.getByLabelText(/email/i);
    expect(emailInput).toHaveAttribute("type", "email");
    expect(emailInput).toHaveAttribute("autoComplete", "email");

    const passwordInput = screen.getByLabelText(/^password/i);
    expect(passwordInput).toHaveAttribute("autoComplete", "new-password");
  });

  it("should show terms and privacy policy links", () => {
    render(
      <div>
        <RegisterForm />
      </div>,
      { wrapper: createWrapper() }
    );

    expect(screen.getByRole("link", { name: /terms of service/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /privacy policy/i })).toBeInTheDocument();
  });
});
