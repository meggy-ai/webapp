"use client";

import { Component, ErrorInfo, ReactNode } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        this.props.fallback || (
          <div className="flex min-h-[400px] items-center justify-center p-4">
            <Card className="max-w-md">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <AlertTriangle className="text-destructive h-5 w-5" />
                  <CardTitle>Something went wrong</CardTitle>
                </div>
                <CardDescription>
                  An unexpected error occurred. Please try refreshing the page.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {process.env.NODE_ENV === "development" && this.state.error && (
                  <details className="mt-4">
                    <summary className="cursor-pointer text-sm font-medium">Error details</summary>
                    <pre className="bg-muted mt-2 overflow-auto rounded p-3 text-xs">
                      {this.state.error.stack}
                    </pre>
                  </details>
                )}
              </CardContent>
              <CardFooter>
                <Button onClick={() => window.location.reload()} className="w-full">
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Refresh Page
                </Button>
              </CardFooter>
            </Card>
          </div>
        )
      );
    }

    return this.props.children;
  }
}
