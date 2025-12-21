"""
Unit tests for TimerAbility.
"""
import pytest
from unittest.mock import AsyncMock, MagicMock, patch, call
from asgiref.sync import sync_to_async
from core.bruno_integration.timer_ability import TimerAbility
from apps.accounts.models import User
from apps.chat.models import Timer
from django.utils import timezone
from datetime import timedelta


@pytest.mark.django_db
@pytest.mark.asyncio
class TestTimerAbilityCommandParsing:
    """Test timer command parsing."""
    
    @pytest.fixture
    def timer_ability(self):
        """Create TimerAbility instance."""
        return TimerAbility()
    
    async def test_parse_set_timer_command(self, timer_ability):
        """Test parsing 'set a timer for 5 minutes'."""
        result = await timer_ability._parse_timer_command("set a timer for 5 minutes")
        
        assert result['action'] == 'create'
        assert result['duration_minutes'] == 5
        assert result['timer_name'] == '5 minute timer'
    
    async def test_parse_timer_for_command(self, timer_ability):
        """Test parsing 'timer for 3 mins'."""
        result = await timer_ability._parse_timer_command("timer for 3 mins")
        
        assert result['action'] == 'create'
        assert result['duration_minutes'] == 3
        assert result['timer_name'] == '3 minute timer'
    
    async def test_parse_minute_timer_command(self, timer_ability):
        """Test parsing '10 minute timer'."""
        result = await timer_ability._parse_timer_command("10 minute timer")
        
        assert result['action'] == 'create'
        assert result['duration_minutes'] == 10
        assert result['timer_name'] == '10 minute timer'
    
    async def test_parse_remind_me_command(self, timer_ability):
        """Test parsing 'remind me in 15 minutes'."""
        result = await timer_ability._parse_timer_command("remind me in 15 minutes")
        
        assert result['action'] == 'create'
        assert result['duration_minutes'] == 15
        assert result['timer_name'] == '15 minute timer'
    
    async def test_parse_cancel_all_command(self, timer_ability):
        """Test parsing 'cancel all timers'."""
        result = await timer_ability._parse_timer_command("cancel all timers")
        
        assert result['action'] == 'cancel_all'
        assert result['duration_minutes'] is None
        assert result['timer_name'] is None
    
    async def test_parse_cancel_specific_command(self, timer_ability):
        """Test parsing 'cancel timer workout'."""
        result = await timer_ability._parse_timer_command("cancel timer workout")
        
        assert result['action'] == 'cancel'
        assert result['timer_name'] == 'workout'
    
    async def test_parse_non_timer_command(self, timer_ability):
        """Return action='none' for non-timer text."""
        result = await timer_ability._parse_timer_command("what is the weather today?")
        
        assert result['action'] == 'none'
    
    async def test_parse_timer_with_custom_name(self, timer_ability):
        """Extract custom name from command."""
        result = await timer_ability._parse_timer_command("set timer for 5 minutes coffee")
        
        assert result['action'] == 'create'
        assert result['duration_minutes'] == 5
        assert 'coffee' in result['timer_name'].lower()


@pytest.mark.django_db(transaction=True)
@pytest.mark.asyncio
class TestTimerAbilityCreation:
    """Test timer creation functionality."""
    
    @pytest.fixture
    def timer_ability(self):
        """Create TimerAbility instance."""
        return TimerAbility()
    
    async def test_create_timer_success(self, timer_ability, test_user):
        """Test successful timer creation."""
        with patch.object(timer_ability, '_send_timer_websocket_update', new_callable=AsyncMock):
            response = await timer_ability._create_timer(
                user_id=str(test_user.id),
                duration_minutes=5,
                timer_name='Test Timer'
            )
        
        assert '✅' in response
        assert 'Test Timer' in response
        assert '5 minute' in response
        
        # Verify timer created in database
        timer = await sync_to_async(Timer.objects.filter(user=test_user, name='Test Timer').first)()
        assert timer is not None
        assert timer.duration_seconds == 300
        assert timer.status == 'active'
    
    async def test_create_timer_with_custom_name(self, timer_ability, test_user):
        """Test creating timer with custom name."""
        with patch.object(timer_ability, '_send_timer_websocket_update', new_callable=AsyncMock):
            response = await timer_ability._create_timer(
                user_id=str(test_user.id),
                duration_minutes=10,
                timer_name='Workout Session'
            )
        
        assert '✅' in response
        assert 'Workout Session' in response
        
        timer = await sync_to_async(Timer.objects.filter(user=test_user, name='Workout Session').first)()
        assert timer is not None
    
    async def test_create_timer_sends_websocket(self, timer_ability, test_user):
        """Verify WebSocket notification sent."""
        with patch.object(timer_ability, '_send_timer_websocket_update', new_callable=AsyncMock) as mock_websocket:
            await timer_ability._create_timer(
                user_id=str(test_user.id),
                duration_minutes=5,
                timer_name='Test Timer'
            )
            
            # Verify WebSocket was called
            assert mock_websocket.called
    
    async def test_create_timer_invalid_duration_zero(self, timer_ability, test_user):
        """Reject invalid duration (0)."""
        response = await timer_ability._create_timer(
            user_id=str(test_user.id),
            duration_minutes=0,
            timer_name='Invalid Timer'
        )
        
        assert 'valid duration' in response.lower() or 'specify' in response.lower()
    
    async def test_create_timer_invalid_duration_negative(self, timer_ability, test_user):
        """Reject negative duration."""
        response = await timer_ability._create_timer(
            user_id=str(test_user.id),
            duration_minutes=-5,
            timer_name='Invalid Timer'
        )
        
        assert 'valid duration' in response.lower() or 'specify' in response.lower()
    
    async def test_create_timer_exceeds_max_duration(self, timer_ability, test_user):
        """Reject duration > 24 hours (1440 minutes)."""
        response = await timer_ability._create_timer(
            user_id=str(test_user.id),
            duration_minutes=1500,  # More than 24 hours
            timer_name='Too Long Timer'
        )
        
        assert '❌' in response or 'exceed' in response.lower() or '24 hour' in response.lower()


