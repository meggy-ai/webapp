import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface LoadingProps {
  className?: string;
  text?: string;
}

export function Loading({ className, text = "Loading..." }: LoadingProps) {
  return (
    <div className={cn("flex items-center justify-center gap-2", className)}>
      <Loader2 className="h-4 w-4 animate-spin" />
      <span className="text-muted-foreground text-sm">{text}</span>
    </div>
  );
}

export function PageLoading() {
  return (
    <div className="flex min-h-[400px] items-center justify-center">
      <Loading text="Loading page..." />
    </div>
  );
}

export function FullPageLoading() {
  return (
    <div className="bg-background fixed inset-0 flex items-center justify-center">
      <Loading text="Loading application..." />
    </div>
  );
}
