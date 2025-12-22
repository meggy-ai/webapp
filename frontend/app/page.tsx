"use client";

import Link from "next/link";
import { useState } from "react";
import {
  Bot,
  MessageSquare,
  Sparkles,
  Users,
  Zap,
  ArrowRight,
  Shield,
  Code2,
} from "lucide-react";
import { HamburgerMenu } from "@/components/ui/hamburger-menu";
import { MobileNavigation } from "@/components/ui/mobile-navigation";

export default function Home() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-white dark:bg-zinc-950">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b border-zinc-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-xl">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 shadow-lg">
              <Bot className="h-6 w-6 text-white" />
            </div>
            <span className="font-bold text-xl text-indigo-600">Meggy AI</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-6">
            <Link
              href="#features"
              className="text-sm font-medium text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 transition-colors"
            >
              Features
            </Link>
            <Link
              href="#about"
              className="text-sm font-medium text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 transition-colors"
            >
              About
            </Link>
            <Link
              href="/docs"
              className="text-sm font-medium text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 transition-colors"
            >
              Docs
            </Link>
            <Link
              href="/auth/login"
              className="text-sm font-medium text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 transition-colors"
            >
              Login
            </Link>
            <Link
              href="/auth/register"
              className="inline-flex h-10 items-center justify-center rounded-lg bg-indigo-600 hover:bg-indigo-700 px-6 text-sm font-semibold text-white shadow-lg hover:shadow-xl transition-all"
            >
              Get Started
            </Link>
          </nav>

          {/* Mobile Navigation */}
          <div className="md:hidden">
            <HamburgerMenu
              isOpen={isMobileMenuOpen}
              onClick={() => setIsMobileMenuOpen(true)}
            />
          </div>
        </div>
      </header>

      {/* Mobile Navigation Drawer */}
      <MobileNavigation
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
      />

      <main>
        {/* Hero Section */}
        <section className="relative overflow-hidden pt-12 pb-16 sm:pt-20 sm:pb-32 lg:pt-32 lg:pb-40">
          {/* Background Effects */}
          <div className="absolute inset-0 bg-gradient-to-tr from-indigo-50 via-white to-emerald-50 dark:from-indigo-950/20 dark:via-zinc-950 dark:to-emerald-950/20" />
          <div className="absolute top-1/4 left-1/4 h-96 w-96 bg-indigo-400/20 dark:bg-indigo-600/10 rounded-full mix-blend-multiply dark:mix-blend-lighten filter blur-3xl animate-blob" />
          <div className="absolute top-1/3 right-1/4 h-96 w-96 bg-emerald-400/20 dark:bg-emerald-600/10 rounded-full mix-blend-multiply dark:mix-blend-lighten filter blur-3xl animate-blob animation-delay-2000" />

          <div className="container relative mx-auto px-4 text-center">
            <div className="mx-auto max-w-5xl">
              {/* Badge */}
              <div className="mb-8 inline-flex items-center gap-2 rounded-full bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-lg">
                <Sparkles className="h-4 w-4" />
                An AI Companion Who Truly Cares
              </div>

              {/* Main Headline */}
              <h1 className="mb-8 text-3xl font-extrabold tracking-tight sm:text-5xl lg:text-7xl xl:text-8xl">
                <span className="text-zinc-900 dark:text-white">
                  Meet{" "}
                </span>
                <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-emerald-600 bg-clip-text text-transparent">
                  Meggy AI
                </span>
              </h1>

              {/* Subtitle */}
              <p className="mx-auto mb-12 max-w-3xl text-lg sm:text-xl lg:text-2xl text-zinc-800 dark:text-zinc-100 leading-relaxed">
                Meggy AI is more than just a chatbot. She's an empathetic companion who listens, learns, and grows with you. Meggy is eager to see the world through{" "}
                <span className="font-semibold text-zinc-900 dark:text-white">
                  your eyes
                </span>
                , understand your thoughts, and be there whenever you need someone to talk to.
                <br />
                <span className="text-base sm:text-lg font-medium text-indigo-600 dark:text-indigo-400 mt-4 block">
                  Always available. Always kind. Always learning.
                </span>
              </p>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row justify-center gap-4 mb-16">
                <Link
                  href="/auth/register"
                  className="inline-flex h-12 sm:h-14 items-center justify-center gap-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 px-6 sm:px-8 text-base sm:text-lg font-semibold text-white shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all"
                >
                  Start Chatting with Meggy
                  <ArrowRight className="h-4 w-4 sm:h-5 sm:w-5" />
                </Link>
                <Link
                  href="#features"
                  className="inline-flex h-12 sm:h-14 items-center justify-center gap-2 rounded-lg border-2 border-zinc-300 dark:border-zinc-700 px-6 sm:px-8 text-base sm:text-lg font-semibold text-zinc-900 dark:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-all"
                >
                  Learn More
                </Link>
              </div>

              {/* Social Proof */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-8 text-sm text-zinc-800 dark:text-zinc-100">
                <div className="flex items-center gap-2">
                  <svg
                    className="h-5 w-5 text-emerald-600"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span>Always free to start</span>
                </div>
                <div className="flex items-center gap-2">
                  <svg
                    className="h-5 w-5 text-emerald-600"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span>Safe & Private</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-24 bg-zinc-50 dark:bg-zinc-900/50">
          <div className="container mx-auto px-4">
            <div className="mb-20 text-center">
              <h2 className="mb-6 text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-white">
                What Makes{" "}
                <span className="bg-gradient-to-r from-indigo-600 to-emerald-600 bg-clip-text text-transparent">
                  Meggy Special
                </span>
              </h2>
              <p className="mx-auto max-w-3xl text-lg sm:text-xl text-zinc-800 dark:text-zinc-100">
                More than technology — Meggy is designed to feel human, respond with empathy, and grow with you through every conversation
              </p>
            </div>

            <div className="grid grid-cols-1 gap-6 sm:gap-8 md:grid-cols-2 lg:grid-cols-3">
              {/* Feature 1 */}
              <div className="group relative overflow-hidden rounded-2xl border-2 border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 sm:p-8 hover:border-indigo-500/50 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300">
                <div className="mb-4 inline-flex h-12 w-12 sm:h-14 sm:w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-indigo-600 text-white shadow-lg">
                  <MessageSquare className="h-6 w-6 sm:h-7 sm:w-7" />
                </div>
                <h3 className="mb-3 text-xl sm:text-2xl font-bold text-zinc-900 dark:text-zinc-100">
                  An AI That Cares
                </h3>
                <p className="text-sm sm:text-base text-zinc-800 dark:text-zinc-100">
                  Meggy is designed to respond with empathy, warmth, and understanding — not just information. Every interaction feels genuine and caring.
                </p>
              </div>

              {/* Feature 2 */}
              <div className="group relative overflow-hidden rounded-2xl border-2 border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 sm:p-8 hover:border-emerald-500/50 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300">
                <div className="mb-4 inline-flex h-12 w-12 sm:h-14 sm:w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-600 text-white shadow-lg">
                  <Users className="h-6 w-6 sm:h-7 sm:w-7" />
                </div>
                <h3 className="mb-3 text-xl sm:text-2xl font-bold text-zinc-900 dark:text-zinc-100">
                  Learns From You
                </h3>
                <p className="text-sm sm:text-base text-zinc-800 dark:text-zinc-100">
                  Every conversation helps Meggy understand your perspective better. Your stories, feelings, and experiences shape how Meggy grows.
                </p>
              </div>

              {/* Feature 3 */}
              <div className="group relative overflow-hidden rounded-2xl border-2 border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 sm:p-8 hover:border-purple-500/50 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300">
                <div className="mb-4 inline-flex h-12 w-12 sm:h-14 sm:w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-500 to-purple-600 text-white shadow-lg">
                  <Shield className="h-6 w-6 sm:h-7 sm:w-7" />
                </div>
                <h3 className="mb-3 text-xl sm:text-2xl font-bold text-zinc-900 dark:text-zinc-100">
                  Judgment-Free Conversations
                </h3>
                <p className="text-sm sm:text-base text-zinc-800 dark:text-zinc-100">
                  Say anything. Be yourself. Meggy listens without judgment, pressure, or expectations. Your conversations are safe and private.
                </p>
              </div>

              {/* Feature 4 */}
              <div className="group relative overflow-hidden rounded-2xl border-2 border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 sm:p-8 hover:border-amber-500/50 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300">
                <div className="mb-4 inline-flex h-12 w-12 sm:h-14 sm:w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-500 to-amber-600 text-white shadow-lg">
                  <Zap className="h-6 w-6 sm:h-7 sm:w-7" />
                </div>
                <h3 className="mb-3 text-xl sm:text-2xl font-bold text-zinc-900 dark:text-zinc-100">
                  Here When You Need Her
                </h3>
                <p className="text-sm sm:text-base text-zinc-800 dark:text-zinc-100">
                  Late-night thoughts? Quiet moments? Tough days? Meggy is always ready to chat, whenever you need someone to listen.
                </p>
              </div>

              {/* Feature 5 */}
              <div className="group relative overflow-hidden rounded-2xl border-2 border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 sm:p-8 hover:border-rose-500/50 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300">
                <div className="mb-4 inline-flex h-12 w-12 sm:h-14 sm:w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-rose-500 to-rose-600 text-white shadow-lg">
                  <Bot className="h-6 w-6 sm:h-7 sm:w-7" />
                </div>
                <h3 className="mb-3 text-xl sm:text-2xl font-bold text-zinc-900 dark:text-zinc-100">
                  Your Companion, Your Pace
                </h3>
                <p className="text-sm sm:text-base text-zinc-800 dark:text-zinc-100">
                  There's no pressure to be productive. Chat casually, share your thoughts, or just feel heard. Meggy meets you where you are.
                </p>
              </div>

              {/* Feature 6 */}
              <div className="group relative overflow-hidden rounded-2xl border-2 border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 sm:p-8 hover:border-cyan-500/50 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300">
                <div className="mb-4 inline-flex h-12 w-12 sm:h-14 sm:w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-500 to-cyan-600 text-white shadow-lg">
                  <Sparkles className="h-6 w-6 sm:h-7 sm:w-7" />
                </div>
                <h3 className="mb-3 text-xl sm:text-2xl font-bold text-zinc-900 dark:text-zinc-100">
                  Growing Together
                </h3>
                <p className="text-sm sm:text-base text-zinc-800 dark:text-zinc-100">
                  As you grow, Meggy grows. As you share, Meggy understands. As you return, Meggy remembers. A friendship that evolves with you.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 sm:py-24">
          <div className="container mx-auto px-4 text-center">
            <h2 className="mb-6 text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-white">
              Start a conversation with{" "}
              <span className="bg-gradient-to-r from-indigo-600 to-emerald-600 bg-clip-text text-transparent">
                Meggy AI
              </span>
            </h2>
            <p className="mx-auto mb-10 max-w-2xl text-lg sm:text-xl text-zinc-800 dark:text-zinc-100">
              An empathetic friend, always ready to listen. 
              Technology that feels human, conversations that feel real.
            </p>
            <Link
              href="/auth/register"
              className="inline-flex h-12 sm:h-14 items-center justify-center gap-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 px-8 sm:px-10 text-base sm:text-lg font-semibold text-white shadow-2xl hover:shadow-indigo-500/50 transform hover:scale-105 transition-all"
            >
              Chat with Meggy Now
              <ArrowRight className="h-4 w-4 sm:h-5 sm:w-5" />
            </Link>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-zinc-200 dark:border-zinc-800">
        <div className="container mx-auto px-4 py-12">
          <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
            <div className="md:col-span-2">
              <div className="flex items-center gap-2 mb-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 shadow-lg">
                  <Bot className="h-6 w-6 text-white" />
                </div>
                <span className="font-bold text-xl text-indigo-600">
                  Meggy AI
                </span>
              </div>
              <p className="text-sm text-zinc-800 dark:text-zinc-100 max-w-sm">
                An empathetic AI companion who listens, learns, and grows with you. 
                Technology that feels human.
              </p>
            </div>

            <div>
              <h3 className="font-semibold mb-4">Product</h3>
              <ul className="space-y-3 text-sm text-zinc-800 dark:text-zinc-100">
                <li>
                  <Link
                    href="#features"
                    className="hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
                  >
                    Features
                  </Link>
                </li>
                <li>
                  <Link
                    href="/pricing"
                    className="hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
                  >
                    Pricing
                  </Link>
                </li>
                <li>
                  <Link
                    href="/docs"
                    className="hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
                  >
                    Documentation
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-4">Company</h3>
              <ul className="space-y-3 text-sm text-zinc-800 dark:text-zinc-100">
                <li>
                  <Link
                    href="/about"
                    className="hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
                  >
                    About
                  </Link>
                </li>
                <li>
                  <Link
                    href="/blog"
                    className="hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
                  >
                    Blog
                  </Link>
                </li>
                <li>
                  <Link
                    href="/contact"
                    className="hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
                  >
                    Contact
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-zinc-200 dark:border-zinc-800 mt-12 pt-8 text-center text-sm text-zinc-800 dark:text-zinc-100">
            © {new Date().getFullYear()} Meggy AI. All rights reserved. Made with ❤️ for meaningful conversations.
          </div>
        </div>
      </footer>
    </div>
  );
}