@pytest.mark.django_db(transaction=True)
@pytest.mark.asyncio
class TestTimerAbilityCancellation:
    """Test timer cancellation functionality."""
    
    @pytest.fixture
    def timer_ability(self):
        """Create TimerAbility instance."""
        return TimerAbility()
    
    async def test_cancel_all_timers_success(self, timer_ability, test_user, active_timer):
        """Cancel all active timers."""
        # Create additional timer
        await sync_to_async(Timer.objects.create)(
            user=test_user,
            name='Timer 2',
            duration_seconds=300,
            end_time=timezone.now() + timedelta(seconds=300),
            status='active'
        )
        
        with patch.object(timer_ability, '_send_timer_websocket_update', new_callable=AsyncMock):
            response = await timer_ability._cancel_all_timers(str(test_user.id))
        
        assert '✅' in response or 'cancelled' in response.lower()
        
        # Verify all timers cancelled
        active_count = await sync_to_async(Timer.objects.filter(user=test_user, status='active').count)()
        assert active_count == 0
    
    async def test_cancel_all_timers_none_active(self, timer_ability, test_user):
        """Handle no active timers."""
        response = await timer_ability._cancel_all_timers(str(test_user.id))
        
        assert 'no active' in response.lower() or 'cancel' in response.lower()
    
    async def test_cancel_specific_timer_by_name(self, timer_ability, test_user):
        """Cancel timer by name match."""
        # Create timer with specific name
        await sync_to_async(Timer.objects.create)(
            user=test_user,
            name='Workout Timer',
            duration_seconds=300,
            end_time=timezone.now() + timedelta(seconds=300),
            status='active'
        )
        
        with patch.object(timer_ability, '_send_timer_websocket_update', new_callable=AsyncMock):
            response = await timer_ability._cancel_timer(str(test_user.id), 'workout')
        
        assert '✅' in response or 'cancelled' in response.lower()
        assert 'Workout Timer' in response or 'workout' in response.lower()
        
        # Verify timer cancelled
        timer = await sync_to_async(Timer.objects.get)(user=test_user, name='Workout Timer')
        assert timer.status == 'cancelled'
    
    async def test_cancel_specific_timer_not_found(self, timer_ability, test_user):
        """Handle timer not found."""
        response = await timer_ability._cancel_timer(str(test_user.id), 'nonexistent')
        
        assert 'not found' in response.lower() or 'no active' in response.lower()
    
    async def test_cancel_timer_sends_websocket(self, timer_ability, test_user, active_timer):
        """Verify WebSocket notification."""
        with patch.object(timer_ability, '_send_timer_websocket_update', new_callable=AsyncMock) as mock_websocket:
            await timer_ability._cancel_timer(str(test_user.id), None)
            
            # Verify WebSocket was called
            assert mock_websocket.called


@pytest.mark.django_db(transaction=True)
@pytest.mark.asyncio
class TestTimerAbilityListing:
    """Test timer listing functionality."""
    
    @pytest.fixture
    def timer_ability(self):
        """Create TimerAbility instance."""
        return TimerAbility()
    
    async def test_list_active_timers(self, timer_ability, test_user, active_timer, paused_timer):
        """List all active/paused timers."""
        response = await timer_ability._list_timers(str(test_user.id))
        
        assert ('📋' in response or 'active' in response.lower()) and 'failed' not in response.lower()
        assert 'Active Timer' in response
        assert 'Paused Timer' in response
    
    async def test_list_timers_none_active(self, timer_ability, test_user):
        """Handle empty timer list."""
        response = await timer_ability._list_timers(str(test_user.id))
        
        assert 'no active' in response.lower() or '📋' in response


