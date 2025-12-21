"""
Timer ability for Bruno - Manage user timers
"""
import re
import logging
from typing import Dict, Any, Optional
from asgiref.sync import sync_to_async
from django.utils import timezone
from datetime import timedelta

logger = logging.getLogger(__name__)


class TimerAbility:
    """Manages timer functionality for Bruno."""
    
    def __init__(self):
        from apps.chat.models import Timer
        from channels.layers import get_channel_layer
        self.Timer = Timer
        self.channel_layer = get_channel_layer()
        logger.info("Initialized TimerAbility")
    
    async def handle_timer_command(
        self,
        user_id: str,
        conversation_id: str, 
        command: str
    ) -> Optional[str]:
        """
        Handle timer commands and return response message if it's a timer command.
        
        Args:
            user_id: User ID
            conversation_id: Conversation ID
            command: User input command
            
        Returns:
            Response message if timer command, None if not a timer command
        """
        logger.info(f"⏱️  Checking timer command: '{command}'")
        
        # Parse timer command
        timer_data = await self._parse_timer_command(command)
        
        if timer_data['action'] == 'none':
            return None  # Not a timer command
        
        # Execute the timer command
        return await self._execute_timer_command(user_id, timer_data)
    
    async def _parse_timer_command(self, command: str) -> Dict[str, Any]:
        """Parse timer command using regex patterns with LLM fallback."""
        command_lower = command.lower().strip()
        
        # Regex patterns for common timer commands
        # Supports: "set timer for X mins", "timer for X mins", "X minute timer", "remind me in X minutes"
        timer_create_pattern = r'(?:(?:set|create|start|make)\s*(?:a\s+)?timer\s+(?:for\s+)?(\d+)\s*(?:min|mins|minute|minutes)|timer\s+(?:for\s+)?(\d+)\s*(?:min|mins|minute|minutes)|(\d+)\s*(?:min|mins|minute|minutes)\s+timer|(?:remind\s+me\s+in\s+)(\d+)\s*(?:min|mins|minute|minutes))'
        timer_cancel_all_pattern = r'(?:cancel|stop|delete|clear|remove)\s+(?:all|every)\s+(?:timers?|alarms?)'
        timer_cancel_pattern = r'(?:cancel|stop|delete|clear|remove)\s+timer(?:\s+(.+))?'
        
        # Check for create timer
        create_match = re.search(timer_create_pattern, command_lower)
        if create_match:
            duration_minutes = int(create_match.group(1) or create_match.group(2) or create_match.group(3) or create_match.group(4))
            
            # Extract timer name from original command if specified
            timer_name = self._extract_timer_name(command, duration_minutes)
            
            logger.info(f"⏱️  Regex parsed CREATE: duration={duration_minutes}, name='{timer_name}'")
            return {
                'action': 'create',
                'duration_minutes': duration_minutes,
                'timer_name': timer_name,
                'timer_id': None
            }
        
        # Check for cancel all timers
        cancel_all_match = re.search(timer_cancel_all_pattern, command_lower)
        if cancel_all_match:
            logger.info("⏱️  Regex parsed CANCEL_ALL")
            return {
                'action': 'cancel_all',
                'duration_minutes': None,
                'timer_name': None,
                'timer_id': None
            }
        
        # Check for cancel specific timer
        cancel_match = re.search(timer_cancel_pattern, command_lower)
        if cancel_match:
            timer_name = cancel_match.group(1) if cancel_match.group(1) else None
            logger.info(f"⏱️  Regex parsed CANCEL: name='{timer_name}'")
            return {
                'action': 'cancel',
                'duration_minutes': None,
                'timer_name': timer_name,
                'timer_id': None
            }
        
        # If regex didn't match, try LLM parsing
        return await self._llm_parse_timer_command(command)
    
    def _extract_timer_name(self, command: str, duration_minutes: int) -> str:
        """Extract timer name from command or generate default."""
        # Look for patterns like "set timer for 5 minutes water" or "water timer for 5 minutes"
        command_lower = command.lower().strip()
        
        # Remove common timer command words and duration more carefully
        # Use word boundaries to ensure we match complete words
        cleaned = re.sub(r'(?:set|create|start|make)\s*(?:a\s+)?\btimer\b\s*(?:for\s+)?', '', command_lower)
        cleaned = re.sub(r'\btimer\b\s*(?:for\s+)?', '', cleaned)  # Also remove standalone "timer for"
        cleaned = re.sub(r'remind\s+me\s+in\s+', '', cleaned)
        cleaned = re.sub(r'\d+\s*(?:mins?|minutes?)\b', '', cleaned)  # Remove duration (use word boundary)
        cleaned = re.sub(r'\s+', ' ', cleaned).strip()
        
        # If there's meaningful text left, use it as the name
        if cleaned and len(cleaned) > 1:
            return cleaned.title()
        
        # Default name
        return f"{duration_minutes} minute timer"
    
    async def _llm_parse_timer_command(self, command: str) -> Dict[str, Any]:
        """Use LLM to parse timer command as fallback."""
        # For now, return 'none' since LLM parsing is deprecated
        # Timer ability uses regex patterns which are sufficient
        logger.info(f"⏱️  Command '{command}' didn't match regex patterns - treating as non-timer command")
        return {
            'action': 'none',
            'duration_minutes': None,
            'timer_name': None,
            'timer_id': None
        }
    
    async def _execute_timer_command(self, user_id: str, timer_data: Dict[str, Any]) -> str:
        """Execute the parsed timer command."""
        action = timer_data['action']
        
        if action == 'create':
            return await self._create_timer(
                user_id=user_id,
                duration_minutes=timer_data['duration_minutes'],
                timer_name=timer_data['timer_name']
            )
        elif action == 'cancel_all':
            return await self._cancel_all_timers(user_id)
        elif action == 'cancel':
            return await self._cancel_timer(user_id, timer_data.get('timer_name'))
        elif action == 'list':
            return await self._list_timers(user_id)
        else:
            return "I couldn't understand that timer command. Try 'set timer for 5 minutes' or 'cancel all timers'."
    
    async def _create_timer(self, user_id: str, duration_minutes: int, timer_name: str) -> str:
        """Create a new timer."""
        try:
            # Validate duration
            if not isinstance(duration_minutes, int) or duration_minutes <= 0:
                return "Please specify a valid duration in minutes (e.g., 'set timer for 5 minutes')."
            
            if duration_minutes > 1440:  # 24 hours
                return "Timer duration cannot exceed 24 hours (1440 minutes)."
            
            @sync_to_async
            def create_timer_sync():
                from django.contrib.auth import get_user_model
                from apps.chat.models import Conversation
                
                User = get_user_model()
                user = User.objects.get(id=user_id)
                conversation = Conversation.objects.filter(user=user).first()
                
                # Calculate end time
                duration_seconds = duration_minutes * 60
                end_time = timezone.now() + timedelta(seconds=duration_seconds)
                
                # Create timer
                timer = self.Timer.objects.create(
                    user=user,
                    conversation=conversation,
                    name=timer_name,
                    duration_seconds=duration_seconds,
                    end_time=end_time,
                    status='active'
                )
                
                return timer
            
            timer = await create_timer_sync()
            
            # Send WebSocket notification
            await self._send_timer_websocket_update(
                user_id=user_id,
                action='created',
                timer_id=str(timer.id),
                message=f'Timer "{timer.name}" created'
            )
            
            logger.info(f"⏱️  Created timer: {timer.name} ({duration_minutes} min) for user {user_id}")
            return f"✅ Timer \"{timer_name}\" set for {duration_minutes} minute{'s' if duration_minutes != 1 else ''}."
            
        except Exception as e:
            logger.error(f"⏱️  Error creating timer: {e}")
            return "❌ Failed to create timer. Please try again."
    
    async def _cancel_all_timers(self, user_id: str) -> str:
        """Cancel all active timers for user."""
        try:
            @sync_to_async
            def cancel_timers_sync():
                from django.contrib.auth import get_user_model
                User = get_user_model()
                user = User.objects.get(id=user_id)
                
                # Get and cancel active timers
                active_timers = self.Timer.objects.filter(
                    user=user,
                    status__in=['active', 'paused']
                )
                
                count = active_timers.count()
                
                # Cancel each timer
                for timer in active_timers:
                    timer.cancel()
                
                return count
            
            count = await cancel_timers_sync()
            
            if count == 0:
                return "No active timers to cancel."
            
            # Send WebSocket notification
            await self._send_timer_websocket_update(
                user_id=user_id,
                action='cancelled_all',
                message=f'All timers cancelled ({count} timer{"s" if count != 1 else ""})'
            )
            
            logger.info(f"⏱️  Cancelled {count} timers for user {user_id}")
            return f"✅ Cancelled {count} timer{'s' if count != 1 else ''}."
            
        except Exception as e:
            logger.error(f"⏱️  Error cancelling timers: {e}")
            return "❌ Failed to cancel timers. Please try again."
    
    async def _cancel_timer(self, user_id: str, timer_name: Optional[str] = None) -> str:
        """Cancel a specific timer by name."""
        try:
            @sync_to_async
            def cancel_timer_sync():
                from django.contrib.auth import get_user_model
                User = get_user_model()
                user = User.objects.get(id=user_id)
                
                # Get active timers
                active_timers = self.Timer.objects.filter(
                    user=user,
                    status__in=['active', 'paused']
                )
                
                if not active_timers.exists():
                    return None, "No active timers to cancel."
                
                # If no name specified, cancel the most recent one
                if not timer_name:
                    timer = active_timers.order_by('-created_at').first()
                else:
                    # Find timer by name (case insensitive)
                    timer = active_timers.filter(name__icontains=timer_name).first()
                    if not timer:
                        return None, f"No active timer found with name '{timer_name}'."
                
                timer.cancel()
                return timer, None
            
            timer, error_msg = await cancel_timer_sync()
            
            if error_msg:
                return error_msg
            
            # Send WebSocket notification
            await self._send_timer_websocket_update(
                user_id=user_id,
                action='cancelled',
                timer_id=str(timer.id),
                message=f'Timer "{timer.name}" cancelled'
            )
            
            logger.info(f"⏱️  Cancelled timer: {timer.name} for user {user_id}")
            return f"✅ Timer \"{timer.name}\" cancelled."
            
        except Exception as e:
            logger.error(f"⏱️  Error cancelling timer: {e}")
            return "❌ Failed to cancel timer. Please try again."
    
    async def _list_timers(self, user_id: str) -> str:
        """List all active timers for user."""
        try:
            @sync_to_async
            def get_timers_sync():
                from django.contrib.auth import get_user_model
                User = get_user_model()
                user = User.objects.get(id=user_id)
                
                return list(self.Timer.objects.filter(
                    user=user,
                    status__in=['active', 'paused']
                ).order_by('-created_at'))
            
            timers = await get_timers_sync()
            
            if not timers:
                return "📋 No active timers."
            
            lines = ["📋 Active Timers:", ""]
            for i, timer in enumerate(timers, 1):
                # Calculate remaining time
                now = timezone.now()
                if timer.status == 'active':
                    remaining_seconds = max(0, int((timer.end_time - now).total_seconds()))
                    remaining_minutes = remaining_seconds // 60
                    status = f"{remaining_minutes}m remaining"
                else:
                    status = "⏸️ Paused"
                
                lines.append(f"{i}. {timer.name} - {status}")
            
            return "\n".join(lines)
            
        except Exception as e:
            logger.error(f"⏱️  Error listing timers: {e}")
            return "❌ Failed to list timers."
    
    async def _send_timer_websocket_update(self, user_id: str, action: str, timer_id: str = None, message: str = None):
        """Send WebSocket update for timer actions."""
        try:
            group_name = f"chat_{user_id}"
            update_data = {
                'type': 'timer_update',
                'action': action,
                'message': message or f'Timer {action}'
            }
            
            if timer_id:
                update_data['timer_id'] = timer_id
            
            # Call channel layer group_send directly in async context
            if self.channel_layer:
                await self.channel_layer.group_send(group_name, update_data)
            
            logger.info(f"⏱️  Sent WebSocket update: {action} to group {group_name}")
            
        except Exception as e:
            logger.error(f"⏱️  Failed to send WebSocket update: {e}")