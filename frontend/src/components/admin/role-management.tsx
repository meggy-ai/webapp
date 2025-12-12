"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  ROLE_LABELS,
  ROLE_DESCRIPTIONS,
  PERMISSION_GROUPS,
  PERMISSION_LABELS,
  UserRole,
  Permission,
  getPermissions,
} from "@/lib/permissions";
import { usePermissions } from "@/lib/hooks/use-permissions";
import { Shield, Users, Eye } from "lucide-react";

interface RoleManagementProps {
  selectedRole?: UserRole;
  onRoleChange?: (role: UserRole) => void;
}

export function RoleManagement({ selectedRole = "user", onRoleChange }: RoleManagementProps) {
  const { canManageRole, getUserRole } = usePermissions();
  const currentUserRole = getUserRole();

  const [viewingRole, setViewingRole] = useState<UserRole>(selectedRole);
  const rolePermissions = getPermissions(viewingRole);

  const availableRoles = (["user", "moderator", "admin"] as UserRole[]).filter(
    (role) => canManageRole(role) || role === currentUserRole
  );

  return (
    <div className="space-y-6">
      {/* Role Selector */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Role Management
          </CardTitle>
          <CardDescription>Manage user roles and view their permissions</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Select Role to View</Label>
            <Select value={viewingRole} onValueChange={(value: UserRole) => setViewingRole(value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {availableRoles.map((role) => (
                  <SelectItem key={role} value={role}>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">{ROLE_LABELS[role]}</Badge>
                      <span className="text-muted-foreground text-sm">
                        {ROLE_DESCRIPTIONS[role]}
                      </span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {onRoleChange && canManageRole(selectedRole) && (
            <div className="space-y-2">
              <Label>Change User Role</Label>
              <Select value={selectedRole} onValueChange={onRoleChange}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {availableRoles.map((role) => (
                    <SelectItem key={role} value={role}>
                      {ROLE_LABELS[role]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Role Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5" />
            {ROLE_LABELS[viewingRole]} Permissions
          </CardTitle>
          <CardDescription>
            {ROLE_DESCRIPTIONS[viewingRole]} • {rolePermissions.length} permissions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {Object.entries(PERMISSION_GROUPS).map(([groupName, groupPermissions]) => {
              const roleHasGroupPermissions = groupPermissions.filter((permission) =>
                rolePermissions.includes(permission as Permission)
              );

              if (roleHasGroupPermissions.length === 0) return null;

              return (
                <div key={groupName} className="space-y-3">
                  <div className="flex items-center gap-2">
                    <h4 className="font-medium">{groupName}</h4>
                    <Badge variant="secondary" className="text-xs">
                      {roleHasGroupPermissions.length}/{groupPermissions.length}
                    </Badge>
                  </div>
                  <div className="grid gap-2">
                    {groupPermissions.map((permission) => {
                      const hasPermission = rolePermissions.includes(permission as Permission);
                      return (
                        <div key={permission} className="flex items-center justify-between py-1">
                          <span
                            className={`text-sm ${hasPermission ? "text-foreground" : "text-muted-foreground"}`}
                          >
                            {PERMISSION_LABELS[permission as Permission]}
                          </span>
                          <Switch checked={hasPermission} disabled className="scale-75" />
                        </div>
                      );
                    })}
                  </div>
                  {groupName !==
                    Object.keys(PERMISSION_GROUPS)[Object.keys(PERMISSION_GROUPS).length - 1] && (
                    <Separator />
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Role Comparison */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Role Comparison
          </CardTitle>
          <CardDescription>Compare permissions across different roles</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {availableRoles.map((role) => {
              const permissions = getPermissions(role);
              return (
                <div key={role} className="flex items-center justify-between rounded-lg border p-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Badge variant={role === viewingRole ? "default" : "outline"}>
                        {ROLE_LABELS[role]}
                      </Badge>
                      {role === currentUserRole && (
                        <Badge variant="secondary" className="text-xs">
                          Your Role
                        </Badge>
                      )}
                    </div>
                    <p className="text-muted-foreground text-xs">
                      {permissions.length} permissions
                    </p>
                  </div>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm">
                        <Eye className="mr-1 h-3 w-3" />
                        View
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-h-[80vh] max-w-md overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle>{ROLE_LABELS[role]} Permissions</DialogTitle>
                        <DialogDescription>
                          Complete list of permissions for this role
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-2">
                        {permissions.map((permission) => (
                          <div
                            key={permission}
                            className="flex items-center justify-between py-1 text-sm"
                          >
                            <span>{PERMISSION_LABELS[permission]}</span>
                            <Badge variant="outline" className="text-xs">
                              ✓
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
