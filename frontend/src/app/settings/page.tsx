import { ProtectedRoute } from '@/lib/guards/auth-guard'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { SettingsForm } from '@/components/settings/settings-form'

export default function SettingsPage() {
  return (
    <ProtectedRoute>
      <DashboardLayout>
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
            <p className="text-muted-foreground">
              Manage your application settings and preferences
            </p>
          </div>
          <SettingsForm />
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  )
}