/**
 * Mock timer data for testing
 */

export interface MockTimer {
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
 * Generate a mock timer with specified properties
 */
export function createMockTimer(overrides?: Partial<MockTimer>): MockTimer {
  const now = new Date();
  const duration_seconds = overrides?.duration_seconds ?? 600; // Default 10 minutes
  const end_time = new Date(now.getTime() + duration_seconds * 1000).toISOString();
  
  return {
    id: overrides?.id ?? `timer-${Math.random().toString(36).substr(2, 9)}`,
    name: overrides?.name ?? "Test Timer",
    duration_seconds,
    end_time: overrides?.end_time ?? end_time,
    status: overrides?.status ?? "active",
    time_remaining: overrides?.time_remaining ?? duration_seconds,
    time_remaining_display: overrides?.time_remaining_display ?? "00:10:00",
    three_minute_warning_sent: overrides?.three_minute_warning_sent ?? false,
    completion_notification_sent: overrides?.completion_notification_sent ?? false,
  };
}

/**
 * Pre-configured mock timers for common test scenarios
 */
export const mockTimers = {
  // Active timer with 10 minutes remaining
  active10Min: createMockTimer({
    id: "timer-active-10min",
    name: "Focus Session",
    duration_seconds: 600,
    time_remaining: 600,
    time_remaining_display: "00:10:00",
    status: "active",
  }),
  
  // Active timer with 5 minutes remaining
  active5Min: createMockTimer({
    id: "timer-active-5min",
    name: "Break Time",
    duration_seconds: 300,
    time_remaining: 300,
    time_remaining_display: "00:05:00",
    status: "active",
  }),
  
  // Active timer with 2 minutes remaining (warning state)
  active2Min: createMockTimer({
    id: "timer-active-2min",
    name: "Almost Done",
    duration_seconds: 120,
    time_remaining: 120,
    time_remaining_display: "00:02:00",
    status: "active",
    three_minute_warning_sent: true,
  }),
  
  // Paused timer
  paused: createMockTimer({
    id: "timer-paused",
    name: "Paused Timer",
    duration_seconds: 600,
    time_remaining: 300,
    time_remaining_display: "00:05:00",
    status: "paused",
  }),
  
  // Completed timer
  completed: createMockTimer({
    id: "timer-completed",
    name: "Completed Timer",
    duration_seconds: 300,
    time_remaining: 0,
    time_remaining_display: "00:00:00",
    status: "completed",
    completion_notification_sent: true,
  }),
  
  // Cancelled timer
  cancelled: createMockTimer({
    id: "timer-cancelled",
    name: "Cancelled Timer",
    duration_seconds: 600,
    time_remaining: 400,
    time_remaining_display: "00:06:40",
    status: "cancelled",
  }),
  
  // Long timer (1 hour)
  longTimer: createMockTimer({
    id: "timer-long",
    name: "Deep Work Session",
    duration_seconds: 3600,
    time_remaining: 3600,
    time_remaining_display: "01:00:00",
    status: "active",
  }),
};

/**
 * Generate multiple mock timers
 */
export function createMockTimers(count: number): MockTimer[] {
  return Array.from({ length: count }, (_, index) => 
    createMockTimer({
      id: `timer-${index}`,
      name: `Timer ${index + 1}`,
      duration_seconds: (index + 1) * 300, // 5, 10, 15 minutes etc
    })
  );
}

/**
 * Mock API responses
 */
export const mockApiResponses = {
  // Successful timer creation
  createSuccess: (timer: MockTimer) => ({
    status: 201,
    data: timer,
  }),
  
  // List of active timers
  activeTimers: (timers: MockTimer[]) => ({
    status: 200,
    data: timers,
  }),
  
  // Empty timer list
  emptyList: {
    status: 200,
    data: [],
  },
  
  // Timer not found error
  notFound: {
    status: 404,
    data: { error: "Timer not found" },
  },
  
  // Validation error
  validationError: {
    status: 400,
    data: { error: "Invalid timer data" },
  },
  
  // Server error
  serverError: {
    status: 500,
    data: { error: "Internal server error" },
  },
};

/**
 * Mock WebSocket events
 */
export const mockWsEvents = {
  timerUpdate: (timerId: string) => ({
    type: "timer_update",
    data: {
      timer_id: timerId,
      action: "created",
      message: "Timer created",
    },
  }),
  
  timerWarning: (timerId: string) => ({
    type: "timer_warning",
    data: {
      timer_id: timerId,
      message: "3 minutes remaining",
    },
  }),
  
  timerCompleted: (timerId: string) => ({
    type: "timer_completed",
    data: {
      timer_id: timerId,
      message: "Timer completed",
    },
  }),
  
  connectionEstablished: {
    type: "connection_established",
    data: {
      message: "WebSocket connected",
    },
  },
};
