"use client";

import React, { useState, useEffect } from "react";
import { timersAPI } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Play, Pause, X, Clock, Plus, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface Timer {
  id: string;
  name: string;
  duration_seconds: number;
  end_time: string;
  status: "active" | "paused" | "completed" | "cancelled";
  time_remaining: number;
  time_remaining_display: string;
  three_minute_warning_sent: boolean;
  completion_notification_sent: boolean;
}

interface TimerDisplayProps {
  onTimerUpdate?: () => void;
  wsEvent?: { type: string; data: unknown } | null;
}

export default function TimerDisplay({
  onTimerUpdate,
  wsEvent,
}: TimerDisplayProps) {
  const [timers, setTimers] = useState<Timer[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newTimerName, setNewTimerName] = useState("");
  const [newTimerMinutes, setNewTimerMinutes] = useState("10");
  const [creating, setCreating] = useState(false);

  // Fetch active timers
  const fetchTimers = async () => {
    try {
      const data = await timersAPI.getActive();
      setTimers(data);
    } catch (error) {
      console.error("Error fetching timers:", error);
    } finally {
      setLoading(false);
    }
  };

  // Initial fetch
  useEffect(() => {
    fetchTimers();
  }, []);

  // Listen for WebSocket events
  useEffect(() => {
    if (wsEvent) {
      if (
        wsEvent.type === "timer_update" ||
        wsEvent.type === "timer_warning" ||
        wsEvent.type === "timer_completed"
      ) {
        // Refresh timers on any timer-related WebSocket event
        fetchTimers();
      }
    }
  }, [wsEvent]);

  // Calculate remaining time based on end_time (client-side)
  const getClientTimeRemaining = (timer: Timer): number => {
    if (timer.status === "paused") {
      return timer.time_remaining;
    }
    if (timer.status !== "active") {
      return 0;
    }

    const now = new Date().getTime();
    const endTime = new Date(timer.end_time).getTime();
    const remainingMs = endTime - now;
    return Math.max(0, Math.floor(remainingMs / 1000));
  };

  // Update countdown display every second (local only, no API call)
  useEffect(() => {
    const interval = setInterval(() => {
      // Force re-render to update countdown displays
      setTimers((current) => [...current]);
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const handleCreateTimer = async () => {
    if (!newTimerName.trim()) return;

    const minutes = parseInt(newTimerMinutes);
    if (isNaN(minutes) || minutes <= 0) return;

    setCreating(true);
    try {
      await timersAPI.create({
        name: newTimerName,
        duration_seconds: minutes * 60,
      });

      setNewTimerName("");
      setNewTimerMinutes("10");
      setIsCreateDialogOpen(false);
      await fetchTimers();
      onTimerUpdate?.();
    } catch (error) {
      console.error("Error creating timer:", error);
    } finally {
      setCreating(false);
    }
  };

  const handlePause = async (id: string) => {
    try {
      await timersAPI.pause(id);
      await fetchTimers();
      onTimerUpdate?.();
    } catch (error) {
      console.error("Error pausing timer:", error);
    }
  };

  const handleResume = async (id: string) => {
    try {
      await timersAPI.resume(id);
      await fetchTimers();
      onTimerUpdate?.();
    } catch (error) {
      console.error("Error resuming timer:", error);
    }
  };

  const handleCancel = async (id: string) => {
    try {
      await timersAPI.cancel(id);
      await fetchTimers();
      onTimerUpdate?.();
    } catch (error) {
      console.error("Error cancelling timer:", error);
    }
  };

  const handleCancelAll = async () => {
    try {
      await timersAPI.cancelAll();
      await fetchTimers();
      onTimerUpdate?.();
    } catch (error) {
      console.error("Error cancelling all timers:", error);
    }
  };

  const formatTime = (seconds: number): string => {
    if (seconds < 0) return "00:00:00";

    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    return `${hours.toString().padStart(2, "0")}:${minutes
      .toString()
      .padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const getTimerColor = (timer: Timer): string => {
    const remaining = getClientTimeRemaining(timer);
    if (timer.status === "paused") return "text-zinc-400 dark:text-zinc-500";
    if (remaining <= 180) return "text-rose-500 dark:text-rose-400"; // 3 minutes or less - softer red
    if (remaining <= 600) return "text-amber-500 dark:text-amber-400"; // 10 minutes or less - warmer yellow
    return "text-emerald-500 dark:text-emerald-400"; // softer green
  };

  const getProgressPercentage = (timer: Timer): number => {
    const remaining = getClientTimeRemaining(timer);
    const elapsed = timer.duration_seconds - remaining;
    return (elapsed / timer.duration_seconds) * 100;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-4">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold flex items-center gap-2 text-zinc-800 dark:text-zinc-200">
            <Clock className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
            Active Timers
            {timers.length > 0 && (
              <span className="ml-2 px-2 py-0.5 text-xs font-medium bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300 rounded-full">
                {timers.length}
              </span>
            )}
          </h3>
        </div>
        
        {/* Action buttons row */}
        <div className="flex items-center justify-between gap-3">
          <Dialog
            open={isCreateDialogOpen}
            onOpenChange={setIsCreateDialogOpen}
          >
            <DialogTrigger asChild>
              <Button 
                size="sm" 
                className="bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-600 dark:hover:bg-indigo-500 text-white border-0 shadow-sm transition-all duration-200"
              >
                <Plus className="h-4 w-4 mr-2" />
                New Timer
              </Button>
            </DialogTrigger>
            
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Timer</DialogTitle>
                <DialogDescription>
                  Set a timer to help you stay on track
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="timer-name">Timer Name</Label>
                  <Input
                    id="timer-name"
                    placeholder="e.g., Break time, Focus session"
                    value={newTimerName}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setNewTimerName(e.target.value)
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="timer-duration">Duration (minutes)</Label>
                  <Input
                    id="timer-duration"
                    type="number"
                    min="1"
                    value={newTimerMinutes}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setNewTimerMinutes(e.target.value)
                    }
                  />
                </div>
              </div>
              <DialogFooter>
                <Button
                  onClick={handleCreateTimer}
                  disabled={creating || !newTimerName.trim()}
                >
                  {creating ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    "Create Timer"
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          
          {timers.length > 0 && (
            <Button
              size="sm"
              variant="outline"
              className="border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 hover:bg-rose-50 dark:hover:bg-rose-950 hover:border-rose-300 dark:hover:border-rose-700 transition-colors"
              onClick={handleCancelAll}
              title="Cancel all active timers"
            >
              <X className="h-4 w-4 mr-2" />
              Cancel All
            </Button>
          )}
        </div>
      </div>

      {timers.length === 0 ? (
        <div className="text-center py-8 px-4">
          <Clock className="h-12 w-12 text-zinc-300 dark:text-zinc-600 mx-auto mb-3" />
          <p className="text-zinc-500 dark:text-zinc-400 text-sm">
            No active timers. Create one to get started!
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {timers.map((timer) => (
            <Card key={timer.id} className="border-zinc-200 dark:border-zinc-800 shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center justify-between">
                  <span className="text-zinc-800 dark:text-zinc-200 font-medium">{timer.name}</span>
                  <div className="flex items-center gap-1">
                    {timer.status === "active" && (
                      <Button
                        size="sm"
                        variant="ghost"
                        className="hover:bg-indigo-50 dark:hover:bg-indigo-950 text-zinc-500 dark:text-zinc-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                        onClick={() => handlePause(timer.id)}
                      >
                        <Pause className="h-4 w-4" />
                      </Button>
                    )}
                    {timer.status === "paused" && (
                      <Button
                        size="sm"
                        variant="ghost"
                        className="hover:bg-emerald-50 dark:hover:bg-emerald-950 text-zinc-500 dark:text-zinc-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
                        onClick={() => handleResume(timer.id)}
                      >
                        <Play className="h-4 w-4" />
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="ghost"
                      className="hover:bg-rose-50 dark:hover:bg-rose-950 text-zinc-500 dark:text-zinc-400 hover:text-rose-600 dark:hover:text-rose-400 transition-colors"
                      onClick={() => handleCancel(timer.id)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div
                    className={`text-2xl font-mono font-bold tracking-tight ${getTimerColor(
                      timer
                    )}`}
                  >
                    {formatTime(getClientTimeRemaining(timer))}
                  </div>

                  {/* Progress bar */}
                  <div className="h-2 bg-zinc-200 dark:bg-zinc-800 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all duration-300 ${
                        getClientTimeRemaining(timer) <= 180
                          ? "bg-gradient-to-r from-rose-500 to-red-500 dark:from-rose-400 dark:to-red-400"
                          : getClientTimeRemaining(timer) <= 600
                            ? "bg-gradient-to-r from-amber-500 to-orange-500 dark:from-amber-400 dark:to-orange-400"
                            : "bg-gradient-to-r from-emerald-500 to-green-500 dark:from-emerald-400 dark:to-green-400"
                      }`}
                      style={{ width: `${getProgressPercentage(timer)}%` }}
                    />
                  </div>

                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>
                      {timer.status === "paused" ? "Paused" : "Running"}
                    </span>
                    <span>Total: {formatTime(timer.duration_seconds)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
