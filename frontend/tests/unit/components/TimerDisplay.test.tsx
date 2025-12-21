/**
 * TimerDisplay Component - Unit Tests
 * Tests for timer display UI and interactions
 */

import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import TimerDisplay from '@/components/chat/TimerDisplay';
import { timersAPI } from '@/lib/api';

// Mock the API module
jest.mock('@/lib/api', () => ({
  timersAPI: {
    getActive: jest.fn(),
    create: jest.fn(),
    pause: jest.fn(),
    resume: jest.fn(),
    cancel: jest.fn(),
    cancelAll: jest.fn(),
  },
}));

// Mock Lucide icons to avoid rendering issues
jest.mock('lucide-react', () => ({
  Play: () => <div data-testid="play-icon">Play</div>,
  Pause: () => <div data-testid="pause-icon">Pause</div>,
  X: () => <div data-testid="x-icon">X</div>,
  Clock: () => <div data-testid="clock-icon">Clock</div>,
  Plus: () => <div data-testid="plus-icon">Plus</div>,
  Loader2: () => <div data-testid="loader-icon">Loading...</div>,
}));

describe('TimerDisplay Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Loading State', () => {
    it('should show loading spinner while fetching timers', () => {
      // Mock API to never resolve (stay in loading state)
      (timersAPI.getActive as jest.Mock).mockImplementation(
        () => new Promise(() => {})
      );

      render(<TimerDisplay />);
      
      expect(screen.getByTestId('loader-icon')).toBeTruthy();
    });
  });

  describe('Empty State', () => {
    it('should show empty state when no timers exist', async () => {
      (timersAPI.getActive as jest.Mock).mockResolvedValue([]);

      render(<TimerDisplay />);

      await waitFor(() => {
        expect(screen.getByText(/No active timers/i)).toBeTruthy();
      });
    });

    it('should show create button in empty state', async () => {
      (timersAPI.getActive as jest.Mock).mockResolvedValue([]);

      render(<TimerDisplay />);

      await waitFor(() => {
        expect(screen.getByText(/New Timer/i)).toBeTruthy();
      });
    });
  });

  describe('Timer Display', () => {
    const mockTimer = {
      id: '1',
      name: 'Test Timer',
      duration_seconds: 600,
      end_time: new Date(Date.now() + 300000).toISOString(),
      status: 'active' as const,
      time_remaining: 300,
      time_remaining_display: '00:05:00',
      three_minute_warning_sent: false,
      completion_notification_sent: false,
    };

    it('should display timer name', async () => {
      (timersAPI.getActive as jest.Mock).mockResolvedValue([mockTimer]);

      render(<TimerDisplay />);

      await waitFor(() => {
        expect(screen.getByText('Test Timer')).toBeTruthy();
      });
    });

    it('should show timer count badge', async () => {
      (timersAPI.getActive as jest.Mock).mockResolvedValue([mockTimer]);

      render(<TimerDisplay />);

      await waitFor(() => {
        expect(screen.getByText('1')).toBeTruthy();
      });
    });

    it('should display multiple timers', async () => {
      const timers = [
        mockTimer,
        { ...mockTimer, id: '2', name: 'Second Timer' },
        { ...mockTimer, id: '3', name: 'Third Timer' },
      ];
      (timersAPI.getActive as jest.Mock).mockResolvedValue(timers);

      render(<TimerDisplay />);

      await waitFor(() => {
        expect(screen.getByText('Test Timer')).toBeTruthy();
        expect(screen.getByText('Second Timer')).toBeTruthy();
        expect(screen.getByText('Third Timer')).toBeTruthy();
        expect(screen.getByText('3')).toBeTruthy();
      });
    });
  });

  describe('Timer Status Display', () => {
    it('should show pause button for active timers', async () => {
      const activeTimer = {
        id: '1',
        name: 'Active Timer',
        duration_seconds: 600,
        end_time: new Date(Date.now() + 300000).toISOString(),
        status: 'active' as const,
        time_remaining: 300,
        time_remaining_display: '00:05:00',
        three_minute_warning_sent: false,
        completion_notification_sent: false,
      };
      (timersAPI.getActive as jest.Mock).mockResolvedValue([activeTimer]);

      render(<TimerDisplay />);

      await waitFor(() => {
        expect(screen.getByTestId('pause-icon')).toBeTruthy();
      });
    });

    it('should show play button for paused timers', async () => {
      const pausedTimer = {
        id: '1',
        name: 'Paused Timer',
        duration_seconds: 600,
        end_time: new Date(Date.now() + 300000).toISOString(),
        status: 'paused' as const,
        time_remaining: 300,
        time_remaining_display: '00:05:00',
        three_minute_warning_sent: false,
        completion_notification_sent: false,
      };
      (timersAPI.getActive as jest.Mock).mockResolvedValue([pausedTimer]);

      render(<TimerDisplay />);

      await waitFor(() => {
        expect(screen.getByTestId('play-icon')).toBeTruthy();
        expect(screen.getByText('Paused')).toBeTruthy();
      });
    });
  });

  describe('Cancel All Button', () => {
    it('should show Cancel All button when timers exist', async () => {
      const timer = {
        id: '1',
        name: 'Test Timer',
        duration_seconds: 600,
        end_time: new Date(Date.now() + 300000).toISOString(),
        status: 'active' as const,
        time_remaining: 300,
        time_remaining_display: '00:05:00',
        three_minute_warning_sent: false,
        completion_notification_sent: false,
      };
      (timersAPI.getActive as jest.Mock).mockResolvedValue([timer]);

      render(<TimerDisplay />);

      await waitFor(() => {
        expect(screen.getByText('Cancel All')).toBeTruthy();
      });
    });

    it('should not show Cancel All button in empty state', async () => {
      (timersAPI.getActive as jest.Mock).mockResolvedValue([]);

      render(<TimerDisplay />);

      await waitFor(() => {
        expect(screen.queryByText('Cancel All')).toBeNull();
      });
    });
  });
});
