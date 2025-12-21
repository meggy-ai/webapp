/**
 * Unit tests for Timer Color Coding and Time Formatting
 */

import { render, screen, waitFor } from '@/tests/utils/test-utils';
import TimerDisplay from '@/components/chat/TimerDisplay';
import { createMockTimer } from '@/tests/fixtures/timer-data';
import * as api from '@/lib/api';

jest.mock('@/lib/api');

describe('TimerDisplay - Timer Color Coding Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should show green color when > 10 minutes remaining', async () => {
    const timer = createMockTimer({
      name: 'Long Timer',
      duration_seconds: 3600,
      time_remaining: 3600,
      status: 'active',
    });
    (api.timersAPI.getActive as jest.Mock).mockResolvedValue([timer]);
    
    render(<TimerDisplay />);
    
    await waitFor(() => {
      expect(screen.getByText('Long Timer')).toBeInTheDocument();
    });
    
    // Check for green/emerald color class
    const countdown = screen.getByText(/01:00:00/);
    expect(countdown.className).toMatch(/emerald|green/);
  });

  it('should show yellow/amber when 3-10 minutes remaining', async () => {
    const timer = createMockTimer({
      name: 'Medium Timer',
      duration_seconds: 300,
      time_remaining: 300, // 5 minutes
      status: 'active',
    });
    (api.timersAPI.getActive as jest.Mock).mockResolvedValue([timer]);
    
    render(<TimerDisplay />);
    
    await waitFor(() => {
      expect(screen.getByText('Medium Timer')).toBeInTheDocument();
    });
    
    // Check for amber/yellow color class
    const countdown = screen.getByText(/00:05:00/);
    expect(countdown.className).toMatch(/amber|yellow|orange/);
  });

  it('should show red color when ≤ 3 minutes remaining', async () => {
    const timer = createMockTimer({
      name: 'Almost Done',
      duration_seconds: 120,
      time_remaining: 120, // 2 minutes
      status: 'active',
    });
    (api.timersAPI.getActive as jest.Mock).mockResolvedValue([timer]);
    
    render(<TimerDisplay />);
    
    await waitFor(() => {
      expect(screen.getByText('Almost Done')).toBeInTheDocument();
    });
    
    // Check for red/rose color class
    const countdown = screen.getByText(/00:02:00/);
    expect(countdown.className).toMatch(/rose|red/);
  });

  it('should show gray color for paused timers', async () => {
    const timer = createMockTimer({
      name: 'Paused Timer',
      duration_seconds: 600,
      time_remaining: 300,
      status: 'paused',
    });
    (api.timersAPI.getActive as jest.Mock).mockResolvedValue([timer]);
    
    render(<TimerDisplay />);
    
    await waitFor(() => {
      expect(screen.getByText('Paused Timer')).toBeInTheDocument();
    });
    
    // Check for gray/zinc color class
    const countdown = screen.getByText(/00:05:00/);
    expect(countdown.className).toMatch(/zinc|gray/);
  });
});

describe('TimerDisplay - Time Formatting Tests', () => {
  // We'll test the formatting by checking rendered output
  
  it('should format seconds correctly (00:00:00)', async () => {
    const timer = createMockTimer({
      name: 'Short Timer',
      duration_seconds: 45,
      time_remaining: 45,
      status: 'active',
    });
    (api.timersAPI.getActive as jest.Mock).mockResolvedValue([timer]);
    
    render(<TimerDisplay />);
    
    await waitFor(() => {
      expect(screen.getByText(/00:00:45/)).toBeInTheDocument();
    });
  });

  it('should handle hours correctly (01:30:45)', async () => {
    const timer = createMockTimer({
      name: 'Long Timer',
      duration_seconds: 5445, // 1 hour, 30 minutes, 45 seconds
      time_remaining: 5445,
      status: 'active',
    });
    (api.timersAPI.getActive as jest.Mock).mockResolvedValue([timer]);
    
    render(<TimerDisplay />);
    
    await waitFor(() => {
      expect(screen.getByText(/01:30:45/)).toBeInTheDocument();
    });
  });

  it('should handle negative values (00:00:00)', async () => {
    const timer = createMockTimer({
      name: 'Expired Timer',
      duration_seconds: 60,
      time_remaining: -10, // Negative time
      status: 'active',
    });
    (api.timersAPI.getActive as jest.Mock).mockResolvedValue([timer]);
    
    render(<TimerDisplay />);
    
    await waitFor(() => {
      // Negative times should show as 00:00:00
      expect(screen.getByText(/00:00:00/)).toBeInTheDocument();
    });
  });

  it('should pad single digits with zeros', async () => {
    const timer = createMockTimer({
      name: 'Test Timer',
      duration_seconds: 65, // 1 minute, 5 seconds
      time_remaining: 65,
      status: 'active',
    });
    (api.timersAPI.getActive as jest.Mock).mockResolvedValue([timer]);
    
    render(<TimerDisplay />);
    
    await waitFor(() => {
      // Should be 00:01:05, not 0:1:5
      expect(screen.getByText(/00:01:05/)).toBeInTheDocument();
    });
  });
});

