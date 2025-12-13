"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Bot, Mail, Lock, User, ArrowRight, AlertCircle } from "lucide-react";
import { authAPI } from "@/lib/api";

export default function RegisterPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords don't match!");
      return;
    }

    setIsLoading(true);

    try {
      const response = await authAPI.register({
        name: formData.name,
        email: formData.email,
        password: formData.password,
      });

      // Store tokens and user data
      localStorage.setItem("access_token", response.access_token);
      localStorage.setItem("refresh_token", response.refresh_token);
      localStorage.setItem("user", JSON.stringify(response.user));

      // Redirect to dashboard
      router.push("/dashboard");
    } catch (err: any) {
      console.error("Registration error:", err);
      setError(
        err.response?.data?.error ||
          err.response?.data?.message ||
          err.response?.data?.email?.[0] ||
          err.response?.data?.username?.[0] ||
          "Failed to create account. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  return (
    <div className="min-h-screen bg-white dark:bg-zinc-950 flex flex-col">
      {/* Header */}
      <header className="border-b border-zinc-200 dark:border-zinc-800">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 shadow-lg">
              <Bot className="h-6 w-6 text-white" />
            </div>
            <span className="font-bold text-xl text-indigo-600">Meggy AI</span>
          </Link>

          <div className="flex items-center gap-4">
            <span className="text-sm text-zinc-600 dark:text-zinc-400">
              Already have an account?
            </span>
            <Link
              href="/auth/login"
              className="text-sm font-medium text-indigo-600 hover:text-indigo-700 transition-colors"
            >
              Sign in
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-2 text-zinc-900 dark:text-white">
              Create your account
            </h1>
            <p className="text-zinc-600 dark:text-zinc-400">
              Get started with Meggy AI for free
            </p>
          </div>

          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-8 shadow-lg">
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Error Message */}
              {error && (
                <div className="flex items-start gap-3 p-4 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
                  <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-red-800 dark:text-red-200">
                    {error}
                  </p>
                </div>
              )}

              {/* Name Field */}
              <div>
                <label
                  htmlFor="name"
                  className="block text-sm font-medium mb-2 text-zinc-900 dark:text-zinc-100"
                >
                  Full name
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-400" />
                  <input
                    id="name"
                    name="name"
                    type="text"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-3 border border-zinc-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-transparent transition-all"
                    placeholder="John Doe"
                    required
                  />
                </div>
              </div>

              {/* Email Field */}
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium mb-2 text-zinc-900 dark:text-zinc-100"
                >
                  Email address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-400" />
                  <input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-3 border border-zinc-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-transparent transition-all"
                    placeholder="you@example.com"
                    required
                  />
                </div>
              </div>

              {/* Password Field */}
              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-medium mb-2 text-zinc-900 dark:text-zinc-100"
                >
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-400" />
                  <input
                    id="password"
                    name="password"
                    type="password"
                    value={formData.password}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-3 border border-zinc-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-transparent transition-all"
                    placeholder="••••••••"
                    required
                    minLength={8}
                  />
                </div>
                <p className="mt-1 text-xs text-zinc-500">
                  Must be at least 8 characters
                </p>
              </div>

              {/* Confirm Password Field */}
              <div>
                <label
                  htmlFor="confirmPassword"
                  className="block text-sm font-medium mb-2 text-zinc-900 dark:text-zinc-100"
                >
                  Confirm password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-400" />
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-3 border border-zinc-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-transparent transition-all"
                    placeholder="••••••••"
                    required
                  />
                </div>
              </div>

              {/* Terms */}
              <div className="flex items-start gap-2">
                <input
                  id="terms"
                  type="checkbox"
                  className="mt-1 rounded border-zinc-300 dark:border-zinc-700"
                  required
                />
                <label
                  htmlFor="terms"
                  className="text-sm text-zinc-600 dark:text-zinc-400"
                >
                  I agree to the{" "}
                  <Link
                    href="/terms"
                    className="font-medium text-indigo-600 hover:text-indigo-700"
                  >
                    Terms of Service
                  </Link>{" "}
                  and{" "}
                  <Link
                    href="/privacy"
                    className="font-medium text-indigo-600 hover:text-indigo-700"
                  >
                    Privacy Policy
                  </Link>
                </label>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full inline-flex items-center justify-center gap-2 h-12 rounded-lg bg-indigo-600 hover:bg-indigo-700 px-6 text-sm font-semibold text-white shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  "Creating account..."
                ) : (
                  <>
                    Create account
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>
            </form>

            {/* Divider */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-zinc-200 dark:border-zinc-800"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white dark:bg-zinc-900 text-zinc-500">
                  Or sign up with
                </span>
              </div>
            </div>

            {/* Social Login */}
            <div className="grid grid-cols-2 gap-4">
              <button className="flex items-center justify-center gap-2 h-11 rounded-lg bg-white dark:bg-zinc-800 border-2 border-zinc-200 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-700 text-zinc-900 dark:text-zinc-100 transition-all">
                <svg className="h-5 w-5" viewBox="0 0 24 24">
                  <path
                    fill="currentColor"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="currentColor"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                <span className="text-sm font-medium">Google</span>
              </button>
              <button className="flex items-center justify-center gap-2 h-11 rounded-lg bg-white dark:bg-zinc-800 border-2 border-zinc-200 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-700 text-zinc-900 dark:text-zinc-100 transition-all">
                <svg
                  className="h-5 w-5"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.17 6.839 9.49.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.463-1.11-1.463-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0112 6.836c.85.004 1.705.114 2.504.336 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.167 22 16.418 22 12c0-5.523-4.477-10-10-10z" />
                </svg>
                <span className="text-sm font-medium">GitHub</span>
              </button>
            </div>
          </div>

          {/* Sign in link */}
          <p className="mt-6 text-center text-sm text-zinc-600 dark:text-zinc-400">
            Already have an account?{" "}
            <Link
              href="/auth/login"
              className="font-medium text-indigo-600 hover:text-indigo-700 transition-colors"
            >
              Sign in instead
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
}
