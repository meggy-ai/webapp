"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/stores/auth-store";
import { useUpdateProfile, useCompleteOnboarding } from "@/lib/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import {
  ChevronRight,
  ChevronLeft,
  User,
  Building,
  Sparkles,
  CheckCircle,
  ArrowRight,
  Users,
  Settings,
  Shield,
} from "lucide-react";
import { toast } from "sonner";

interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  component: React.ComponentType<{ onNext: () => void; onPrev: () => void; isLast: boolean }>;
}

const WelcomeStep = ({ onNext }: { onNext: () => void; onPrev: () => void; isLast: boolean }) => {
  const { user } = useAuth();

  return (
    <div className="space-y-6 text-center">
      <div className="space-y-2">
        <Sparkles className="text-primary mx-auto h-16 w-16" />
        <h2 className="text-3xl font-bold">Welcome to Meggy AI!</h2>
        <p className="text-muted-foreground text-lg">
          We&apos;re excited to have you here. Let&apos;s get you set up in just a few steps.
        </p>
      </div>

      <div className="bg-muted/50 space-y-4 rounded-lg p-6">
        <div className="flex items-center space-x-2">
          <CheckCircle className="h-5 w-5 text-green-600" />
          <span className="text-sm">Account created successfully</span>
        </div>
        <div className="flex items-center space-x-2">
          <CheckCircle className="h-5 w-5 text-green-600" />
          <span className="text-sm">Email: {user?.email}</span>
        </div>
        <div className="flex items-center space-x-2">
          <CheckCircle className="h-5 w-5 text-green-600" />
          <span className="text-sm">Ready to personalize your experience</span>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="font-semibold">What we&apos;ll cover:</h3>
        <div className="grid grid-cols-1 gap-4 text-sm md:grid-cols-3">
          <div className="flex items-center space-x-2">
            <User className="text-primary h-4 w-4" />
            <span>Personal Info</span>
          </div>
          <div className="flex items-center space-x-2">
            <Building className="text-primary h-4 w-4" />
            <span>Work Details</span>
          </div>
          <div className="flex items-center space-x-2">
            <Settings className="text-primary h-4 w-4" />
            <span>Preferences</span>
          </div>
        </div>
      </div>

      <Button onClick={onNext} size="lg" className="w-full md:w-auto">
        Let&apos;s Get Started
        <ArrowRight className="ml-2 h-4 w-4" />
      </Button>
    </div>
  );
};

