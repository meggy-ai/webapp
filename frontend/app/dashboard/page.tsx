"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Bot, MessageSquare, Users, Settings, LogOut } from "lucide-react";

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem("access_token");
    const userData = localStorage.getItem("user");

    if (!token || !userData) {
      router.push("/auth/login");
      return;
    }

    setUser(JSON.parse(userData));
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("user");
    router.push("/auth/login");
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-white dark:bg-zinc-950 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-zinc-950">
      {/* Header */}
      <header className="border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <Link href="/dashboard" className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 shadow-lg">
              <Bot className="h-6 w-6 text-white" />
            </div>
            <span className="font-bold text-xl text-indigo-600">Meggy AI</span>
          </Link>

          <div className="flex items-center gap-4">
            <span className="text-sm text-zinc-700 dark:text-zinc-300 hidden sm:block">
              {user.email}
            </span>
            <button
              onClick={handleLogout}
              className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border-2 border-zinc-200 dark:border-zinc-700 px-3 sm:px-4 text-sm font-medium text-zinc-900 dark:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-all"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 sm:py-12">
        <div className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-zinc-900 dark:text-white mb-2">
            Hello, {user.username || user.email.split("@")[0]}! 👋
          </h1>
          <p className="text-lg sm:text-xl text-zinc-700 dark:text-zinc-300">
            Meggy is excited to see you again. Ready for a meaningful conversation?
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:gap-6 md:grid-cols-2 lg:grid-cols-3">
          {/* Chat with Meggy Card */}
          <Link
            href="/chat"
            className="group relative overflow-hidden rounded-2xl border-2 border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 sm:p-8 hover:border-indigo-500/50 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300"
          >
            <div className="mb-4 inline-flex h-12 w-12 sm:h-14 sm:w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-indigo-600 text-white shadow-lg">
              <MessageSquare className="h-6 w-6 sm:h-7 sm:w-7" />
            </div>
            <h3 className="mb-3 text-xl sm:text-2xl font-bold text-zinc-900 dark:text-zinc-100">
              Chat with Meggy
            </h3>
            <p className="text-sm sm:text-base text-zinc-700 dark:text-zinc-300">
              Start a conversation with your empathetic AI companion
            </p>
          </Link>

          {/* Conversation History Card */}
          <Link
            href="/conversations"
            className="group relative overflow-hidden rounded-2xl border-2 border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 sm:p-8 hover:border-emerald-500/50 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300"
          >
            <div className="mb-4 inline-flex h-12 w-12 sm:h-14 sm:w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-600 text-white shadow-lg">
              <Bot className="h-6 w-6 sm:h-7 sm:w-7" />
            </div>
            <h3 className="mb-3 text-xl sm:text-2xl font-bold text-zinc-900 dark:text-zinc-100">
              Your Journey
            </h3>
            <p className="text-sm sm:text-base text-zinc-700 dark:text-zinc-300">
              View your conversation history and memories with Meggy
            </p>
          </Link>

          {/* Settings Card */}
          <Link
            href="/settings"
            className="group relative overflow-hidden rounded-2xl border-2 border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 sm:p-8 hover:border-purple-500/50 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300"
          >
            <div className="mb-4 inline-flex h-12 w-12 sm:h-14 sm:w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-500 to-purple-600 text-white shadow-lg">
              <Settings className="h-6 w-6 sm:h-7 sm:w-7" />
            </div>
            <h3 className="mb-3 text-xl sm:text-2xl font-bold text-zinc-900 dark:text-zinc-100">
              Preferences
            </h3>
            <p className="text-sm sm:text-base text-zinc-700 dark:text-zinc-300">
              Customize how Meggy interacts with you
            </p>
          </Link>
        </div>

        {/* Your Journey with Meggy */}
        <div className="mt-12">
          <h2 className="text-2xl sm:text-3xl font-bold text-zinc-900 dark:text-white mb-6">
            Your Journey with Meggy 🌱
          </h2>
          <div className="grid grid-cols-1 gap-4 sm:gap-6 md:grid-cols-3">
            <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-4 sm:p-6">
              <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                Conversations Started
              </p>
              <p className="text-2xl sm:text-3xl font-bold text-zinc-900 dark:text-white">
                0
              </p>
            </div>
            <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-4 sm:p-6">
              <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                Messages Shared
              </p>
              <p className="text-2xl sm:text-3xl font-bold text-zinc-900 dark:text-white">
                0
              </p>
            </div>
            <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-4 sm:p-6">
              <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                Days Connected
              </p>
              <p className="text-2xl sm:text-3xl font-bold text-zinc-900 dark:text-white">
                1
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
