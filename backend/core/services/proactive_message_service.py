"""
Proactive message service that handles business logic for proactive messaging.
Separates concerns from the API views layer.
"""
import logging
from typing import Dict, Any, Tuple
from asgiref.sync import async_to_sync

from apps.chat.models import Conversation, Message


logger = logging.getLogger(__name__)


class ProactiveMessageService:
    """Service for handling proactive message business logic."""
    
    def should_send_proactive_message(self, conversation: Conversation) -> Tuple[bool, str]:
        """
        Check if a proactive message should be sent.
        
        Args:
            conversation: Conversation instance
            
        Returns:
            Tuple of (should_send, reason)
        """
        return conversation.should_send_proactive_message()
    
    def generate_proactive_message(self, conversation: Conversation) -> Dict[str, Any]:
        """
        Generate and create a proactive message.
        
        Args:
            conversation: Conversation instance
            
        Returns:
            Dictionary with message data and metadata
            
        Raises:
            Exception: If message generation fails
        """
        # Generate proactive message
        from core.bruno_integration.proactive_messages import proactive_message_generator
        message_data = async_to_sync(proactive_message_generator.generate_proactive_message)(
            user_id=str(conversation.user.id),
            conversation_id=str(conversation.id),
            proactivity_level=conversation.proactivity_level
        )
        
        # Record that we sent a proactive message
        conversation.record_proactive_message()
        
        # Create the proactive message in the database
        proactive_message = Message.objects.create(
            conversation=conversation,
            role='assistant',
            content=message_data['content'],
            model=conversation.agent.model
        )
        
        return {
            'message': proactive_message,
            'message_data': message_data,
            'proactivity_level': conversation.proactivity_level
        }
    
    def check_and_generate_proactive_message(self, conversation: Conversation) -> Dict[str, Any]:
        """
        Check if proactive message should be sent and generate it if needed.
        
        Args:
            conversation: Conversation instance
            
        Returns:
            Dictionary with should_send flag and message data if generated
        """
        # Check if we should send a proactive message
        should_send, reason = self.should_send_proactive_message(conversation)
        
        if not should_send:
            return {
                'should_send': False,
                'reason': reason,
                'proactivity_level': conversation.proactivity_level
            }
        
        try:
            result = self.generate_proactive_message(conversation)
            
            return {
                'should_send': True,
                'message': result['message'],
                'proactivity_level': result['proactivity_level'],
                'metadata': result['message_data']
            }
            
        except Exception as e:
            logger.error(f"Error generating proactive message: {e}")
            return {
                'should_send': False,
                'error': str(e)
            }
    
    def adjust_proactivity(self, conversation: Conversation) -> Dict[str, Any]:
        """
        Manually trigger proactivity adjustment.
        
        Args:
            conversation: Conversation instance
            
        Returns:
            Dictionary with old and new proactivity levels and stats
        """
        old_level = conversation.proactivity_level
        
        conversation.adjust_proactivity()
        
        response_rate = (
            conversation.proactive_responses_received / conversation.total_proactive_messages
            if conversation.total_proactive_messages > 0 else 0
        )
        
        return {
            'old_level': old_level,
            'new_level': conversation.proactivity_level,
            'total_proactive': conversation.total_proactive_messages,
            'responses_received': conversation.proactive_responses_received,
            'response_rate': response_rate
        }
    
    def get_proactivity_settings(self, conversation: Conversation) -> Dict[str, Any]:
        """
        Get current proactivity settings for the conversation.
        
        Args:
            conversation: Conversation instance
            
        Returns:
            Dictionary with current settings and stats
        """
        response_rate = (
            conversation.proactive_responses_received / conversation.total_proactive_messages
            if conversation.total_proactive_messages > 0 else 0
        )
        
        return {
            'proactive_messages_enabled': conversation.proactive_messages_enabled,
            'auto_adjust_proactivity': conversation.auto_adjust_proactivity,
            'proactivity_level': conversation.proactivity_level,
            'min_proactivity_level': conversation.min_proactivity_level,
            'max_proactivity_level': conversation.max_proactivity_level,
            'quiet_hours_start': conversation.quiet_hours_start.isoformat() if conversation.quiet_hours_start else None,
            'quiet_hours_end': conversation.quiet_hours_end.isoformat() if conversation.quiet_hours_end else None,
            # Stats
            'total_proactive_messages': conversation.total_proactive_messages,
            'proactive_responses_received': conversation.proactive_responses_received,
            'response_rate': response_rate
        }
    
    def update_proactivity_settings(self, conversation: Conversation, settings_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Update proactivity settings for the conversation.
        
        Args:
            conversation: Conversation instance
            settings_data: Dictionary with settings to update
            
        Returns:
            Dictionary with updated settings
        """
        # Update enabled/disabled
        if 'proactive_messages_enabled' in settings_data:
            conversation.proactive_messages_enabled = settings_data['proactive_messages_enabled']
        
        # Update auto-adjust setting
        if 'auto_adjust_proactivity' in settings_data:
            conversation.auto_adjust_proactivity = settings_data['auto_adjust_proactivity']
        
        # Update manual proactivity level
        if 'proactivity_level' in settings_data:
            level = int(settings_data['proactivity_level'])
            if 1 <= level <= 10:
                conversation.proactivity_level = level
        
        # Update min/max bounds
        if 'min_proactivity_level' in settings_data:
            min_level = int(settings_data['min_proactivity_level'])
            if 1 <= min_level <= 10:
                conversation.min_proactivity_level = min_level
        
        if 'max_proactivity_level' in settings_data:
            max_level = int(settings_data['max_proactivity_level'])
            if 1 <= max_level <= 10:
                conversation.max_proactivity_level = max_level
        
        # Update quiet hours
        if 'quiet_hours_start' in settings_data:
            from datetime import datetime
            time_str = settings_data['quiet_hours_start']
            if time_str:
                conversation.quiet_hours_start = datetime.strptime(time_str, '%H:%M').time()
            else:
                conversation.quiet_hours_start = None
        
        if 'quiet_hours_end' in settings_data:
            from datetime import datetime
            time_str = settings_data['quiet_hours_end']
            if time_str:
                conversation.quiet_hours_end = datetime.strptime(time_str, '%H:%M').time()
            else:
                conversation.quiet_hours_end = None
        
        conversation.save()
        
        return {
            'message': 'Proactivity settings updated successfully',
            'settings': self.get_proactivity_settings(conversation)
        }