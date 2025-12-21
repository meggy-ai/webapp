/**
 * Unit tests for TimerDisplay component
 * Tests rendering, timer creation dialog, display, and interactions
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@/tests/utils/test-utils';
import TimerDisplay from '@/components/chat/TimerDisplay';
import { mockTimers, createMockTimer } from '@/tests/fixtures/timer-data';
import * as api from '@/lib/api';

// Mock the API
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

describe('TimerDisplay - Rendering Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render "No active timers" message when empty', async () => {
    (api.timersAPI.getActive as jest.Mock).mockResolvedValue([]);
    
    render(<TimerDisplay />);
    
    await waitFor(() => {
      expect(screen.getByText(/no active timers/i)).toBeInTheDocument();
    });
  });

  it('should display "New Timer" button', async () => {
    (api.timersAPI.getActive as jest.Mock).mockResolvedValue([]);
    
    render(<TimerDisplay />);
    
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /new timer/i })).toBeInTheDocument();
    });
  });

  it('should show timer count badge when timers exist', async () => {
    const timers = [mockTimers.active10Min, mockTimers.active5Min, mockTimers.active2Min];
    (api.timersAPI.getActive as jest.Mock).mockResolvedValue(timers);
    
    render(<TimerDisplay />);
    
    await waitFor(() => {
      expect(screen.getByText('3')).toBeInTheDocument();
    });
  });

  it('should render all active timers in list', async () => {
    const timers = [mockTimers.active10Min, mockTimers.active5Min];
    (api.timersAPI.getActive as jest.Mock).mockResolvedValue(timers);
    
    render(<TimerDisplay />);
    
    await waitFor(() => {
      expect(screen.getByText('Focus Session')).toBeInTheDocument();
      expect(screen.getByText('Break Time')).toBeInTheDocument();
    });
  });
});

describe('TimerDisplay - Timer Creation Dialog Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (api.timersAPI.getActive as jest.Mock).mockResolvedValue([]);
  });

  it('should open dialog when clicking "New Timer" button', async () => {
    render(<TimerDisplay />);
    
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /new timer/i })).toBeInTheDocument();
    });
    
    fireEvent.click(screen.getByRole('button', { name: /new timer/i }));
    
    await waitFor(() => {
      expect(screen.getByText(/create new timer/i)).toBeInTheDocument();
    });
  });

  it('should have timer name input field', async () => {
    render(<TimerDisplay />);
    
    fireEvent.click(screen.getByRole('button', { name: /new timer/i }));
    
    await waitFor(() => {
      expect(screen.getByLabelText(/timer name/i)).toBeInTheDocument();
    });
  });

  it('should have duration input field (minutes)', async () => {
    render(<TimerDisplay />);
    
    fireEvent.click(screen.getByRole('button', { name: /new timer/i }));
    
    await waitFor(() => {
      const durationInput = screen.getByLabelText(/duration/i);
      expect(durationInput).toBeInTheDocument();
      expect(durationInput).toHaveAttribute('type', 'number');
    });
  });

  it('should validate timer name is not empty', async () => {
    (api.timersAPI.create as jest.Mock).mockResolvedValue(mockTimers.active10Min);
    
    render(<TimerDisplay />);
    
    fireEvent.click(screen.getByRole('button', { name: /new timer/i }));
    
    await waitFor(() => {
      expect(screen.getByLabelText(/timer name/i)).toBeInTheDocument();
    });
    
    // Try to create without name
    const createButton = screen.getByRole('button', { name: /^create timer$/i });
    expect(createButton).toBeDisabled();
  });

  it('should enable create button when name is provided', async () => {
    (api.timersAPI.create as jest.Mock).mockResolvedValue(mockTimers.active10Min);
    
    render(<TimerDisplay />);
    
    fireEvent.click(screen.getByRole('button', { name: /new timer/i }));
    
    await waitFor(() => {
      expect(screen.getByLabelText(/timer name/i)).toBeInTheDocument();
    });
    
    const nameInput = screen.getByLabelText(/timer name/i);
    fireEvent.change(nameInput, { target: { value: 'Test Timer' } });
    
    const createButton = screen.getByRole('button', { name: /^create timer$/i });
    expect(createButton).not.toBeDisabled();
  });

  it('should close dialog after successful creation', async () => {
    const newTimer = createMockTimer({ name: 'Test Timer', duration_seconds: 600 });
    (api.timersAPI.create as jest.Mock).mockResolvedValue(newTimer);
    (api.timersAPI.getActive as jest.Mock)
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([newTimer]);
    
    render(<TimerDisplay />);
    
    await waitFor(() => {
      fireEvent.click(screen.getByRole('button', { name: /new timer/i }));
    });
    
    await waitFor(() => {
      expect(screen.getByLabelText(/timer name/i)).toBeInTheDocument();
    });
    
    fireEvent.change(screen.getByLabelText(/timer name/i), { target: { value: 'Test Timer' } });
    fireEvent.change(screen.getByLabelText(/duration/i), { target: { value: '10' } });
    
    fireEvent.click(screen.getByRole('button', { name: /^create timer$/i }));
    
    await waitFor(() => {
      expect(screen.queryByText(/create new timer/i)).not.toBeInTheDocument();
    });
  });

  it('should show loading state while creating', async () => {
    const newTimer = createMockTimer({ name: 'Test Timer' });
    (api.timersAPI.create as jest.Mock).mockImplementation(
      () => new Promise(resolve => setTimeout(() => resolve(newTimer), 100))
    );
    
    render(<TimerDisplay />);
    
    await waitFor(() => {
      fireEvent.click(screen.getByRole('button', { name: /new timer/i }));
    });
    
    await waitFor(() => {
      expect(screen.getByLabelText(/timer name/i)).toBeInTheDocument();
    });
    
    fireEvent.change(screen.getByLabelText(/timer name/i), { target: { value: 'Test Timer' } });
    fireEvent.click(screen.getByRole('button', { name: /^create timer$/i }));
    
    expect(screen.getByText(/creating/i)).toBeInTheDocument();
  });

  it('should clear form after creation', async () => {
    const newTimer = createMockTimer({ name: 'Test Timer' });
    (api.timersAPI.create as jest.Mock).mockResolvedValue(newTimer);
    (api.timersAPI.getActive as jest.Mock)
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([newTimer]);
    
    render(<TimerDisplay />);
    
    await waitFor(() => {
      fireEvent.click(screen.getByRole('button', { name: /new timer/i }));
    });
    
    await waitFor(() => {
      expect(screen.getByLabelText(/timer name/i)).toBeInTheDocument();
    });
    
    fireEvent.change(screen.getByLabelText(/timer name/i), { target: { value: 'Test Timer' } });
    fireEvent.change(screen.getByLabelText(/duration/i), { target: { value: '25' } });
    fireEvent.click(screen.getByRole('button', { name: /^create timer$/i }));
    
    await waitFor(() => {
      expect(screen.queryByText(/create new timer/i)).not.toBeInTheDocument();
    });
    
    // Open dialog again and check if form is cleared
    fireEvent.click(screen.getByRole('button', { name: /new timer/i }));
    
    await waitFor(() => {
      const nameInput = screen.getByLabelText(/timer name/i) as HTMLInputElement;
      expect(nameInput.value).toBe('');
    });
  });
});

describe('TimerDisplay - Timer Display Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should display timer name', async () => {
    const timer = mockTimers.active10Min;
    (api.timersAPI.getActive as jest.Mock).mockResolvedValue([timer]);
    
    render(<TimerDisplay />);
    
    await waitFor(() => {
      expect(screen.getByText(timer.name)).toBeInTheDocument();
    });
  });

  it('should show countdown in HH:MM:SS format', async () => {
    const timer = mockTimers.active10Min;
    (api.timersAPI.getActive as jest.Mock).mockResolvedValue([timer]);
    
    render(<TimerDisplay />);
    
    await waitFor(() => {
      expect(screen.getByText(/00:10:00/)).toBeInTheDocument();
    });
  });

  it('should display progress bar', async () => {
    const timer = mockTimers.active10Min;
    (api.timersAPI.getActive as jest.Mock).mockResolvedValue([timer]);
    
    render(<TimerDisplay />);
    
    await waitFor(() => {
      // Progress bar should be present
      const progressBars = document.querySelectorAll('[class*="bg-gradient"]');
      expect(progressBars.length).toBeGreaterThan(0);
    });
  });

  it('should show pause button for active timers', async () => {
    const timer = mockTimers.active10Min;
    (api.timersAPI.getActive as jest.Mock).mockResolvedValue([timer]);
    
    render(<TimerDisplay />);
    
    await waitFor(() => {
      expect(screen.getByText(timer.name)).toBeInTheDocument();
    });
    
    // Check for pause icon/button (Lucide Pause icon)
    const buttons = screen.getAllByRole('button');
    const pauseButton = buttons.find(btn => 
      btn.querySelector('svg.lucide-pause') !== null
    );
    expect(pauseButton).toBeDefined();
  });

  it('should show play button for paused timers', async () => {
    const timer = mockTimers.paused;
    (api.timersAPI.getActive as jest.Mock).mockResolvedValue([timer]);
    
    render(<TimerDisplay />);
    
    await waitFor(() => {
      expect(screen.getByText(timer.name)).toBeInTheDocument();
    });
    
    // Check for play icon/button (Lucide Play icon)
    const buttons = screen.getAllByRole('button');
    const playButton = buttons.find(btn => 
      btn.querySelector('svg.lucide-play') !== null
    );
    expect(playButton).toBeDefined();
  });

  it('should show cancel button for all timers', async () => {
    const timer = mockTimers.active10Min;
    (api.timersAPI.getActive as jest.Mock).mockResolvedValue([timer]);
    
    render(<TimerDisplay />);
    
    await waitFor(() => {
      expect(screen.getByText(timer.name)).toBeInTheDocument();
    });
    
    // Check for X icon/button (Lucide X icon)
    const buttons = screen.getAllByRole('button');
    const cancelButton = buttons.find(btn => 
      btn.querySelector('svg.lucide-x') !== null
    );
    expect(cancelButton).toBeDefined();
  });

  it('should display timer status (Running/Paused)', async () => {
    const activeTimer = mockTimers.active10Min;
    const pausedTimer = mockTimers.paused;
    (api.timersAPI.getActive as jest.Mock).mockResolvedValue([activeTimer, pausedTimer]);
    
    render(<TimerDisplay />);
    
    await waitFor(() => {
      expect(screen.getByText('Running')).toBeInTheDocument();
      expect(screen.getByText('Paused')).toBeInTheDocument();
    });
  });

  it('should show total duration', async () => {
    const timer = mockTimers.active10Min;
    (api.timersAPI.getActive as jest.Mock).mockResolvedValue([timer]);
    
    render(<TimerDisplay />);
    
    await waitFor(() => {
      expect(screen.getByText(/Total: 00:10:00/)).toBeInTheDocument();
    });
  });
});
