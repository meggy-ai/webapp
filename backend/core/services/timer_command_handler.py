"""
Timer Command Handler - Parse and execute timer commands from natural language
"""
from typing import Dict, Optional, List
import logging
import json
import re
from asgiref.sync import async_to_sync
from apps.chat.models import Timer
from core.bruno_integration.bruno_llm import OllamaClient

logger = logging.getLogger(__name__)


class TimerCommandHandler:
    """Service to parse and execute timer commands from natural language."""
    
    PARSE_PROMPT = """You are a timer command parser. Analyze the user's message and extract timer command details.

Commands can be:
1. CREATE timer: "set a timer for X minutes", "timer for X mins", "remind me in X minutes"
2. CANCEL ALL timers: "cancel all timers", "stop all timers", "delete all timers", "clear all timers"
3. CANCEL SPECIFIC timer: "cancel timer [name]", "stop the [name] timer"

Respond with ONLY a JSON object:
{
  "action": "create|cancel_all|cancel_specific|none",
  "duration_minutes": <number or null>,
  "timer_name": "<name or null>",
  "timer_id": "<id or null>"
}

Examples:
"set a timer for 10 minutes" -> {"action": "create", "duration_minutes": 10, "timer_name": "10 minute timer", "timer_id": null}
"timer for 5 mins for meeting" -> {"action": "create", "duration_minutes": 5, "timer_name": "meeting", "timer_id": null}
"remind me in 30 minutes" -> {"action": "create", "duration_minutes": 30, "timer_name": "30 minute timer", "timer_id": null}
"cancel all timers" -> {"action": "cancel_all", "duration_minutes": null, "timer_name": null, "timer_id": null}
"stop all timers" -> {"action": "cancel_all", "duration_minutes": null, "timer_name": null, "timer_id": null}
"cancel timer workout" -> {"action": "cancel_specific", "duration_minutes": null, "timer_name": "workout", "timer_id": null}
"how are you?" -> {"action": "none", "duration_minutes": null, "timer_name": null, "timer_id": null}

Now parse this message:
"{message}"

Respond with ONLY the JSON object."""

    def __init__(self, llm_client: Optional[OllamaClient] = None):
        """Initialize timer command handler."""
        self.llm_client = llm_client or OllamaClient(base_url="http://localhost:11434")
        logger.info("Initialized TimerCommandHandler")
    
    async def parse_command(self, message: str, model: str = "mistral:7b") -> Dict:
        """
        Parse timer command from natural language.
        
        Args:
            message: User message to parse
            model: LLM model to use
            
        Returns:
            Dict with action, duration_minutes, timer_name, timer_id
        """
        try:
            # Build parsing prompt
            prompt = self.PARSE_PROMPT.format(message=message.strip())
            
            logger.info(f"⏱️  Parsing timer command: '{message}'")
            
            # Call LLM
            response = await self.llm_client.generate(
                model=model,
                messages=[
                    {"role": "system", "content": "You are a precise timer command parser. Respond only with JSON."},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.1,
                max_tokens=150
            )
            
            response_text = response['content'].strip()
            logger.info(f"📥 LLM response: {response_text}")
            
            # Parse JSON response
            result = self._parse_json_response(response_text)
            logger.info(f"✅ Parsed command: action={result['action']}, duration={result['duration_minutes']}, name={result['timer_name']}")
            
            return result
            
        except Exception as e:
            logger.error(f"❌ Error parsing timer command: {str(e)}", exc_info=True)
            return {
                'action': 'none',
                'duration_minutes': None,
                'timer_name': None,
                'timer_id': None,
                'error': str(e)
            }
    
    def _parse_json_response(self, response: str) -> Dict:
        """Extract and parse JSON from LLM response."""
        try:
            # Find JSON in response
            start_idx = response.find('{')
            end_idx = response.rfind('}') + 1
            
            if start_idx != -1 and end_idx > start_idx:
                json_str = response[start_idx:end_idx]
                data = json.loads(json_str)
                
                return {
                    'action': str(data.get('action', 'none')),
                    'duration_minutes': data.get('duration_minutes'),
                    'timer_name': data.get('timer_name'),
                    'timer_id': data.get('timer_id')
                }
            else:
                logger.warning(f"No JSON found in response: {response}")
                return {
                    'action': 'none',
                    'duration_minutes': None,
                    'timer_name': None,
                    'timer_id': None
                }
                
        except (json.JSONDecodeError, KeyError) as e:
            logger.warning(f"Failed to parse response: {e}")
            return {
                'action': 'none',
                'duration_minutes': None,
                'timer_name': None,
                'timer_id': None
            }
    
    def execute_command(self, user, command_data: Dict) -> Dict:
        """
        Execute a parsed timer command.
        
        Args:
            user: User object
            command_data: Parsed command data from parse_command()
            
        Returns:
            Dict with success status and message
        """
        action = command_data.get('action', 'none')
        
        if action == 'create':
            return self._create_timer(user, command_data)
        elif action == 'cancel_all':
            return self._cancel_all_timers(user)
        elif action == 'cancel_specific':
            return self._cancel_specific_timer(user, command_data)
        else:
            return {
                'success': False,
                'message': 'No timer command detected'
            }
    
    def _create_timer(self, user, command_data: Dict) -> Dict:
        """Create a new timer."""
        try:
            duration_minutes = command_data.get('duration_minutes')
            timer_name = command_data.get('timer_name', f"{duration_minutes} minute timer")
            
            if not duration_minutes or duration_minutes <= 0:
                return {
                    'success': False,
                    'message': 'Invalid timer duration'
                }
            
            from django.utils import timezone
            from datetime import timedelta
            from apps.chat.models import Conversation
            
            # Get user's conversation
            conversation = Conversation.objects.filter(user=user).first()
            
            # Create timer
            timer = Timer.objects.create(
                user=user,
                conversation=conversation,
                name=timer_name,
                duration_seconds=duration_minutes * 60,
                end_time=timezone.now() + timedelta(seconds=duration_minutes * 60),
                status='active'
            )
            
            logger.info(f"✅ Created timer: {timer.name} ({duration_minutes} mins) for user {user.email}")
            
            # Send WebSocket notification
            from channels.layers import get_channel_layer
            channel_layer = get_channel_layer()
            group_name = f"chat_{str(user.id)}"
            async_to_sync(channel_layer.group_send)(
                group_name,
                {
                    'type': 'timer_update',
                    'action': 'created',
                    'timer_id': str(timer.id),
                    'message': f'Timer "{timer.name}" created'
                }
            )
            
            return {
                'success': True,
                'message': f'✓ Timer set: "{timer_name}" ({duration_minutes} minutes)',
                'timer_id': str(timer.id)
            }
            
        except Exception as e:
            logger.error(f"❌ Failed to create timer: {str(e)}", exc_info=True)
            return {
                'success': False,
                'message': 'Failed to create timer'
            }
    
    def _cancel_all_timers(self, user) -> Dict:
        """Cancel all active/paused timers for user."""
        try:
            timers = Timer.objects.filter(
                user=user,
                status__in=['active', 'paused']
            )
            count = timers.count()
            
            if count == 0:
                return {
                    'success': True,
                    'message': 'No active timers to cancel'
                }
            
            # Cancel all timers
            for timer in timers:
                timer.cancel()
            
            logger.info(f"✅ Cancelled {count} timer(s) for user {user.email}")
            
            # Send WebSocket notification
            from channels.layers import get_channel_layer
            channel_layer = get_channel_layer()
            group_name = f"chat_{str(user.id)}"
            async_to_sync(channel_layer.group_send)(
                group_name,
                {
                    'type': 'timer_update',
                    'action': 'cancelled_all',
                    'message': f'All timers cancelled ({count} timer{"s" if count != 1 else ""})'
                }
            )
            
            return {
                'success': True,
                'message': f'✓ Cancelled {count} timer{"s" if count != 1 else ""}'
            }
            
        except Exception as e:
            logger.error(f"❌ Failed to cancel all timers: {str(e)}", exc_info=True)
            return {
                'success': False,
                'message': 'Failed to cancel timers'
            }
    
    def _cancel_specific_timer(self, user, command_data: Dict) -> Dict:
        """Cancel a specific timer by name."""
        try:
            timer_name = command_data.get('timer_name')
            
            if not timer_name:
                return {
                    'success': False,
                    'message': 'No timer name specified'
                }
            
            # Find timer by name (case-insensitive partial match)
            timers = Timer.objects.filter(
                user=user,
                status__in=['active', 'paused'],
                name__icontains=timer_name
            )
            
            if not timers.exists():
                return {
                    'success': False,
                    'message': f'No timer found matching "{timer_name}"'
                }
            
            timer = timers.first()
            timer.cancel()
            
            logger.info(f"✅ Cancelled timer '{timer.name}' for user {user.email}")
            
            # Send WebSocket notification
            from channels.layers import get_channel_layer
            channel_layer = get_channel_layer()
            group_name = f"chat_{str(user.id)}"
            async_to_sync(channel_layer.group_send)(
                group_name,
                {
                    'type': 'timer_update',
                    'action': 'cancelled',
                    'timer_id': str(timer.id),
                    'message': f'Timer "{timer.name}" cancelled'
                }
            )
            
            return {
                'success': True,
                'message': f'✓ Cancelled timer: "{timer.name}"'
            }
            
        except Exception as e:
            logger.error(f"❌ Failed to cancel specific timer: {str(e)}", exc_info=True)
            return {
                'success': False,
                'message': 'Failed to cancel timer'
            }
