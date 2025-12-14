"use client";

import React, { useState, useEffect } from "react";
import { timersAPI } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Play,
  Pause,
  X,
  Clock,
  Plus,
  Loader2,
} from "lucide-react";
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
}

export default function TimerDisplay({ onTimerUpdate }: TimerDisplayProps) {
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

  useEffect(() => {
    fetchTimers();
    
    // Poll for timer updates every 1 second
    const interval = setInterval(() => {
      fetchTimers();
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
    if (timer.status === "paused") return "text-gray-500";
    if (timer.time_remaining <= 180) return "text-red-500"; // 3 minutes or less
    if (timer.time_remaining <= 600) return "text-yellow-500"; // 10 minutes or less
    return "text-green-500";
  };

  const getProgressPercentage = (timer: Timer): number => {
    const elapsed = timer.duration_seconds - timer.time_remaining;
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
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Active Timers
        </h3>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm" variant="outline">
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
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewTimerName(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="timer-duration">Duration (minutes)</Label>
                <Input
                  id="timer-duration"
                  type="number"
                  min="1"
                  value={newTimerMinutes}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewTimerMinutes(e.target.value)}
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
      </div>

      {timers.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground">
              No active timers. Create one to get started!
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {timers.map((timer) => (
            <Card key={timer.id}>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center justify-between">
                  <span>{timer.name}</span>
                  <div className="flex items-center gap-2">
                    {timer.status === "active" && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handlePause(timer.id)}
                      >
                        <Pause className="h-4 w-4" />
                      </Button>
                    )}
                    {timer.status === "paused" && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleResume(timer.id)}
                      >
                        <Play className="h-4 w-4" />
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleCancel(timer.id)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div
                    className={`text-3xl font-mono font-bold ${getTimerColor(
                      timer
                    )}`}
                  >
                    {formatTime(timer.time_remaining)}
                  </div>
                  
                  {/* Progress bar */}
                  <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all ${
                        timer.time_remaining <= 180
                          ? "bg-red-500"
                          : timer.time_remaining <= 600
                          ? "bg-yellow-500"
                          : "bg-green-500"
                      }`}
                      style={{ width: `${getProgressPercentage(timer)}%` }}
                    />
                  </div>

                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>
                      {timer.status === "paused" ? "Paused" : "Running"}
                    </span>
                    <span>
                      Total: {formatTime(timer.duration_seconds)}
                    </span>
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
