"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
} from "recharts";
import { Users, UserPlus, Activity, TrendingUp, Clock, Globe, Smartphone } from "lucide-react";

// Mock analytics data (replace with real API calls)
const mockAnalytics = {
  userStats: {
    total: 1247,
    active: 892,
    newThisWeek: 23,
    newThisMonth: 156,
    growth: 8.2,
    activeGrowth: 12.1,
  },
  userGrowth: [
    { month: "Jan", users: 856, active: 634 },
    { month: "Feb", users: 923, active: 678 },
    { month: "Mar", users: 1034, active: 743 },
    { month: "Apr", users: 1098, active: 798 },
    { month: "May", users: 1167, active: 834 },
    { month: "Jun", users: 1247, active: 892 },
  ],
  userActivity: [
    { day: "Mon", logins: 245, registrations: 12 },
    { day: "Tue", logins: 298, registrations: 18 },
    { day: "Wed", logins: 321, registrations: 15 },
    { day: "Thu", logins: 287, registrations: 21 },
    { day: "Fri", logins: 356, registrations: 19 },
    { day: "Sat", logins: 189, registrations: 8 },
    { day: "Sun", logins: 167, registrations: 6 },
  ],
  userRoles: [
    { name: "Users", value: 1198, color: "#8884d8" },
    { name: "Moderators", value: 31, color: "#82ca9d" },
    { name: "Admins", value: 18, color: "#ffc658" },
  ],
  onboardingStats: {
    completed: 87.3,
    inProgress: 8.9,
    notStarted: 3.8,
  },
  deviceStats: [
    { device: "Desktop", users: 678, percentage: 54.4 },
    { device: "Mobile", users: 432, percentage: 34.6 },
    { device: "Tablet", users: 137, percentage: 11.0 },
  ],
  topCountries: [
    { country: "United States", users: 445, flag: "🇺🇸" },
    { country: "United Kingdom", users: 234, flag: "🇬🇧" },
    { country: "Canada", users: 167, flag: "🇨🇦" },
    { country: "Germany", users: 123, flag: "🇩🇪" },
    { country: "France", users: 98, flag: "🇫🇷" },
  ],
};

export function AnalyticsDashboard() {
  const [analytics] = useState(mockAnalytics);

  useEffect(() => {
    // Here you would fetch real analytics data
    // For now, we're using mock data
  }, []);

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat().format(num);
  };

  const formatPercentage = (num: number) => {
    return `${num.toFixed(1)}%`;
  };

  return (
    <div className="space-y-6">
      {/* Key Metrics Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(analytics.userStats.total)}</div>
            <p className="text-muted-foreground flex items-center text-xs">
              <TrendingUp className="mr-1 h-3 w-3 text-green-600" />+
              {formatPercentage(analytics.userStats.growth)} from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
            <Activity className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(analytics.userStats.active)}</div>
            <p className="text-muted-foreground flex items-center text-xs">
              <TrendingUp className="mr-1 h-3 w-3 text-green-600" />+
              {formatPercentage(analytics.userStats.activeGrowth)} from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">New This Week</CardTitle>
            <UserPlus className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatNumber(analytics.userStats.newThisWeek)}
            </div>
            <p className="text-muted-foreground text-xs">
              {formatNumber(analytics.userStats.newThisMonth)} this month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Onboarding Rate</CardTitle>
            <Clock className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatPercentage(analytics.onboardingStats.completed)}
            </div>
            <p className="text-muted-foreground text-xs">Completed onboarding successfully</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* User Growth Chart */}
        <Card>
          <CardHeader>
            <CardTitle>User Growth</CardTitle>
            <CardDescription>Total and active users over time</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={analytics.userGrowth}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Area
                  type="monotone"
                  dataKey="users"
                  stackId="1"
                  stroke="#8884d8"
                  fill="#8884d8"
                  fillOpacity={0.6}
                />
                <Area
                  type="monotone"
                  dataKey="active"
                  stackId="2"
                  stroke="#82ca9d"
                  fill="#82ca9d"
                  fillOpacity={0.6}
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Weekly Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Weekly Activity</CardTitle>
            <CardDescription>Logins and registrations by day</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={analytics.userActivity}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="logins" fill="#8884d8" />
                <Bar dataKey="registrations" fill="#82ca9d" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Additional Analytics */}
      <div className="grid gap-6 md:grid-cols-3">
        {/* User Roles Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>User Roles</CardTitle>
            <CardDescription>Distribution of user roles</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={analytics.userRoles}
                  cx="50%"
                  cy="50%"
                  innerRadius={40}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {analytics.userRoles.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="mt-4 space-y-2">
              {analytics.userRoles.map((role, index) => (
                <div key={index} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded-full" style={{ backgroundColor: role.color }} />
                    <span>{role.name}</span>
                  </div>
                  <span className="font-medium">{role.value}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Device Stats */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Smartphone className="h-4 w-4" />
              Device Usage
            </CardTitle>
            <CardDescription>User access by device type</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {analytics.deviceStats.map((device, index) => (
              <div key={index} className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span>{device.device}</span>
                  <span className="font-medium">{formatPercentage(device.percentage)}</span>
                </div>
                <Progress value={device.percentage} className="h-2" />
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Top Countries */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-4 w-4" />
              Top Countries
            </CardTitle>
            <CardDescription>User distribution by country</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {analytics.topCountries.map((country, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-lg">{country.flag}</span>
                  <span className="text-sm">{country.country}</span>
                </div>
                <Badge variant="secondary">{country.users}</Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Onboarding Progress */}
      <Card>
        <CardHeader>
          <CardTitle>Onboarding Progress</CardTitle>
          <CardDescription>User onboarding completion status</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span>Completed Onboarding</span>
              <span className="font-medium">
                {formatPercentage(analytics.onboardingStats.completed)}
              </span>
            </div>
            <Progress value={analytics.onboardingStats.completed} className="h-2" />
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span>In Progress</span>
              <span className="font-medium">
                {formatPercentage(analytics.onboardingStats.inProgress)}
              </span>
            </div>
            <Progress value={analytics.onboardingStats.inProgress} className="h-2" />
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span>Not Started</span>
              <span className="font-medium">
                {formatPercentage(analytics.onboardingStats.notStarted)}
              </span>
            </div>
            <Progress value={analytics.onboardingStats.notStarted} className="h-2" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
