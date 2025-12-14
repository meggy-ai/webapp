#!/usr/bin/env python
"""
Timer monitoring scheduler - runs the monitor_timers command every 30 seconds.
This should be run as a separate process alongside the Django server.
"""
import time
import subprocess
import sys
import os
from datetime import datetime

def run_monitor():
    """Run the monitor_timers management command."""
    try:
        result = subprocess.run(
            [sys.executable, 'manage.py', 'monitor_timers'],
            cwd=os.path.dirname(os.path.abspath(__file__)),
            capture_output=True,
            text=True,
            timeout=25  # Should complete well within 30 seconds
        )
        
        timestamp = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
        print(f"[{timestamp}] Timer check completed")
        
        if result.stdout:
            print(result.stdout)
        if result.stderr:
            print("Errors:", result.stderr, file=sys.stderr)
            
        return result.returncode == 0
    except subprocess.TimeoutExpired:
        print("Warning: Timer check timed out", file=sys.stderr)
        return False
    except Exception as e:
        print(f"Error running timer monitor: {e}", file=sys.stderr)
        return False

def main():
    """Main scheduler loop."""
    print("Timer monitoring scheduler started")
    print("Checking timers every 30 seconds...")
    print("Press Ctrl+C to stop\n")
    
    try:
        while True:
            run_monitor()
            time.sleep(30)  # Check every 30 seconds
    except KeyboardInterrupt:
        print("\nTimer monitoring scheduler stopped")
        sys.exit(0)

if __name__ == '__main__':
    main()
