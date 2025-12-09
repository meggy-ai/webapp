import { ProtectedRoute } from "@/lib/guards/auth-guard";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, UserPlus, Settings, Activity } from "lucide-react";

const statsCards = [
  {
    title: "Total Users",
    value: "0",
    description: "Active users in the system",
    icon: Users,
    change: "+0%",
  },
  {
    title: "New Signups",
    value: "0",
    description: "New users this month",
    icon: UserPlus,
    change: "+0%",
  },
  {
    title: "System Health",
    value: "100%",
    description: "System uptime",
    icon: Activity,
    change: "+0%",
  },
  {
    title: "Configuration",
    value: "Ready",
    description: "System configuration status",
    icon: Settings,
    change: "Active",
  },
];

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <DashboardLayout>
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
            <p className="text-muted-foreground">
              Welcome to your Meggy AI dashboard. User management features are ready.
            </p>
          </div>

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
                    <p className="text-muted-foreground text-xs">{card.description}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Card className="col-span-2">
              <CardHeader>
                <CardTitle>User Management System</CardTitle>
                <CardDescription>
                  Core authentication and user management features are ready
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid gap-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Authentication System</span>
                      <span className="rounded bg-green-100 px-2 py-1 text-xs text-green-800 dark:bg-green-900 dark:text-green-200">
                        Ready
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">User Registration</span>
                      <span className="rounded bg-green-100 px-2 py-1 text-xs text-green-800 dark:bg-green-900 dark:text-green-200">
                        Ready
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Profile Management</span>
                      <span className="rounded bg-green-100 px-2 py-1 text-xs text-green-800 dark:bg-green-900 dark:text-green-200">
                        Ready
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Password Management</span>
                      <span className="rounded bg-green-100 px-2 py-1 text-xs text-green-800 dark:bg-green-900 dark:text-green-200">
                        Ready
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>AI Features Status</CardTitle>
                <CardDescription>Waiting for bruno-core ecosystem</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Chat System</span>
                    <span className="rounded bg-yellow-100 px-2 py-1 text-xs text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
                      Deferred
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">AI Agents</span>
                    <span className="rounded bg-yellow-100 px-2 py-1 text-xs text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
                      Deferred
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Agent Dashboard</span>
                    <span className="rounded bg-yellow-100 px-2 py-1 text-xs text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
                      Deferred
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
