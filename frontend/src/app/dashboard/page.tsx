import { ProtectedRoute } from "@/lib/guards/auth-guard";
import { OnboardingGuard } from "@/components/guards/onboarding-guard";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/stores/auth-store";
import {
  Users,
  UserPlus,
  Settings,
  Activity,
  Calendar,
  Clock,
  CheckCircle,
  Shield,
} from "lucide-react";
import Link from "next/link";

const statsCards = [
  {
    title: "Account Age",
    value: "< 1 day",
    description: "Time since registration",
    icon: Calendar,
    change: "New account",
  },
  {
    title: "Sessions Today",
    value: "1",
    description: "Active sessions today",
    icon: Activity,
    change: "Current session",
  },
  {
    title: "Profile Complete",
    value: "60%",
    description: "Profile completion rate",
    icon: Users,
    change: "+20% this week",
  },
  {
    title: "Security Score",
    value: "85%",
    description: "Account security level",
    icon: Shield,
    change: "Good standing",
  },
];

const recentActivity = [
  {
    action: "Account created",
    time: "Just now",
    icon: UserPlus,
    status: "success",
  },
  {
    action: "Email verified",
    time: "Pending",
    icon: CheckCircle,
    status: "pending",
  },
  {
    action: "Profile setup",
    time: "In progress",
    icon: Settings,
    status: "info",
  },
];

const quickActions = [
  {
    title: "Complete Profile",
    description: "Add your personal information",
    href: "/profile",
    icon: Users,
    color: "bg-blue-500",
  },
  {
    title: "Security Settings",
    description: "Update password and security",
    href: "/profile?tab=security",
    icon: Shield,
    color: "bg-green-500",
  },
  {
    title: "Preferences",
    description: "Customize your experience",
    href: "/settings",
    icon: Settings,
    color: "bg-purple-500",
  },
];

export default function DashboardPage() {
  const { user } = useAuth();

  const getGreeting = () => {
    const hour = new Date().getHours();
    const name = user?.first_name || "there";

    if (hour < 12) return `Good morning, ${name}!`;
    if (hour < 18) return `Good afternoon, ${name}!`;
    return `Good evening, ${name}!`;
  };

  const getProfileCompletion = () => {
    if (!user) return 0;
    let completion = 20; // Base for having an account

    if (user.first_name) completion += 15;
    if (user.last_name) completion += 15;
    if (user.is_email_verified) completion += 20;
    if (user.bio) completion += 10;
    if (user.location) completion += 5;
    if (user.company) completion += 5;
    if (user.job_title) completion += 5;
    if (user.avatar) completion += 5;

    return Math.min(completion, 100);
  };

  return (
    <ProtectedRoute>
      <OnboardingGuard>
        <DashboardLayout>
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold tracking-tight">{getGreeting()}</h1>
                <p className="text-muted-foreground">
                  Welcome to your personal dashboard. Here&apos;s what&apos;s happening with your
                  account.
                </p>
              </div>
              <Button asChild>
                <Link href="/profile">
                  <Settings className="mr-2 h-4 w-4" />
                  Manage Account
                </Link>
              </Button>
            </div>

            {/* Profile Completion Banner */}
            <Card className="border-blue-200 dark:border-blue-800">
              <CardContent className="pt-6">
                <div className="mb-4 flex items-center justify-between">
                  <div className="space-y-1">
                    <h3 className="font-semibold">Complete Your Profile</h3>
                    <p className="text-muted-foreground text-sm">
                      {getProfileCompletion()}% complete - Add more details to enhance your
                      experience
                    </p>
                  </div>
                  <Badge variant="outline">{getProfileCompletion()}%</Badge>
                </div>
                <Progress value={getProfileCompletion()} className="h-2" />
              </CardContent>
            </Card>

            {/* Stats Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {statsCards.map((card, index) => {
                const Icon = card.icon;
                return (
                  <Card key={index}>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">{card.title}</CardTitle>
                      <Icon className="text-muted-foreground h-4 w-4" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{card.value}</div>
                      <p className="text-muted-foreground mt-1 text-xs">{card.change}</p>
                      <p className="text-muted-foreground text-xs">{card.description}</p>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              {/* Quick Actions */}
              <Card>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                  <CardDescription>Common tasks and shortcuts</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {quickActions.map((action, index) => {
                    const Icon = action.icon;
                    return (
                      <Link key={index} href={action.href}>
                        <div className="hover:bg-muted/50 flex cursor-pointer items-center space-x-3 rounded-lg p-3 transition-colors">
                          <div className={`rounded-md p-2 ${action.color} text-white`}>
                            <Icon className="h-4 w-4" />
                          </div>
                          <div className="flex-1 space-y-1">
                            <p className="text-sm font-medium">{action.title}</p>
                            <p className="text-muted-foreground text-xs">{action.description}</p>
                          </div>
                        </div>
                      </Link>
                    );
                  })}
                </CardContent>
              </Card>

              {/* Recent Activity */}
              <Card>
                <CardHeader>
                  <CardTitle>Recent Activity</CardTitle>
                  <CardDescription>Your recent account activity</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {recentActivity.map((activity, index) => {
                      const Icon = activity.icon;
                      return (
                        <div key={index} className="flex items-center space-x-3">
                          <div
                            className={`rounded-full p-2 ${
                              activity.status === "success"
                                ? "bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-400"
                                : activity.status === "pending"
                                  ? "bg-yellow-100 text-yellow-600 dark:bg-yellow-900 dark:text-yellow-400"
                                  : "bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-400"
                            }`}
                          >
                            <Icon className="h-3 w-3" />
                          </div>
                          <div className="flex-1 space-y-1">
                            <p className="text-sm font-medium">{activity.action}</p>
                            <p className="text-muted-foreground text-xs">{activity.time}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>

              {/* System Status */}
              <Card>
                <CardHeader>
                  <CardTitle>System Status</CardTitle>
                  <CardDescription>Platform health and updates</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">User Management</span>
                      <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                        <CheckCircle className="mr-1 h-3 w-3" />
                        Online
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Authentication</span>
                      <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                        <CheckCircle className="mr-1 h-3 w-3" />
                        Operational
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">AI Services</span>
                      <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
                        <Clock className="mr-1 h-3 w-3" />
                        Coming Soon
                      </Badge>
                    </div>
                    <div className="border-t pt-2">
                      <p className="text-muted-foreground text-xs">
                        All core services are running normally. AI features will be available soon.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </DashboardLayout>
      </OnboardingGuard>
    </ProtectedRoute>
  );
}
