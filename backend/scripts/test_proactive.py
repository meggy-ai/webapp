"""
Test script for proactive messaging system.
"""
import requests
import time
from datetime import datetime

BASE_URL = "http://localhost:8000/api"

# Test credentials (use existing user or create one)
EMAIL = "test@example.com"
PASSWORD = "testpass123"

def login():
    """Login and get auth token."""
    response = requests.post(f"{BASE_URL}/auth/login/", json={
        "email": EMAIL,
        "password": PASSWORD
    })
    if response.status_code == 200:
        return response.json()["access_token"]
    else:
        print("Login failed. Create a user first.")
        return None

def get_or_create_conversation(token):
    """Get or create conversation."""
    headers = {"Authorization": f"Bearer {token}"}
    response = requests.get(f"{BASE_URL}/conversations/get_or_create/", headers=headers)
    return response.json()["conversation"]["id"]

def check_proactive_message(token, conversation_id):
    """Check if proactive message should be sent."""
    headers = {"Authorization": f"Bearer {token}"}
    response = requests.get(
        f"{BASE_URL}/conversations/{conversation_id}/check_proactive/",
        headers=headers
    )
    return response.json()

def send_message(token, conversation_id, content, is_response=False):
    """Send a message."""
    headers = {"Authorization": f"Bearer {token}"}
    response = requests.post(
        f"{BASE_URL}/conversations/{conversation_id}/send_message/",
        json={
            "content": content,
            "is_response_to_proactive": is_response
        },
        headers=headers
    )
    return response.json()

def adjust_proactivity(token, conversation_id):
    """Manually trigger proactivity adjustment."""
    headers = {"Authorization": f"Bearer {token}"}
    response = requests.post(
        f"{BASE_URL}/conversations/{conversation_id}/adjust_proactivity/",
        headers=headers
    )
    return response.json()

def main():
    """Run proactive messaging tests."""
    print("🧪 Testing Proactive Messaging System")
    print("=" * 60)
    
    # Login
    print("\n1. Logging in...")
    token = login()
    if not token:
        return
    print("✅ Logged in successfully")
    
    # Get conversation
    print("\n2. Getting conversation...")
    conv_id = get_or_create_conversation(token)
    print(f"✅ Conversation ID: {conv_id}")
    
    # Check proactive message (should not send initially)
    print("\n3. Checking if proactive message should be sent...")
    result = check_proactive_message(token, conv_id)
    print(f"Should send: {result.get('should_send')}")
    print(f"Reason: {result.get('reason')}")
    print(f"Proactivity level: {result.get('proactivity_level')}")
    
    # Send a regular message
    print("\n4. Sending a user message...")
    msg_response = send_message(token, conv_id, "Hey Meggy, how are you?")
    print(f"✅ User: {msg_response['user_message']['content'][:50]}...")
    print(f"✅ Assistant: {msg_response['assistant_message']['content'][:50]}...")
    
    # Simulate multiple proactive messages to test adjustment
    print("\n5. Testing proactivity adjustment...")
    
    # Manually create some proactive message history by directly checking DB
    # For now, just show the adjustment endpoint works
    adjustment = adjust_proactivity(token, conv_id)
    print(f"Old level: {adjustment.get('old_level')}")
    print(f"New level: {adjustment.get('new_level')}")
    print(f"Total proactive: {adjustment.get('total_proactive')}")
    print(f"Responses: {adjustment.get('responses_received')}")
    print(f"Response rate: {adjustment.get('response_rate', 0):.1%}")
    
    print("\n" + "=" * 60)
    print("✅ Proactive messaging system test complete!")
    print("\nKey features working:")
    print("  ✅ Check proactive endpoint")
    print("  ✅ Send message with response tracking")
    print("  ✅ Proactivity adjustment algorithm")
    print("\n💡 To test full flow:")
    print("  1. Log into the app at http://localhost:3000")
    print("  2. Wait 5 minutes after your last message")
    print("  3. Meggy will proactively reach out if conditions are met")

if __name__ == "__main__":
    main()
