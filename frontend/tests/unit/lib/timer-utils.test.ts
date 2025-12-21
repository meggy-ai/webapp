/**
 * Timer Utility Functions - Unit Tests
 * Tests for time formatting and color coding logic
 */

import { formatTime, getTimerColor, getProgressPercentage } from '@/lib/timer-utils';

describe('Timer Utility Functions', () => {
  describe('formatTime', () => {
    it('should format seconds into HH:MM:SS', () => {
      expect(formatTime(0)).toBe('00:00:00');
      expect(formatTime(30)).toBe('00:00:30');
      expect(formatTime(90)).toBe('00:01:30');
      expect(formatTime(3661)).toBe('01:01:01');
    });

    it('should handle hours correctly', () => {
      expect(formatTime(3600)).toBe('01:00:00');
      expect(formatTime(7200)).toBe('02:00:00');
      expect(formatTime(36000)).toBe('10:00:00');
    });

    it('should pad single digits with zero', () => {
      expect(formatTime(5)).toBe('00:00:05');
      expect(formatTime(65)).toBe('00:01:05');
      expect(formatTime(3605)).toBe('01:00:05');
    });

    it('should handle negative values', () => {
      expect(formatTime(-10)).toBe('00:00:00');
      expect(formatTime(-100)).toBe('00:00:00');
    });
  });

  describe('getTimerColor', () => {
    const createMockTimer = (status: string, timeRemaining: number) => ({
      id: '1',
      name: 'Test',
      duration_seconds: 600,
      end_time: new Date(Date.now() + timeRemaining * 1000).toISOString(),
      status,
      time_remaining: timeRemaining,
      time_remaining_display: '',
      three_minute_warning_sent: false,
      completion_notification_sent: false,
    });

    it('should return gray for paused timers', () => {
      const timer = createMockTimer('paused', 300);
      const color = getTimerColor(timer);
      expect(color).toContain('zinc');
    });

    it('should return red for timers with <= 3 minutes', () => {
      const timer = createMockTimer('active', 180);
      const color = getTimerColor(timer);
      expect(color).toContain('rose');
    });

    it('should return amber for timers with <= 10 minutes', () => {
      const timer = createMockTimer('active', 600);
      const color = getTimerColor(timer);
      expect(color).toContain('amber');
    });

    it('should return green for timers with > 10 minutes', () => {
      const timer = createMockTimer('active', 900);
      const color = getTimerColor(timer);
      expect(color).toContain('emerald');
    });
  });

  describe('getProgressPercentage', () => {
    it('should calculate progress correctly', () => {
      const timer = {
        id: '1',
        name: 'Test',
        duration_seconds: 600,
        end_time: new Date(Date.now() + 300 * 1000).toISOString(),
        status: 'active' as const,
        time_remaining: 300,
        time_remaining_display: '',
        three_minute_warning_sent: false,
        completion_notification_sent: false,
      };

      const progress = getProgressPercentage(timer, 300);
      expect(progress).toBe(50);
    });

    it('should return 0 for newly started timers', () => {
      const timer = {
        id: '1',
        name: 'Test',
        duration_seconds: 600,
        end_time: new Date(Date.now() + 600 * 1000).toISOString(),
        status: 'active' as const,
        time_remaining: 600,
        time_remaining_display: '',
        three_minute_warning_sent: false,
        completion_notification_sent: false,
      };

      const progress = getProgressPercentage(timer, 600);
      expect(progress).toBe(0);
    });

    it('should return 100 for completed timers', () => {
      const timer = {
        id: '1',
        name: 'Test',
        duration_seconds: 600,
        end_time: new Date(Date.now() - 1000).toISOString(),
        status: 'active' as const,
        time_remaining: 0,
        time_remaining_display: '',
        three_minute_warning_sent: false,
        completion_notification_sent: false,
      };

      const progress = getProgressPercentage(timer, 0);
      expect(progress).toBe(100);
    });
  });
});
