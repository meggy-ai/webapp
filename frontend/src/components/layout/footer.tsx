import Link from "next/link";
import { Bot } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-border/40 bg-background border-t">
      <div className="container flex flex-col items-center justify-between gap-4 py-10 md:h-24 md:flex-row md:py-0">
        <div className="flex flex-col items-center gap-4 px-8 md:flex-row md:gap-2 md:px-0">
          <Bot className="h-6 w-6" />
          <p className="text-muted-foreground text-center text-sm leading-loose md:text-left">
            Built with ❤️ by{" "}
            <Link
              href="https://github.com/meggy-ai"
              target="_blank"
              rel="noreferrer"
              className="font-medium underline underline-offset-4"
            >
              Meggy AI
            </Link>
            . The source code is available on{" "}
            <Link
              href="https://github.com/meggy-ai/frontend"
              target="_blank"
              rel="noreferrer"
              className="font-medium underline underline-offset-4"
            >
              GitHub
            </Link>
            .
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <Link
            href="/privacy"
            className="text-muted-foreground hover:text-foreground text-sm transition-colors"
          >
            Privacy
          </Link>
          <Link
            href="/terms"
            className="text-muted-foreground hover:text-foreground text-sm transition-colors"
          >
            Terms
          </Link>
          <Link
            href="/docs"
            className="text-muted-foreground hover:text-foreground text-sm transition-colors"
          >
            Docs
          </Link>
        </div>
      </div>
    </footer>
  );
}