const PersonalInfoStep = ({
  onNext,
  onPrev,
}: {
  onNext: () => void;
  onPrev: () => void;
  isLast: boolean;
}) => {
  const { user } = useAuth();
  const updateProfileMutation = useUpdateProfile();

  const [formData, setFormData] = useState({
    first_name: user?.first_name || "",
    last_name: user?.last_name || "",
    bio: user?.bio || "",
    location: user?.location || "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.first_name.trim()) {
      newErrors.first_name = "First name is required";
    }
    if (!formData.last_name.trim()) {
      newErrors.last_name = "Last name is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateForm()) {
      updateProfileMutation.mutate(formData, {
        onSuccess: () => {
          toast.success("Personal information saved!");
          onNext();
        },
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2 text-center">
        <User className="text-primary mx-auto h-12 w-12" />
        <h2 className="text-2xl font-bold">Personal Information</h2>
        <p className="text-muted-foreground">
          Tell us a bit about yourself so we can personalize your experience
        </p>
      </div>

      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="firstName">First Name *</Label>
            <Input
              id="firstName"
              value={formData.first_name}
              onChange={(e) => setFormData((prev) => ({ ...prev, first_name: e.target.value }))}
              placeholder="Enter your first name"
              className={errors.first_name ? "border-red-500" : ""}
            />
            {errors.first_name && <p className="text-sm text-red-600">{errors.first_name}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="lastName">Last Name *</Label>
            <Input
              id="lastName"
              value={formData.last_name}
              onChange={(e) => setFormData((prev) => ({ ...prev, last_name: e.target.value }))}
              placeholder="Enter your last name"
              className={errors.last_name ? "border-red-500" : ""}
            />
            {errors.last_name && <p className="text-sm text-red-600">{errors.last_name}</p>}
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="location">Location</Label>
          <Input
            id="location"
            value={formData.location}
            onChange={(e) => setFormData((prev) => ({ ...prev, location: e.target.value }))}
            placeholder="City, Country (optional)"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="bio">Bio</Label>
          <textarea
            id="bio"
            className="border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring flex min-h-[80px] w-full rounded-md border px-3 py-2 text-sm focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
            value={formData.bio}
            onChange={(e) => setFormData((prev) => ({ ...prev, bio: e.target.value }))}
            placeholder="Tell us about yourself (optional)"
          />
        </div>
      </div>

      <div className="flex justify-between">
        <Button variant="outline" onClick={onPrev}>
          <ChevronLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <Button onClick={handleNext} disabled={updateProfileMutation.isPending}>
          {updateProfileMutation.isPending ? "Saving..." : "Continue"}
          <ChevronRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

const WorkDetailsStep = ({
  onNext,
  onPrev,
}: {
  onNext: () => void;
  onPrev: () => void;
  isLast: boolean;
}) => {
  const { user } = useAuth();
  const updateProfileMutation = useUpdateProfile();

  const [formData, setFormData] = useState({
    company: user?.company || "",
    job_title: user?.job_title || "",
    website: user?.website || "",
  });

  const handleNext = () => {
    updateProfileMutation.mutate(formData, {
      onSuccess: () => {
        toast.success("Work details saved!");
        onNext();
      },
    });
  };

  const handleSkip = () => {
    onNext();
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2 text-center">
        <Building className="text-primary mx-auto h-12 w-12" />
        <h2 className="text-2xl font-bold">Work Details</h2>
        <p className="text-muted-foreground">
          Help us understand your professional background (optional)
        </p>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="company">Company</Label>
          <Input
            id="company"
            value={formData.company}
            onChange={(e) => setFormData((prev) => ({ ...prev, company: e.target.value }))}
            placeholder="Company or organization name"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="jobTitle">Job Title</Label>
          <Input
            id="jobTitle"
            value={formData.job_title}
            onChange={(e) => setFormData((prev) => ({ ...prev, job_title: e.target.value }))}
            placeholder="Your role or position"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="website">Website</Label>
          <Input
            id="website"
            type="url"
            value={formData.website}
            onChange={(e) => setFormData((prev) => ({ ...prev, website: e.target.value }))}
            placeholder="https://your-website.com"
          />
        </div>
      </div>

      <div className="flex justify-between">
        <Button variant="outline" onClick={onPrev}>
          <ChevronLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <div className="space-x-2">
          <Button variant="ghost" onClick={handleSkip}>
            Skip for now
          </Button>
          <Button onClick={handleNext} disabled={updateProfileMutation.isPending}>
            {updateProfileMutation.isPending ? "Saving..." : "Continue"}
            <ChevronRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

const CompletionStep = ({}: { onNext: () => void; onPrev: () => void; isLast: boolean }) => {
  const router = useRouter();
  const completeOnboardingMutation = useCompleteOnboarding();

  const handleFinish = () => {
    completeOnboardingMutation.mutate(undefined, {
      onSuccess: () => {
        toast.success("Welcome to Meggy AI! Your account is all set up.");
        router.push("/dashboard");
      },
    });
  };

  return (
    <div className="space-y-6 text-center">
      <div className="space-y-2">
        <CheckCircle className="mx-auto h-16 w-16 text-green-600" />
        <h2 className="text-3xl font-bold">You&apos;re All Set!</h2>
        <p className="text-muted-foreground text-lg">
          Your profile is complete and ready to go. Welcome to the Meggy AI community!
        </p>
      </div>

      <div className="from-primary/10 to-primary/5 space-y-4 rounded-lg bg-gradient-to-r p-6">
        <h3 className="font-semibold">What&apos;s Next?</h3>
        <div className="grid grid-cols-1 gap-4 text-sm md:grid-cols-3">
          <div className="flex flex-col items-center space-y-2">
            <Users className="text-primary h-8 w-8" />
            <span className="font-medium">Explore Your Dashboard</span>
            <span className="text-muted-foreground text-center">
              View your personalized analytics and activity
            </span>
          </div>
          <div className="flex flex-col items-center space-y-2">
            <Settings className="text-primary h-8 w-8" />
            <span className="font-medium">Customize Settings</span>
            <span className="text-muted-foreground text-center">
              Adjust preferences and notifications
            </span>
          </div>
          <div className="flex flex-col items-center space-y-2">
            <Shield className="text-primary h-8 w-8" />
            <span className="font-medium">Review Security</span>
            <span className="text-muted-foreground text-center">
              Update password and security settings
            </span>
          </div>
        </div>
      </div>

      <Button
        onClick={handleFinish}
        size="lg"
        className="w-full md:w-auto"
        disabled={completeOnboardingMutation.isPending}
      >
        {completeOnboardingMutation.isPending ? "Completing..." : "Go to Dashboard"}
        <ArrowRight className="ml-2 h-4 w-4" />
      </Button>
    </div>
  );
};

const steps: OnboardingStep[] = [
  {
    id: "welcome",
    title: "Welcome",
    description: "Getting started with Meggy AI",
    icon: Sparkles,
    component: WelcomeStep,
  },
  {
    id: "personal",
    title: "Personal Info",
    description: "Tell us about yourself",
    icon: User,
    component: PersonalInfoStep,
  },
  {
    id: "work",
    title: "Work Details",
    description: "Professional background",
    icon: Building,
    component: WorkDetailsStep,
  },
  {
    id: "complete",
    title: "Complete",
    description: "You&apos;re ready to go!",
    icon: CheckCircle,
    component: CompletionStep,
  },
];

export function OnboardingWizard() {
  const [currentStep, setCurrentStep] = useState(0);

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const CurrentStepComponent = steps[currentStep].component;
  const progress = ((currentStep + 1) / steps.length) * 100;

  return (
    <div className="bg-background flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <div className="space-y-4">
            {/* Progress bar */}
            <div className="space-y-2">
              <div className="text-muted-foreground flex justify-between text-sm">
                <span>
                  Step {currentStep + 1} of {steps.length}
                </span>
                <span>{Math.round(progress)}% complete</span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>

            {/* Step indicators */}
            <div className="flex items-center justify-center space-x-4">
              {steps.map((step, index) => {
                const Icon = step.icon;
                const isActive = index === currentStep;
                const isCompleted = index < currentStep;

                return (
                  <div key={step.id} className="flex items-center">
                    <div
                      className={`flex h-10 w-10 items-center justify-center rounded-full ${
                        isCompleted
                          ? "bg-green-600 text-white"
                          : isActive
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted text-muted-foreground"
                      }`}
                    >
                      <Icon className="h-5 w-5" />
                    </div>
                    {index < steps.length - 1 && (
                      <Separator className="mx-2 w-8" orientation="horizontal" />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          <CurrentStepComponent
            onNext={handleNext}
            onPrev={handlePrev}
            isLast={currentStep === steps.length - 1}
          />
        </CardContent>
      </Card>
    </div>
  );
}
