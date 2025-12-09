"use client";

import { useState } from "react";
import { ProtectedRoute } from "@/lib/guards/auth-guard";
import { OnboardingGuard } from "@/components/guards/onboarding-guard";
import { AdminGuard } from "@/components/guards/admin-guard";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Users,
  UserPlus,
  Search,
  MoreVertical,
  UserCheck,
  UserX,
  Shield,
  Mail,
  Calendar,
  Activity,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RoleManagement } from "@/components/admin/role-management";
import { AnalyticsDashboard } from "@/components/analytics/analytics-dashboard";

// Mock admin data (replace with real API calls)
const mockUsers = [
  {
    id: "1",
    email: "john.doe@example.com",
    first_name: "John",
    last_name: "Doe",
    username: "johndoe",
    avatar: null,
    is_active: true,
    is_email_verified: true,
    is_onboarding_completed: true,
    date_joined: "2024-01-15T10:30:00Z",
    last_login: "2024-01-20T14:22:00Z",
    role: "user",
    status: "active",
  },
  {
    id: "2",
    email: "jane.smith@example.com",
    first_name: "Jane",
    last_name: "Smith",
    username: "janesmith",
    avatar: null,
    is_active: true,
    is_email_verified: false,
    is_onboarding_completed: false,
    date_joined: "2024-01-20T09:15:00Z",
    last_login: null,
    role: "user",
    status: "pending",
  },
  {
    id: "3",
    email: "admin@meggyai.com",
    first_name: "Admin",
    last_name: "User",
    username: "admin",
    avatar: null,
    is_active: true,
    is_email_verified: true,
    is_onboarding_completed: true,
    date_joined: "2024-01-01T00:00:00Z",
    last_login: "2024-01-20T16:45:00Z",
    role: "admin",
    status: "active",
  },
];

type AdminUser = (typeof mockUsers)[0] & {
  role: "admin" | "user" | "moderator";
  status: "active" | "inactive" | "pending" | "suspended";
};

