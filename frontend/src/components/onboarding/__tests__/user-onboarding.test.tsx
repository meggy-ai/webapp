import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { UserOnboarding } from "@/components/onboarding/user-onboarding";
import { useOnboardingProgress, useCompleteStep } from "@/lib/hooks/use-onboarding";

// Mock the onboarding hooks
jest.mock("@/lib/hooks/use-onboarding", () => ({
  useOnboardingProgress: jest.fn(),
  useCompleteStep: jest.fn(),
}));

// Mock next/router for navigation
jest.mock("next/router", () => ({
  useRouter: () => ({
    push: jest.fn(),
    pathname: "/onboarding",
  }),
}));

describe("UserOnboarding", () => {
  const mockCompleteStep = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useCompleteStep as jest.Mock).mockReturnValue({
      mutate: mockCompleteStep,
      isPending: false,
    });
  });

  it("should render welcome step initially", () => {
    (useOnboardingProgress as jest.Mock).mockReturnValue({
      data: {
        currentStep: 0,
        completedSteps: [],
        isCompleted: false,
      },
      isLoading: false,
    });

    render(<UserOnboarding />);

    expect(screen.getByText("Welcome to Meggy AI!")).toBeInTheDocument();
    expect(screen.getByText(/get started/i)).toBeInTheDocument();
  });

  it("should show profile setup step when current step is 1", () => {
    (useOnboardingProgress as jest.Mock).mockReturnValue({
      data: {
        currentStep: 1,
        completedSteps: [0],
        isCompleted: false,
      },
      isLoading: false,
    });

    render(<UserOnboarding />);

    expect(screen.getByText("Set Up Your Profile")).toBeInTheDocument();
    expect(screen.getByLabelText(/display name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/bio/i)).toBeInTheDocument();
  });

  it("should show preferences step when current step is 2", () => {
    (useOnboardingProgress as jest.Mock).mockReturnValue({
      data: {
        currentStep: 2,
        completedSteps: [0, 1],
        isCompleted: false,
      },
      isLoading: false,
    });

    render(<UserOnboarding />);

    expect(screen.getByText("Choose Your Preferences")).toBeInTheDocument();
    expect(screen.getByLabelText(/theme/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/language/i)).toBeInTheDocument();
  });

  it("should complete welcome step when continue is clicked", async () => {
    const user = userEvent.setup();

    (useOnboardingProgress as jest.Mock).mockReturnValue({
      data: {
        currentStep: 0,
        completedSteps: [],
        isCompleted: false,
      },
      isLoading: false,
    });

    render(<UserOnboarding />);

    const continueButton = screen.getByRole("button", { name: /get started/i });
    await user.click(continueButton);

    expect(mockCompleteStep).toHaveBeenCalledWith({
      stepId: 0,
      data: {},
    });
  });

  it("should complete profile step with form data", async () => {
    const user = userEvent.setup();

    (useOnboardingProgress as jest.Mock).mockReturnValue({
      data: {
        currentStep: 1,
        completedSteps: [0],
        isCompleted: false,
      },
      isLoading: false,
    });

    render(<UserOnboarding />);

    const displayNameInput = screen.getByLabelText(/display name/i);
    const bioInput = screen.getByLabelText(/bio/i);
    const continueButton = screen.getByRole("button", { name: /continue/i });

    await user.type(displayNameInput, "John Doe");
    await user.type(bioInput, "Software developer");
    await user.click(continueButton);

    expect(mockCompleteStep).toHaveBeenCalledWith({
      stepId: 1,
      data: {
        displayName: "John Doe",
        bio: "Software developer",
        avatar: null,
      },
    });
  });

  it("should complete preferences step with selected options", async () => {
    const user = userEvent.setup();

    (useOnboardingProgress as jest.Mock).mockReturnValue({
      data: {
        currentStep: 2,
        completedSteps: [0, 1],
        isCompleted: false,
      },
      isLoading: false,
    });

    render(<UserOnboarding />);

    const themeSelect = screen.getByLabelText(/theme/i);
    const languageSelect = screen.getByLabelText(/language/i);
    const finishButton = screen.getByRole("button", { name: /finish/i });

    await user.selectOptions(themeSelect, "dark");
    await user.selectOptions(languageSelect, "en");
    await user.click(finishButton);

    expect(mockCompleteStep).toHaveBeenCalledWith({
      stepId: 2,
      data: {
        theme: "dark",
        language: "en",
        notifications: {
          email: true,
          push: false,
        },
      },
    });
  });

  it("should show progress indicator with correct step", () => {
    (useOnboardingProgress as jest.Mock).mockReturnValue({
      data: {
        currentStep: 1,
        completedSteps: [0],
        isCompleted: false,
      },
      isLoading: false,
    });

    render(<UserOnboarding />);

    // Check for progress indicators
    const progressSteps = screen.getAllByTestId("progress-step");
    expect(progressSteps).toHaveLength(3);

    // First step should be completed
    expect(progressSteps[0]).toHaveClass("completed");

    // Second step should be current
    expect(progressSteps[1]).toHaveClass("current");

    // Third step should be pending
    expect(progressSteps[2]).toHaveClass("pending");
  });

  it("should allow skipping optional steps", async () => {
    const user = userEvent.setup();

    (useOnboardingProgress as jest.Mock).mockReturnValue({
      data: {
        currentStep: 1,
        completedSteps: [0],
        isCompleted: false,
      },
      isLoading: false,
    });

    render(<UserOnboarding />);

    const skipButton = screen.getByRole("button", { name: /skip/i });
    await user.click(skipButton);

    expect(mockCompleteStep).toHaveBeenCalledWith({
      stepId: 1,
      data: {},
    });
  });

  it("should go back to previous step", async () => {
    const user = userEvent.setup();

    (useOnboardingProgress as jest.Mock).mockReturnValue({
      data: {
        currentStep: 2,
        completedSteps: [0, 1],
        isCompleted: false,
      },
      isLoading: false,
    });

    render(<UserOnboarding />);

    const backButton = screen.getByRole("button", { name: /back/i });
    expect(backButton).toBeInTheDocument();

    await user.click(backButton);

    // Should show previous step content
    await waitFor(() => {
      expect(screen.getByText("Set Up Your Profile")).toBeInTheDocument();
    });
  });

  it("should show loading state during step completion", () => {
    (useOnboardingProgress as jest.Mock).mockReturnValue({
      data: {
        currentStep: 0,
        completedSteps: [],
        isCompleted: false,
      },
      isLoading: false,
    });
    (useCompleteStep as jest.Mock).mockReturnValue({
      mutate: mockCompleteStep,
      isPending: true,
    });

    render(<UserOnboarding />);

    expect(screen.getByText(/processing/i)).toBeInTheDocument();
  });

  it("should have proper accessibility attributes", () => {
    (useOnboardingProgress as jest.Mock).mockReturnValue({
      data: {
        currentStep: 0,
        completedSteps: [],
        isCompleted: false,
      },
      isLoading: false,
    });

    render(<UserOnboarding />);

    const main = screen.getByRole("main");
    expect(main).toHaveAttribute("aria-label", "User onboarding");

    const progressBar = screen.getByRole("progressbar");
    expect(progressBar).toHaveAttribute("aria-valuenow", "1");
    expect(progressBar).toHaveAttribute("aria-valuemax", "3");
  });

  it("should show completion message when onboarding is finished", () => {
    (useOnboardingProgress as jest.Mock).mockReturnValue({
      data: {
        currentStep: 3,
        completedSteps: [0, 1, 2],
        isCompleted: true,
      },
      isLoading: false,
    });

    render(<UserOnboarding />);

    expect(screen.getByText("Welcome aboard!")).toBeInTheDocument();
    expect(screen.getByText(/onboarding complete/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /get started/i })).toBeInTheDocument();
  });
});