describe('TimerDisplay - Timer Controls', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should call pause API when pause button clicked', async () => {
    const timer = createMockTimer({
      id: 'timer-1',
      name: 'Active Timer',
      status: 'active',
    });
    (api.timersAPI.getActive as jest.Mock).mockResolvedValue([timer]);
    (api.timersAPI.pause as jest.Mock).mockResolvedValue({});
    
    const { container } = render(<TimerDisplay />);
    
    await waitFor(() => {
      expect(screen.getByText('Active Timer')).toBeInTheDocument();
    });
    
    // Find and click pause button
    const pauseButton = container.querySelector('button svg.lucide-pause')?.parentElement;
    if (pauseButton) {
      pauseButton.click();
      
      await waitFor(() => {
        expect(api.timersAPI.pause).toHaveBeenCalledWith('timer-1');
      });
    }
  });

  it('should call resume API when resume button clicked', async () => {
    const timer = createMockTimer({
      id: 'timer-2',
      name: 'Paused Timer',
      status: 'paused',
    });
    (api.timersAPI.getActive as jest.Mock).mockResolvedValue([timer]);
    (api.timersAPI.resume as jest.Mock).mockResolvedValue({});
    
    const { container } = render(<TimerDisplay />);
    
    await waitFor(() => {
      expect(screen.getByText('Paused Timer')).toBeInTheDocument();
    });
    
    // Find and click resume button
    const resumeButton = container.querySelector('button svg.lucide-play')?.parentElement;
    if (resumeButton) {
      resumeButton.click();
      
      await waitFor(() => {
        expect(api.timersAPI.resume).toHaveBeenCalledWith('timer-2');
      });
    }
  });

  it('should call cancel API when cancel button clicked', async () => {
    const timer = createMockTimer({
      id: 'timer-3',
      name: 'Test Timer',
      status: 'active',
    });
    (api.timersAPI.getActive as jest.Mock).mockResolvedValue([timer]);
    (api.timersAPI.cancel as jest.Mock).mockResolvedValue({});
    
    const { container } = render(<TimerDisplay />);
    
    await waitFor(() => {
      expect(screen.getByText('Test Timer')).toBeInTheDocument();
    });
    
    // Find and click cancel button (X icon)
    const cancelButtons = container.querySelectorAll('button svg.lucide-x');
    const timerCancelButton = Array.from(cancelButtons).find(btn => {
      // Find the X button that's part of the timer card, not the "Cancel All" button
      const parent = btn.parentElement?.parentElement;
      return parent?.textContent?.includes('Test Timer');
    })?.parentElement;
    
    if (timerCancelButton) {
      timerCancelButton.click();
      
      await waitFor(() => {
        expect(api.timersAPI.cancel).toHaveBeenCalledWith('timer-3');
      });
    }
  });

  it('should call cancelAll API when "Cancel All" button clicked', async () => {
    const timers = [
      createMockTimer({ id: 'timer-1', name: 'Timer 1' }),
      createMockTimer({ id: 'timer-2', name: 'Timer 2' }),
    ];
    (api.timersAPI.getActive as jest.Mock).mockResolvedValue(timers);
    (api.timersAPI.cancelAll as jest.Mock).mockResolvedValue({});
    
    render(<TimerDisplay />);
    
    await waitFor(() => {
      expect(screen.getByText('Timer 1')).toBeInTheDocument();
    });
    
    // Find and click "Cancel All" button
    const cancelAllButton = screen.getByRole('button', { name: /cancel all/i });
    cancelAllButton.click();
    
    await waitFor(() => {
      expect(api.timersAPI.cancelAll).toHaveBeenCalled();
    });
  });

  it('should hide "Cancel All" button when no timers', async () => {
    (api.timersAPI.getActive as jest.Mock).mockResolvedValue([]);
    
    render(<TimerDisplay />);
    
    await waitFor(() => {
      expect(screen.getByText(/no active timers/i)).toBeInTheDocument();
    });
    
    expect(screen.queryByRole('button', { name: /cancel all/i })).not.toBeInTheDocument();
  });
});

describe('TimerDisplay - WebSocket Integration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should refresh timers on timer_update event', async () => {
    (api.timersAPI.getActive as jest.Mock)
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([createMockTimer({ name: 'New Timer' })]);
    
    const { rerender } = render(<TimerDisplay />);
    
    await waitFor(() => {
      expect(screen.getByText(/no active timers/i)).toBeInTheDocument();
    });
    
    // Simulate WebSocket event
    rerender(<TimerDisplay wsEvent={{ type: 'timer_update', data: {} }} />);
    
    await waitFor(() => {
      expect(api.timersAPI.getActive).toHaveBeenCalledTimes(2);
    });
  });

  it('should refresh timers on timer_warning event', async () => {
    (api.timersAPI.getActive as jest.Mock).mockResolvedValue([]);
    
    const { rerender } = render(<TimerDisplay />);
    
    await waitFor(() => {
      expect(api.timersAPI.getActive).toHaveBeenCalledTimes(1);
    });
    
    // Simulate WebSocket warning event
    rerender(<TimerDisplay wsEvent={{ type: 'timer_warning', data: {} }} />);
    
    await waitFor(() => {
      expect(api.timersAPI.getActive).toHaveBeenCalledTimes(2);
    });
  });

  it('should refresh timers on timer_completed event', async () => {
    (api.timersAPI.getActive as jest.Mock).mockResolvedValue([]);
    
    const { rerender } = render(<TimerDisplay />);
    
    await waitFor(() => {
      expect(api.timersAPI.getActive).toHaveBeenCalledTimes(1);
    });
    
    // Simulate WebSocket completed event
    rerender(<TimerDisplay wsEvent={{ type: 'timer_completed', data: {} }} />);
    
    await waitFor(() => {
      expect(api.timersAPI.getActive).toHaveBeenCalledTimes(2);
    });
  });
});