export default function AdminPage() {
  const [users, setUsers] = useState<AdminUser[]>(mockUsers as AdminUser[]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterRole, setFilterRole] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.username.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesRole = filterRole === "all" || user.role === filterRole;
    const matchesStatus = filterStatus === "all" || user.status === filterStatus;

    return matchesSearch && matchesRole && matchesStatus;
  });

  const handleUserAction = (userId: string, action: string) => {
    setUsers((prevUsers) =>
      prevUsers.map((user) => {
        if (user.id === userId) {
          switch (action) {
            case "activate":
              return { ...user, status: "active" as const, is_active: true };
            case "deactivate":
              return { ...user, status: "inactive" as const, is_active: false };
            case "suspend":
              return { ...user, status: "suspended" as const, is_active: false };
            case "verify":
              return { ...user, is_email_verified: true };
            case "makeAdmin":
              return { ...user, role: "admin" as const };
            case "makeUser":
              return { ...user, role: "user" as const };
            default:
              return user;
          }
        }
        return user;
      })
    );
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "Never";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getUserInitials = (user: AdminUser) => {
    return `${user.first_name?.[0] || ""}${user.last_name?.[0] || ""}`.toUpperCase();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800 hover:bg-green-200";
      case "inactive":
        return "bg-gray-100 text-gray-800 hover:bg-gray-200";
      case "pending":
        return "bg-yellow-100 text-yellow-800 hover:bg-yellow-200";
      case "suspended":
        return "bg-red-100 text-red-800 hover:bg-red-200";
      default:
        return "bg-gray-100 text-gray-800 hover:bg-gray-200";
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case "admin":
        return "bg-purple-100 text-purple-800 hover:bg-purple-200";
      case "moderator":
        return "bg-blue-100 text-blue-800 hover:bg-blue-200";
      case "user":
        return "bg-gray-100 text-gray-800 hover:bg-gray-200";
      default:
        return "bg-gray-100 text-gray-800 hover:bg-gray-200";
    }
  };

  const stats = {
    total: users.length,
    active: users.filter((u) => u.status === "active").length,
    pending: users.filter((u) => u.status === "pending").length,
    admins: users.filter((u) => u.role === "admin").length,
  };

  return (
    <ProtectedRoute>
      <OnboardingGuard>
        <AdminGuard>
          <DashboardLayout>
            <div className="space-y-6">
              {/* Header */}
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-3xl font-bold tracking-tight">User Management</h1>
                  <p className="text-muted-foreground">
                    Manage users, roles, and permissions across your platform.
                  </p>
                </div>
                <Button>
                  <UserPlus className="mr-2 h-4 w-4" />
                  Add User
                </Button>
              </div>

              {/* Stats Cards */}
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                    <Users className="text-muted-foreground h-4 w-4" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stats.total}</div>
                    <p className="text-muted-foreground text-xs">All registered users</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Active Users</CardTitle>
                    <UserCheck className="text-muted-foreground h-4 w-4" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stats.active}</div>
                    <p className="text-muted-foreground text-xs">Currently active</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Pending Users</CardTitle>
                    <UserX className="text-muted-foreground h-4 w-4" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stats.pending}</div>
                    <p className="text-muted-foreground text-xs">Awaiting verification</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Administrators</CardTitle>
                    <Shield className="text-muted-foreground h-4 w-4" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stats.admins}</div>
                    <p className="text-muted-foreground text-xs">Admin users</p>
                  </CardContent>
                </Card>
              </div>

              {/* Admin Tabs */}
              <Tabs defaultValue="users" className="space-y-6">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="users" className="flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    User Management
                  </TabsTrigger>
                  <TabsTrigger value="roles" className="flex items-center gap-2">
                    <Shield className="h-4 w-4" />
                    Roles & Permissions
                  </TabsTrigger>
                  <TabsTrigger value="analytics" className="flex items-center gap-2">
                    <Activity className="h-4 w-4" />
                    Analytics
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="users" className="space-y-6">
                  {/* Filters and Search */}
                  <Card>
                    <CardHeader>
                      <CardTitle>User Directory</CardTitle>
                      <CardDescription>
                        Search and filter users by role, status, or name
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="mb-6 flex flex-col gap-4 md:flex-row">
                        <div className="flex-1">
                          <Label htmlFor="search">Search Users</Label>
                          <div className="relative">
                            <Search className="text-muted-foreground absolute top-3 left-2 h-4 w-4" />
                            <Input
                              id="search"
                              placeholder="Search by name, email, or username..."
                              value={searchTerm}
                              onChange={(e) => setSearchTerm(e.target.value)}
                              className="pl-8"
                            />
                          </div>
                        </div>
                        <div>
                          <Label htmlFor="role-filter">Role</Label>
                          <select
                            id="role-filter"
                            className="border-input bg-background ring-offset-background focus-visible:ring-ring flex h-10 w-full rounded-md border px-3 py-2 text-sm focus-visible:ring-2 focus-visible:outline-none"
                            value={filterRole}
                            onChange={(e) => setFilterRole(e.target.value)}
                          >
                            <option value="all">All Roles</option>
                            <option value="admin">Admin</option>
                            <option value="moderator">Moderator</option>
                            <option value="user">User</option>
                          </select>
                        </div>
                        <div>
                          <Label htmlFor="status-filter">Status</Label>
                          <select
                            id="status-filter"
                            className="border-input bg-background ring-offset-background focus-visible:ring-ring flex h-10 w-full rounded-md border px-3 py-2 text-sm focus-visible:ring-2 focus-visible:outline-none"
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value)}
                          >
                            <option value="all">All Statuses</option>
                            <option value="active">Active</option>
                            <option value="inactive">Inactive</option>
                            <option value="pending">Pending</option>
                            <option value="suspended">Suspended</option>
                          </select>
                        </div>
                      </div>

                      {/* Users Table */}
                      <div className="rounded-md border">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>User</TableHead>
                              <TableHead>Role</TableHead>
                              <TableHead>Status</TableHead>
                              <TableHead>Joined</TableHead>
                              <TableHead>Last Login</TableHead>
                              <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {filteredUsers.map((user) => (
                              <TableRow key={user.id}>
                                <TableCell className="font-medium">
                                  <div className="flex items-center space-x-3">
                                    <Avatar className="h-10 w-10">
                                      <AvatarImage src={user.avatar || undefined} />
                                      <AvatarFallback>{getUserInitials(user)}</AvatarFallback>
                                    </Avatar>
                                    <div>
                                      <p className="font-medium">
                                        {user.first_name} {user.last_name}
                                      </p>
                                      <p className="text-muted-foreground text-sm">{user.email}</p>
                                      <div className="mt-1 flex items-center gap-2">
                                        {user.is_email_verified ? (
                                          <Badge variant="secondary" className="text-xs">
                                            <Mail className="mr-1 h-3 w-3" />
                                            Verified
                                          </Badge>
                                        ) : (
                                          <Badge variant="outline" className="text-xs">
                                            <Mail className="mr-1 h-3 w-3" />
                                            Unverified
                                          </Badge>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <Badge className={getRoleColor(user.role)}>{user.role}</Badge>
                                </TableCell>
                                <TableCell>
                                  <Badge className={getStatusColor(user.status)}>
                                    {user.status}
                                  </Badge>
                                </TableCell>
                                <TableCell>
                                  <div className="text-muted-foreground flex items-center text-sm">
                                    <Calendar className="mr-1 h-4 w-4" />
                                    {formatDate(user.date_joined)}
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <div className="text-muted-foreground flex items-center text-sm">
                                    <Activity className="mr-1 h-4 w-4" />
                                    {formatDate(user.last_login)}
                                  </div>
                                </TableCell>
                                <TableCell className="text-right">
                                  <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                      <Button variant="ghost" className="h-8 w-8 p-0">
                                        <MoreVertical className="h-4 w-4" />
                                      </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                      <DropdownMenuSeparator />

                                      {user.status !== "active" && (
                                        <DropdownMenuItem
                                          onClick={() => handleUserAction(user.id, "activate")}
                                        >
                                          <UserCheck className="mr-2 h-4 w-4" />
                                          Activate User
                                        </DropdownMenuItem>
                                      )}

                                      {user.status === "active" && (
                                        <DropdownMenuItem
                                          onClick={() => handleUserAction(user.id, "deactivate")}
                                        >
                                          <UserX className="mr-2 h-4 w-4" />
                                          Deactivate User
                                        </DropdownMenuItem>
                                      )}

                                      {!user.is_email_verified && (
                                        <DropdownMenuItem
                                          onClick={() => handleUserAction(user.id, "verify")}
                                        >
                                          <Mail className="mr-2 h-4 w-4" />
                                          Verify Email
                                        </DropdownMenuItem>
                                      )}

                                      <DropdownMenuSeparator />

                                      {user.role !== "admin" && (
                                        <DropdownMenuItem
                                          onClick={() => handleUserAction(user.id, "makeAdmin")}
                                        >
                                          <Shield className="mr-2 h-4 w-4" />
                                          Make Admin
                                        </DropdownMenuItem>
                                      )}

                                      {user.role === "admin" && (
                                        <DropdownMenuItem
                                          onClick={() => handleUserAction(user.id, "makeUser")}
                                        >
                                          <Users className="mr-2 h-4 w-4" />
                                          Remove Admin
                                        </DropdownMenuItem>
                                      )}

                                      <DropdownMenuSeparator />

                                      <DropdownMenuItem
                                        onClick={() => handleUserAction(user.id, "suspend")}
                                        className="text-destructive focus:text-destructive"
                                      >
                                        <UserX className="mr-2 h-4 w-4" />
                                        Suspend User
                                      </DropdownMenuItem>
                                    </DropdownMenuContent>
                                  </DropdownMenu>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>

                      {filteredUsers.length === 0 && (
                        <div className="text-muted-foreground py-8 text-center">
                          No users found matching your filters.
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="roles" className="space-y-6">
                  <RoleManagement />
                </TabsContent>

                <TabsContent value="analytics" className="space-y-6">
                  <AnalyticsDashboard />
                </TabsContent>
              </Tabs>
            </div>
          </DashboardLayout>
        </AdminGuard>
      </OnboardingGuard>
    </ProtectedRoute>
  );
}
