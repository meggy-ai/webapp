import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Mail, ArrowRight, RefreshCw } from "lucide-react";
import Link from "next/link";

export default function VerifyEmailPage() {
  return (
    <div className="bg-background flex min-h-screen items-center justify-center px-4 sm:px-6 lg:px-8">
      <Card className="mx-auto w-full max-w-md">
        <CardHeader className="text-center">
          <div className="bg-primary/10 mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full">
            <Mail className="text-primary h-8 w-8" />
          </div>
          <CardTitle className="text-2xl font-bold">Check Your Email</CardTitle>
          <CardDescription>
            We&apos;ve sent a verification link to your email address
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2 text-center">
            <p className="text-muted-foreground text-sm">
              Click the link in the email to verify your account. If you don&apos;t see it, check
              your spam folder.
            </p>
          </div>

          <div className="space-y-3">
            <Button variant="outline" className="w-full" asChild>
              <Link href="/auth/resend-verification">
                <RefreshCw className="mr-2 h-4 w-4" />
                Resend Verification Email
              </Link>
            </Button>

            <Button className="w-full" asChild>
              <Link href="/auth/login">
                <ArrowRight className="mr-2 h-4 w-4" />
                Back to Sign In
              </Link>
            </Button>
          </div>

          <div className="text-muted-foreground text-center text-sm">
            <p>
              Need help?{" "}
              <Link href="/support" className="text-primary hover:underline">
                Contact Support
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