@pytest.mark.django_db
class TestTimerAbilityNameExtraction:
    """Test timer name extraction."""
    
    @pytest.fixture
    def timer_ability(self):
        """Create TimerAbility instance."""
        return TimerAbility()
    
    def test_extract_timer_name_with_text(self, timer_ability):
        """Extract 'workout' from command."""
        name = timer_ability._extract_timer_name("set timer for 5 minutes workout", 5)
        
        assert 'workout' in name.lower()
    
    def test_extract_timer_name_default(self, timer_ability):
        """Generate default name when none provided."""
        name = timer_ability._extract_timer_name("set a timer for 10 minutes", 10)
        
        assert '10 minute timer' == name.lower()
    
    def test_extract_timer_name_complex(self, timer_ability):
        """Extract name from complex command."""
        name = timer_ability._extract_timer_name("coffee timer for 5 mins", 5)
        
        assert 'coffee' in name.lower()


@pytest.mark.django_db(transaction=True)
@pytest.mark.asyncio
class TestTimerAbilityIntegration:
    """Integration tests for handle_timer_command - full flow."""
    
    @pytest.fixture
    def timer_ability(self):
        """Create TimerAbility instance."""
        return TimerAbility()
    
    async def test_handle_timer_command_cancel_all(self, timer_ability, test_user):
        """Test full flow of 'cancel all timers' message."""
        # Create multiple active timers
        await sync_to_async(Timer.objects.create)(
            user=test_user,
            name='Timer 1',
            duration_seconds=300,
            end_time=timezone.now() + timedelta(seconds=300),
            status='active'
        )
        await sync_to_async(Timer.objects.create)(
            user=test_user,
            name='Timer 2',
            duration_seconds=600,
            end_time=timezone.now() + timedelta(seconds=600),
            status='active'
        )
        
        # Verify timers exist
        count_before = await sync_to_async(Timer.objects.filter(user=test_user, status='active').count)()
        assert count_before == 2
        
        # Send command through handle_timer_command
        with patch.object(timer_ability, '_send_timer_websocket_update', new_callable=AsyncMock):
            response = await timer_ability.handle_timer_command(
                user_id=str(test_user.id),
                conversation_id='test-conv',
                command='cancel all timers'
            )
        
        # Verify response
        assert response is not None
        assert '✅' in response or 'cancelled' in response.lower()
        assert '2' in response
        
        # Verify timers are cancelled in database
        active_count = await sync_to_async(Timer.objects.filter(user=test_user, status='active').count)()
        cancelled_count = await sync_to_async(Timer.objects.filter(user=test_user, status='cancelled').count)()
        
        assert active_count == 0
        assert cancelled_count == 2
    
    async def test_handle_timer_command_create(self, timer_ability, test_user):
        """Test full flow of creating timer through message."""
        with patch.object(timer_ability, '_send_timer_websocket_update', new_callable=AsyncMock):
            response = await timer_ability.handle_timer_command(
                user_id=str(test_user.id),
                conversation_id='test-conv',
                command='set a timer for 5 minutes'
            )
        
        # Verify response
        assert response is not None
        assert '✅' in response
        assert '5 minute' in response
        
        # Verify timer created in database
        timer = await sync_to_async(Timer.objects.filter(user=test_user, status='active').first)()
        assert timer is not None
        assert timer.duration_seconds == 300
    
    async def test_handle_timer_command_non_timer_message(self, timer_ability, test_user):
        """Verify non-timer messages return None."""
        response = await timer_ability.handle_timer_command(
            user_id=str(test_user.id),
            conversation_id='test-conv',
            command='how is the weather today?'
        )
        
        # Should return None for non-timer commands
        assert response is None
    
    async def test_handle_timer_command_cancel_all_variations(self, timer_ability, test_user):
        """Test various cancel all command phrasings."""
        # Create a timer
        await sync_to_async(Timer.objects.create)(
            user=test_user,
            name='Test Timer',
            duration_seconds=300,
            end_time=timezone.now() + timedelta(seconds=300),
            status='active'
        )
        
        # Test different phrasings
        commands = [
            'cancel all timers',
            'stop all timers',
            'delete all timers',
            'clear all timers',
        ]
        
        for i, command in enumerate(commands):
            # Recreate timer for each test
            if i > 0:
                await sync_to_async(Timer.objects.create)(
                    user=test_user,
                    name=f'Test Timer {i}',
                    duration_seconds=300,
                    end_time=timezone.now() + timedelta(seconds=300),
                    status='active'
                )
            
            with patch.object(timer_ability, '_send_timer_websocket_update', new_callable=AsyncMock):
                response = await timer_ability.handle_timer_command(
                    user_id=str(test_user.id),
                    conversation_id='test-conv',
                    command=command
                )
            
            # Verify it worked
            assert response is not None, f"Command '{command}' returned None"
            assert 'cancelled' in response.lower() or '✅' in response, f"Command '{command}' didn't cancel: {response}"
            
            # Verify timer was cancelled
            active_count = await sync_to_async(Timer.objects.filter(user=test_user, status='active').count)()
            assert active_count == 0, f"Command '{command}' didn't cancel timer in database"
