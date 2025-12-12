import { ProtectedRoute } from '@/lib/guards/auth-guard'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { ProfileForm } from '@/components/profile/profile-form'

export default function ProfilePage() {
  return (
    <ProtectedRoute>
      <DashboardLayout>
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Profile</h1>
            <p className="text-muted-foreground">
              Manage your account settings and preferences
            </p>
          </div>
          <ProfileForm />
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  )
}