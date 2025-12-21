"""
Test script for Bruno PA API endpoints.
Run this script to test authentication and basic API functionality.

These are integration tests that require a running server.
Skip them in pytest by default.
"""

import pytest
import requests
import json

BASE_URL = "http://127.0.0.1:8000/api"

pytestmark = pytest.mark.integration

def print_response(response):
    """Pretty print response."""
    print(f"Status Code: {response.status_code}")
    try:
        print(json.dumps(response.json(), indent=2))
    except:
        print(response.text)
    print("-" * 80)

@pytest.fixture(scope="module")
def auth_tokens():
    """Get authentication tokens for testing."""
    # Try to register
    data = {
        "email": "test@example.com",
        "name": "Test User",
        "password": "testpassword123"
    }
    response = requests.post(f"{BASE_URL}/auth/register/", json=data)
    
    if response.status_code == 201:
        return response.json()
    
    # If registration fails (user exists), try login
    login_data = {
        "email": "test@example.com",
        "password": "testpassword123"
    }
    response = requests.post(f"{BASE_URL}/auth/login/", json=login_data)
    if response.status_code == 200:
        return response.json()
    
    pytest.fail("Could not authenticate for tests")

@pytest.fixture(scope="module")
def access_token(auth_tokens):
    """Get access token."""
    return auth_tokens['access_token']

@pytest.fixture(scope="module")
def refresh_token(auth_tokens):
    """Get refresh token."""
    return auth_tokens['refresh_token']

def test_register():
    """Test user registration."""
    print("\n=== Testing Registration ===")
    data = {
        "email": "test@example.com",
        "name": "Test User",
        "password": "testpassword123"
    }
    response = requests.post(f"{BASE_URL}/auth/register/", json=data)
    print_response(response)
    
    if response.status_code == 201:
        return response.json()
    return None

def test_login():
    """Test user login."""
    print("\n=== Testing Login ===")
    data = {
        "email": "test@example.com",
        "password": "testpassword123"
    }
    response = requests.post(f"{BASE_URL}/auth/login/", json=data)
    print_response(response)
    
    assert response.status_code == 200
    assert 'access_token' in response.json()
    assert 'refresh_token' in response.json()

def test_me(access_token):
    """Test getting current user info."""
    print("\n=== Testing /users/me/ ===")
    headers = {"Authorization": f"Bearer {access_token}"}
    response = requests.get(f"{BASE_URL}/users/me/", headers=headers)
    print_response(response)

def test_agents(access_token):
    """Test agents endpoints."""
    print("\n=== Testing Agents ===")
    headers = {"Authorization": f"Bearer {access_token}"}
    
    # Get default agent
    print("Getting default agent...")
    response = requests.get(f"{BASE_URL}/agents/default/", headers=headers)
    print_response(response)
    
    # List agents
    print("Listing all agents...")
    response = requests.get(f"{BASE_URL}/agents/", headers=headers)
    print_response(response)

def test_conversations(access_token):
    """Test conversations endpoints."""
    print("\n=== Testing Conversations ===")
    headers = {"Authorization": f"Bearer {access_token}"}
    
    # First, get or create an agent
    agent_response = requests.get(f"{BASE_URL}/agents/default/", headers=headers)
    if agent_response.status_code != 200:
        print("Could not get default agent")
        return
    
    agent_id = agent_response.json()['id']
    
    # Create a conversation
    print("Creating conversation...")
    data = {
        "agent": agent_id,
        "title": "Test Conversation"
    }
    response = requests.post(f"{BASE_URL}/conversations/", json=data, headers=headers)
    print_response(response)
    
    if response.status_code == 201:
        conversation_id = response.json()['id']
        
        # Send a message
        print(f"Sending message to conversation {conversation_id}...")
        message_data = {
            "content": "Hello Bruno! How are you?"
        }
        response = requests.post(
            f"{BASE_URL}/conversations/{conversation_id}/send_message/",
            json=message_data,
            headers=headers
        )
        print_response(response)

def test_refresh_token(refresh_token):
    """Test refreshing access token."""
    print("\n=== Testing Token Refresh ===")
    data = {
        "refresh_token": refresh_token
    }
    response = requests.post(f"{BASE_URL}/auth/refresh/", json=data)
    print_response(response)
    
    assert response.status_code == 200
    assert 'access_token' in response.json()

def main():
    print("=" * 80)
    print("Bruno PA API Test Suite")
    print("=" * 80)
    
    # Test registration
    register_data = test_register()
    
    if not register_data:
        # If registration fails (user might already exist), try login
        login_data = test_login()
        if not login_data:
            print("❌ Authentication failed. Cannot proceed with tests.")
            return
        access_token = login_data['access_token']
        refresh_token = login_data['refresh_token']
    else:
        access_token = register_data['access_token']
        refresh_token = register_data['refresh_token']
    
    print(f"\n✅ Authenticated successfully!")
    print(f"Access Token: {access_token[:50]}...")
    
    # Test authenticated endpoints
    test_me(access_token)
    test_agents(access_token)
    test_conversations(access_token)
    
    # Test token refresh
    new_access_token = test_refresh_token(refresh_token)
    if new_access_token:
        print(f"\n✅ Token refresh successful!")
        print(f"New Access Token: {new_access_token[:50]}...")
    
    print("\n" + "=" * 80)
    print("✅ All tests completed!")
    print("=" * 80)

if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        print("\n\nTests interrupted by user.")
    except Exception as e:
        print(f"\n❌ Error: {e}")
        import traceback
        traceback.print_exc()
