import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Bot, MessageSquare, Users, Plus, TrendingUp, Clock, Zap } from "lucide-react";

export default function Dashboard() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back! Here&apos;s what&apos;s happening with your AI agents.
          </p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          New Agent
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Agents</CardTitle>
            <Bot className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3</div>
            <p className="text-muted-foreground text-xs">
              <span className="text-green-600">+1</span> from last week
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Conversations</CardTitle>
            <MessageSquare className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1,247</div>
            <p className="text-muted-foreground text-xs">
              <span className="text-green-600">+12%</span> from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Response Time</CardTitle>
            <Zap className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0.8s</div>
            <p className="text-muted-foreground text-xs">
              <span className="text-green-600">-0.2s</span> from last week
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Usage Score</CardTitle>
            <TrendingUp className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">94%</div>
            <p className="text-muted-foreground text-xs">
              <span className="text-green-600">+3%</span> from last month
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Content Grid */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Active Agents */}
        <Card>
          <CardHeader>
            <CardTitle>Active Agents</CardTitle>
            <CardDescription>Your currently deployed AI agents</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between space-x-4">
              <div className="flex items-center space-x-4">
                <div className="bg-primary text-primary-foreground flex h-9 w-9 items-center justify-center rounded-lg">
                  <Bot className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-sm font-medium">Customer Support Bot</p>
                  <p className="text-muted-foreground text-sm">Active • 24/7</p>
                </div>
              </div>
              <Badge variant="secondary">Running</Badge>
            </div>

            <div className="flex items-center justify-between space-x-4">
              <div className="flex items-center space-x-4">
                <div className="bg-secondary text-secondary-foreground flex h-9 w-9 items-center justify-center rounded-lg">
                  <Users className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-sm font-medium">Personal Assistant</p>
                  <p className="text-muted-foreground text-sm">Active • On-demand</p>
                </div>
              </div>
              <Badge variant="secondary">Running</Badge>
            </div>

            <div className="flex items-center justify-between space-x-4">
              <div className="flex items-center space-x-4">
                <div className="bg-muted text-muted-foreground flex h-9 w-9 items-center justify-center rounded-lg">
                  <MessageSquare className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-sm font-medium">Content Creator</p>
                  <p className="text-muted-foreground text-sm">Idle • Scheduled</p>
                </div>
              </div>
              <Badge variant="outline">Idle</Badge>
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Latest interactions with your agents</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start space-x-4">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-400">
                <MessageSquare className="h-4 w-4" />
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium">New conversation started</p>
                <p className="text-muted-foreground text-sm">
                  Customer Support Bot • 2 minutes ago
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-400">
                <Bot className="h-4 w-4" />
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium">Agent updated successfully</p>
                <p className="text-muted-foreground text-sm">Personal Assistant • 1 hour ago</p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-yellow-100 text-yellow-600 dark:bg-yellow-900 dark:text-yellow-400">
                <Clock className="h-4 w-4" />
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium">Scheduled task completed</p>
                <p className="text-muted-foreground text-sm">Content Creator • 3 hours ago</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
