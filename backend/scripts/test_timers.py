"""
Test script for timer functionality
"""
import requests
import time
import json

API_URL = "http://localhost:8000/api"

def login():
    """Login and get access token"""
    response = requests.post(f"{API_URL}/auth/login/", json={
        "email": "test@example.com",
        "password": "Test1234!"
    })
    if response.status_code == 200:
        data = response.json()
        return data['access_token']
    else:
        print(f"Login failed: {response.status_code}")
        print(response.text)
        return None

def create_timer(token, name, duration_seconds):
    """Create a new timer"""
    headers = {"Authorization": f"Bearer {token}"}
    response = requests.post(
        f"{API_URL}/timers/",
        headers=headers,
        json={
            "name": name,
            "duration_seconds": duration_seconds
        }
    )
    if response.status_code in [200, 201]:
        print(f"Timer created: {response.json()}")
        return response.json()
    else:
        print(f"Failed to create timer: {response.status_code}")
        print(response.text)
        return None

def get_active_timers(token):
    """Get all active timers"""
    headers = {"Authorization": f"Bearer {token}"}
    response = requests.get(f"{API_URL}/timers/active/", headers=headers)
    if response.status_code == 200:
        timers = response.json()
        print(f"\nActive timers: {len(timers)}")
        for timer in timers:
            print(f"  - {timer['name']}: {timer['time_remaining_display']} remaining")
        return timers
    else:
        print(f"Failed to get timers: {response.status_code}")
        return []

def pause_timer(token, timer_id):
    """Pause a timer"""
    headers = {"Authorization": f"Bearer {token}"}
    response = requests.post(f"{API_URL}/timers/{timer_id}/pause/", headers=headers)
    if response.status_code == 200:
        print(f"Timer paused: {response.json()}")
        return True
    else:
        print(f"Failed to pause timer: {response.status_code}")
        return False

def resume_timer(token, timer_id):
    """Resume a timer"""
    headers = {"Authorization": f"Bearer {token}"}
    response = requests.post(f"{API_URL}/timers/{timer_id}/resume/", headers=headers)
    if response.status_code == 200:
        print(f"Timer resumed: {response.json()}")
        return True
    else:
        print(f"Failed to resume timer: {response.status_code}")
        return False

def cancel_timer(token, timer_id):
    """Cancel a timer"""
    headers = {"Authorization": f"Bearer {token}"}
    response = requests.post(f"{API_URL}/timers/{timer_id}/cancel/", headers=headers)
    if response.status_code == 200:
        print(f"Timer cancelled: {response.json()}")
        return True
    else:
        print(f"Failed to cancel timer: {response.status_code}")
        return False

def main():
    print("=== Timer API Test ===\n")
    
    # Login
    print("1. Logging in...")
    token = login()
    if not token:
        print("Cannot proceed without authentication")
        return
    
    print("✓ Logged in successfully\n")
    
    # Create a test timer (2 minutes)
    print("2. Creating a 2-minute test timer...")
    timer = create_timer(token, "Test Timer", 120)
    if not timer:
        print("Failed to create timer")
        return
    
    timer_id = timer['id']
    print(f"✓ Timer created with ID: {timer_id}\n")
    
    # Get active timers
    print("3. Fetching active timers...")
    get_active_timers(token)
    
    # Wait a bit
    print("\nWaiting 3 seconds...")
    time.sleep(3)
    
    # Check timer again
    print("\n4. Checking timer after 3 seconds...")
    get_active_timers(token)
    
    # Pause timer
    print("\n5. Pausing timer...")
    pause_timer(token, timer_id)
    
    print("\nWaiting 2 seconds...")
    time.sleep(2)
    
    # Check paused timer
    print("\n6. Checking paused timer...")
    get_active_timers(token)
    
    # Resume timer
    print("\n7. Resuming timer...")
    resume_timer(token, timer_id)
    
    print("\nWaiting 2 seconds...")
    time.sleep(2)
    
    # Check resumed timer
    print("\n8. Checking resumed timer...")
    get_active_timers(token)
    
    # Cancel timer
    print("\n9. Cancelling timer...")
    cancel_timer(token, timer_id)
    
    # Final check
    print("\n10. Final check of active timers...")
    get_active_timers(token)
    
    print("\n=== Test Complete ===")

if __name__ == "__main__":
    main()
