import { AlertTriangle, CheckCircle, Info, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface EmptyStateProps {
  title: string;
  description?: string;
  icon?: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
}

export function EmptyState({ title, description, icon, action, className }: EmptyStateProps) {
  return (
    <div className={cn("flex flex-col items-center justify-center p-8 text-center", className)}>
      {icon && <div className="text-muted-foreground mb-4">{icon}</div>}
      <h3 className="text-lg font-semibold">{title}</h3>
      {description && <p className="text-muted-foreground mt-1 max-w-sm text-sm">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

interface StatusMessageProps {
  type: "success" | "error" | "warning" | "info";
  title: string;
  description?: string;
  className?: string;
}

export function StatusMessage({ type, title, description, className }: StatusMessageProps) {
  const icons = {
    success: CheckCircle,
    error: XCircle,
    warning: AlertTriangle,
    info: Info,
  };

  const colors = {
    success: "text-green-600 dark:text-green-400",
    error: "text-destructive",
    warning: "text-yellow-600 dark:text-yellow-400",
    info: "text-blue-600 dark:text-blue-400",
  };

  const Icon = icons[type];

  return (
    <div className={cn("flex items-start gap-3 p-4", className)}>
      <Icon className={cn("mt-0.5 h-5 w-5", colors[type])} />
      <div>
        <h4 className="font-medium">{title}</h4>
        {description && <p className="text-muted-foreground mt-1 text-sm">{description}</p>}
      </div>
    </div>
  );
}
