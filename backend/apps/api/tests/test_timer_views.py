"""
Unit tests for Timer API Views.
"""
import pytest
from rest_framework.test import APIClient
from rest_framework import status
from apps.accounts.models import User
from apps.chat.models import Timer, Conversation
from apps.agents.models import Agent
from django.utils import timezone
from datetime import timedelta
from unittest.mock import patch


@pytest.mark.django_db
class TestTimerViewSetList:
    """Test listing and retrieving timers."""
    
    @pytest.fixture
    def api_client(self):
        """Create API client."""
        return APIClient()
    
    @pytest.fixture
    def authenticated_client(self, api_client, test_user):
        """API client with authentication."""
        api_client.force_authenticate(user=test_user)
        return api_client
    
    def test_list_timers_authenticated(self, authenticated_client, active_timer):
        """Test listing timers as authenticated user."""
        response = authenticated_client.get('/api/timers/')
        
        assert response.status_code == status.HTTP_200_OK
        # Response is paginated or list
        data = response.data if isinstance(response.data, list) else response.data.get('results', [])
        assert len(data) >= 1
        # Find the timer in response
        timer_found = any(t['name'] == 'Active Timer' for t in data)
        assert timer_found
    
    def test_list_timers_unauthenticated(self, api_client):
        """Test listing timers without authentication."""
        response = api_client.get('/api/timers/')
        
        assert response.status_code == status.HTTP_401_UNAUTHORIZED
    
    def test_list_timers_filters_by_user(self, authenticated_client, test_user, test_user2, active_timer):
        """Only show user's own timers."""
        # Create timer for another user
        Timer.objects.create(
            user=test_user2,
            name='Other User Timer',
            duration_seconds=300,
            end_time=timezone.now() + timedelta(seconds=300),
            status='active'
        )
        
        response = authenticated_client.get('/api/timers/')
        
        assert response.status_code == status.HTTP_200_OK
        # Response is paginated or list
        data = response.data if isinstance(response.data, list) else response.data.get('results', [])
        # Should not see other user's timer
        for timer in data:
            assert timer['name'] != 'Other User Timer'
    
    def test_retrieve_timer_by_id(self, authenticated_client, active_timer):
        """Get specific timer by ID."""
        response = authenticated_client.get(f'/api/timers/{active_timer.id}/')
        
        assert response.status_code == status.HTTP_200_OK
        assert response.data['id'] == str(active_timer.id)
        assert response.data['name'] == 'Active Timer'
    
    def test_get_active_timers_only(self, authenticated_client, test_user, active_timer, cancelled_timer):
        """Filter active/paused timers."""
        response = authenticated_client.get('/api/timers/active/')
        
        assert response.status_code == status.HTTP_200_OK
        # Should only include active/paused, not cancelled
        timer_names = [t['name'] for t in response.data]
        assert 'Active Timer' in timer_names
        assert 'Cancelled Timer' not in timer_names


@pytest.mark.django_db
class TestTimerViewSetCreate:
    """Test timer creation via API."""
    
    @pytest.fixture
    def api_client(self):
        """Create API client."""
        return APIClient()
    
    @pytest.fixture
    def authenticated_client(self, api_client, test_user):
        """API client with authentication."""
        api_client.force_authenticate(user=test_user)
        return api_client
    
    @patch('asgiref.sync.async_to_sync')
    def test_create_timer_via_api(self, mock_async, authenticated_client):
        """Test creating timer via API."""
        data = {
            'name': 'API Timer',
            'duration_seconds': 600
        }
        response = authenticated_client.post('/api/timers/', data)
        
        assert response.status_code == status.HTTP_201_CREATED
        assert response.data['name'] == 'API Timer'
        assert response.data['duration_seconds'] == 600
        assert response.data['status'] == 'active'
    
    def test_create_timer_invalid_data(self, authenticated_client):
        """Reject invalid duration."""
        data = {
            'name': 'Invalid Timer',
            # Missing duration_seconds
        }
        response = authenticated_client.post('/api/timers/', data)
        
        assert response.status_code == status.HTTP_400_BAD_REQUEST
    
    @patch('apps.api.views.async_to_sync')
    def test_create_timer_sends_websocket(self, mock_async, authenticated_client):
        """Verify WebSocket sent."""
        data = {
            'name': 'WS Timer',
            'duration_seconds': 300
        }
        response = authenticated_client.post('/api/timers/', data)
        
        assert response.status_code == status.HTTP_201_CREATED
        # Verify WebSocket was called
        assert mock_async.called


