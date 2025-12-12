import { RegisterForm } from "@/components/auth/register-form";
import { AuthGuard } from "@/lib/guards/auth-guard";

export default function RegisterPage() {
  return (
    <AuthGuard requireAuth={false} redirectTo="/dashboard">
      <div className="bg-background flex min-h-screen items-center justify-center px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold tracking-tight">Join Meggy AI</h1>
            <p className="text-muted-foreground mt-2">
              Create your account and start building with AI
            </p>
          </div>
          <RegisterForm />
        </div>
      </div>
    </AuthGuard>
  );
}
