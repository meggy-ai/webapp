"use client";

import { cn } from "@/lib/utils";

interface HamburgerMenuProps {
  isOpen: boolean;
  onClick: () => void;
  className?: string;
}

export function HamburgerMenu({ isOpen, onClick, className }: HamburgerMenuProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "relative flex h-11 w-11 items-center justify-center rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors",
        "focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-zinc-950",
        className
      )}
      aria-label={isOpen ? "Close menu" : "Open menu"}
      aria-expanded={isOpen}
      aria-controls="mobile-menu"
    >
      <div className="flex flex-col items-center justify-center w-5 h-5">
        <span
          className={cn(
            "block h-0.5 w-5 bg-zinc-900 dark:bg-zinc-100 transition-all duration-300 ease-out",
            isOpen ? "rotate-45 translate-y-1" : "-translate-y-1"
          )}
        />
        <span
          className={cn(
            "block h-0.5 w-5 bg-zinc-900 dark:bg-zinc-100 transition-all duration-300 ease-out",
            isOpen ? "opacity-0" : "opacity-100"
          )}
        />
        <span
          className={cn(
            "block h-0.5 w-5 bg-zinc-900 dark:bg-zinc-100 transition-all duration-300 ease-out",
            isOpen ? "-rotate-45 -translate-y-1" : "translate-y-1"
          )}
        />
      </div>
    </button>
  );
}