@pytest.mark.django_db
class TestTimerViewSetControls:
    """Test timer control actions (pause, resume, cancel)."""
    
    @pytest.fixture
    def api_client(self):
        """Create API client."""
        return APIClient()
    
    @pytest.fixture
    def authenticated_client(self, api_client, test_user):
        """API client with authentication."""
        api_client.force_authenticate(user=test_user)
        return api_client
    
    @patch('asgiref.sync.async_to_sync')
    def test_pause_timer(self, mock_async, authenticated_client, active_timer):
        """POST /api/timers/{id}/pause/."""
        response = authenticated_client.post(f'/api/timers/{active_timer.id}/pause/')
        
        assert response.status_code == status.HTTP_200_OK
        assert response.data['status'] == 'paused'
        
        # Verify in database
        active_timer.refresh_from_db()
        assert active_timer.status == 'paused'
    
    @patch('asgiref.sync.async_to_sync')
    def test_resume_timer(self, mock_async, authenticated_client, paused_timer):
        """POST /api/timers/{id}/resume/."""
        response = authenticated_client.post(f'/api/timers/{paused_timer.id}/resume/')
        
        assert response.status_code == status.HTTP_200_OK
        assert response.data['status'] == 'active'
        
        # Verify in database
        paused_timer.refresh_from_db()
        assert paused_timer.status == 'active'
    
    @patch('asgiref.sync.async_to_sync')
    def test_cancel_timer(self, mock_async, authenticated_client, active_timer):
        """POST /api/timers/{id}/cancel/."""
        response = authenticated_client.post(f'/api/timers/{active_timer.id}/cancel/')
        
        assert response.status_code == status.HTTP_200_OK
        assert response.data['status'] == 'cancelled'
        
        # Verify in database
        active_timer.refresh_from_db()
        assert active_timer.status == 'cancelled'
    
    @patch('asgiref.sync.async_to_sync')
    def test_cancel_all_timers(self, mock_async, authenticated_client, test_user):
        """POST /api/timers/cancel_all/ - Cancel all active and paused timers."""
        # Create multiple timers
        Timer.objects.create(
            user=test_user,
            name='Timer 1',
            duration_seconds=300,
            end_time=timezone.now() + timedelta(seconds=300),
            status='active'
        )
        Timer.objects.create(
            user=test_user,
            name='Timer 2',
            duration_seconds=600,
            end_time=timezone.now() + timedelta(seconds=600),
            status='paused'
        )
        Timer.objects.create(
            user=test_user,
            name='Already Cancelled',
            duration_seconds=300,
            end_time=timezone.now() - timedelta(seconds=100),
            status='cancelled'
        )
        
        response = authenticated_client.post('/api/timers/cancel_all/')
        
        assert response.status_code == status.HTTP_200_OK
        assert response.data['count'] == 2  # Only active and paused
        assert 'message' in response.data
        
        # Verify in database - active and paused should be cancelled
        active_count = Timer.objects.filter(user=test_user, status='active').count()
        paused_count = Timer.objects.filter(user=test_user, status='paused').count()
        cancelled_count = Timer.objects.filter(user=test_user, status='cancelled').count()
        
        assert active_count == 0
        assert paused_count == 0
        assert cancelled_count == 3  # 2 newly cancelled + 1 already cancelled
    
    @patch('asgiref.sync.async_to_sync')
    def test_cancel_all_timers_when_none_active(self, mock_async, authenticated_client, test_user):
        """POST /api/timers/cancel_all/ with no active timers."""
        response = authenticated_client.post('/api/timers/cancel_all/')
        
        assert response.status_code == status.HTTP_200_OK
        assert response.data['count'] == 0
    
    @patch('apps.api.views.async_to_sync')
    def test_cancel_all_sends_websocket(self, mock_async, authenticated_client, test_user):
        """Verify WebSocket notification sent when cancelling all."""
        Timer.objects.create(
            user=test_user,
            name='Timer to Cancel',
            duration_seconds=300,
            end_time=timezone.now() + timedelta(seconds=300),
            status='active'
        )
        
        response = authenticated_client.post('/api/timers/cancel_all/')
        
        assert response.status_code == status.HTTP_200_OK
        assert response.data['count'] == 1
        # Verify WebSocket was called (it's called in the view)
        assert mock_async.called


@pytest.mark.django_db
class TestTimerViewSetErrors:
    """Test error handling."""
    
    @pytest.fixture
    def api_client(self):
        """Create API client."""
        return APIClient()
    
    @pytest.fixture
    def authenticated_client(self, api_client, test_user):
        """API client with authentication."""
        api_client.force_authenticate(user=test_user)
        return api_client
    
    def test_pause_already_paused_timer(self, authenticated_client, paused_timer):
        """Return 400 error."""
        response = authenticated_client.post(f'/api/timers/{paused_timer.id}/pause/')
        
        assert response.status_code == status.HTTP_400_BAD_REQUEST
        assert 'error' in response.data
    
    def test_resume_active_timer(self, authenticated_client, active_timer):
        """Return 400 error."""
        response = authenticated_client.post(f'/api/timers/{active_timer.id}/resume/')
        
        assert response.status_code == status.HTTP_400_BAD_REQUEST
        assert 'error' in response.data
    
    def test_timer_not_found(self, authenticated_client):
        """Return 404 error."""
        fake_uuid = '00000000-0000-0000-0000-000000000000'
        response = authenticated_client.get(f'/api/timers/{fake_uuid}/')
        
        assert response.status_code == status.HTTP_404_NOT_FOUND
