/**
 * Timer Utility Functions
 * Extracted from TimerDisplay component for testability
 */

export interface Timer {
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

/**
 * Format seconds into HH:MM:SS format
 */
export const formatTime = (seconds: number): string => {
  if (seconds < 0) return "00:00:00";

  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  return `${hours.toString().padStart(2, "0")}:${minutes
    .toString()
    .padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
};

/**
 * Get the current time remaining for a timer based on its status and end time
 */
export const getClientTimeRemaining = (timer: Timer): number => {
  if (timer.status === "paused") {
    return timer.time_remaining;
  }

  if (timer.status !== "active") {
    return 0;
  }

  const endTime = new Date(timer.end_time).getTime();
  const now = Date.now();
  const remaining = Math.max(0, Math.floor((endTime - now) / 1000));

  return remaining;
};

/**
 * Get color classes for timer display based on time remaining
 */
export const getTimerColor = (timer: Timer): string => {
  const remaining = getClientTimeRemaining(timer);
  if (timer.status === "paused") return "text-zinc-400 dark:text-zinc-500";
  if (remaining <= 180) return "text-rose-500 dark:text-rose-400"; // 3 minutes or less
  if (remaining <= 600) return "text-amber-500 dark:text-amber-400"; // 10 minutes or less
  return "text-emerald-500 dark:text-emerald-400";
};

/**
 * Calculate progress percentage for timer progress bar
 */
export const getProgressPercentage = (timer: Timer, clientTimeRemaining?: number): number => {
  const remaining = clientTimeRemaining ?? getClientTimeRemaining(timer);
  const elapsed = timer.duration_seconds - remaining;
  return (elapsed / timer.duration_seconds) * 100;
};
