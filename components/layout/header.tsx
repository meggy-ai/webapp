"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/shared/theme-toggle";
import { UserNav } from "./user-nav";
import { Bot, Menu, X } from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/lib/stores/auth-store";

const publicNavigation = [
  { name: "Features", href: "#features" },
  { name: "About", href: "#about" },
  { name: "Pricing", href: "#pricing" },
  { name: "Contact", href: "#contact" },
];

const dashboardNavigation = [
  { name: "Dashboard", href: "/dashboard" },
  { name: "Profile", href: "/profile" },
  { name: "Settings", href: "/settings" },
];

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { isAuthenticated } = useAuth();

  const navigation = isAuthenticated ? dashboardNavigation : publicNavigation;

  return (
    <header className="border-border/40 bg-background/95 supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50 w-full border-b backdrop-blur">
      <div className="container flex h-14 max-w-screen-2xl items-center">
        <div className="mr-4 flex">
          <Link
            className="mr-6 flex items-center space-x-2"
            href={isAuthenticated ? "/dashboard" : "/"}
          >
            <Bot className="h-6 w-6" />
            <span className="hidden font-bold sm:inline-block">Meggy AI</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden items-center gap-4 text-sm md:flex lg:gap-6">
            {navigation.map((item) => (
              <Link
                key={item.name}
                className="hover:text-foreground/80 text-foreground/60 transition-colors"
                href={item.href}
              >
                {item.name}
              </Link>
            ))}
          </nav>
        </div>

        {/* Mobile menu button */}
        <div className="flex md:hidden">
          <button
            type="button"
            className="text-foreground -m-2.5 inline-flex items-center justify-center rounded-md p-2.5"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            <span className="sr-only">Open main menu</span>
            {mobileMenuOpen ? (
              <X className="h-6 w-6" aria-hidden="true" />
            ) : (
              <Menu className="h-6 w-6" aria-hidden="true" />
            )}
          </button>
        </div>

        <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
          <div className="w-full flex-1 md:w-auto md:flex-none">
            {/* Search will go here later */}
          </div>
          <nav className="hidden items-center gap-2 md:flex">
            <ThemeToggle />
            {isAuthenticated ? (
              <UserNav />
            ) : (
              <>
                <Button variant="ghost" asChild>
                  <Link href="/auth/login">Log in</Link>
                </Button>
                <Button asChild>
                  <Link href="/auth/register">Sign up</Link>
                </Button>
              </>
            )}
          </nav>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="md:hidden">
          <div className="bg-background sm:ring-border fixed inset-y-0 right-0 z-50 w-full overflow-y-auto px-6 py-6 sm:max-w-sm sm:ring-1">
            <div className="flex items-center justify-between">
              <Link href={isAuthenticated ? "/dashboard" : "/"} className="-m-1.5 p-1.5">
                <Bot className="h-6 w-6" />
                <span className="ml-2 font-bold">Meggy AI</span>
              </Link>
              <button
                type="button"
                className="text-foreground -m-2.5 rounded-md p-2.5"
                onClick={() => setMobileMenuOpen(false)}
              >
                <span className="sr-only">Close menu</span>
                <X className="h-6 w-6" aria-hidden="true" />
              </button>
            </div>
            <div className="mt-6 flow-root">
              <div className="divide-border -my-6 divide-y">
                <div className="space-y-2 py-6">
                  {navigation.map((item) => (
                    <Link
                      key={item.name}
                      href={item.href}
                      className="text-foreground hover:bg-muted -mx-3 block rounded-lg px-3 py-2 text-base leading-7 font-semibold"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      {item.name}
                    </Link>
                  ))}
                </div>
                <div className="space-y-4 py-6">
                  <ThemeToggle />
                  {isAuthenticated ? (
                    <div className="px-3">
                      <UserNav />
                    </div>
                  ) : (
                    <>
                      <Button variant="ghost" className="w-full justify-start" asChild>
                        <Link href="/auth/login" onClick={() => setMobileMenuOpen(false)}>
                          Log in
                        </Link>
                      </Button>
                      <Button className="w-full" asChild>
                        <Link href="/auth/register" onClick={() => setMobileMenuOpen(false)}>
                          Sign up
                        </Link>
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
