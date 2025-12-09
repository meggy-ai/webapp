import { LoginForm } from "@/components/auth/login-form";
import { AuthGuard } from "@/lib/guards/auth-guard";

export default function LoginPage() {
  return (
    <AuthGuard requireAuth={false} redirectTo="/dashboard">
      <div className="bg-background flex min-h-screen items-center justify-center px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold tracking-tight">Welcome Back</h1>
            <p className="text-muted-foreground mt-2">Sign in to your Meggy AI account</p>
          </div>
          <LoginForm />
        </div>
      </div>
    </AuthGuard>
  );
}
