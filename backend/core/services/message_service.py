"""
Message processing service that handles business logic for chat messages.
Separates concerns from the API views layer.
"""
import logging
from typing import Dict, Any, Optional, Tuple
from asgiref.sync import async_to_sync
from django.contrib.auth import get_user_model
from django.utils import timezone

from apps.chat.models import Conversation, Message
from core.services import chat_service

User = get_user_model()
logger = logging.getLogger(__name__)


class MessageService:
    """Service for handling message processing business logic."""
    
    def detect_command(self, content: str, override: Optional[bool] = None) -> Tuple[bool, Optional[Dict[str, Any]]]:
        """
        Detect if message is a command using LLM or override.
        
        Args:
            content: Message content to analyze
            override: Optional override for command detection
            
        Returns:
            Tuple of (is_command, detection_result)
        """
        if override is not None:
            return override, None
            
        logger.info(f"🔍 Using LLM to detect command for message: '{content}'")
        
        detection_result = async_to_sync(chat_service.command_detector.detect_command)(content)
        is_command = detection_result['is_command'] and detection_result['confidence'] >= 0.7
        
        logger.info(f"📊 Command detection: is_command={is_command}, type={detection_result['command_type']}, confidence={detection_result['confidence']}")
        
        return is_command, detection_result
    
    def process_chat_message(self, conversation: Conversation, content: str, is_task_command: bool) -> Dict[str, Any]:
        """
        Process message through Bruno chat service.
        
        Args:
            conversation: Conversation instance
            content: Message content
            is_task_command: Whether this is a task command
            
        Returns:
            Chat service response
        """
        return async_to_sync(chat_service.process_message)(
            conversation_id=str(conversation.id),
            user_message=content,
            agent_id=str(conversation.agent.id),
            user_id=str(conversation.user.id),
            is_task_command=is_task_command
        )
    
    def extract_memories_async(self, user, content: str, message_id: str) -> None:
        """
        Extract and save long-term memories from user message (async background task).
        
        Args:
            user: User who sent the message
            content: Message content
            message_id: Message ID for tracking
        """
        # TODO: Implement memory extraction when ready
        logger.info(f"Memory extraction not yet implemented for message {message_id}")
        pass
    
    def create_user_message(self, conversation: Conversation, content: str) -> Message:
        """
        Create user message and update conversation title if needed.
        
        Args:
            conversation: Conversation instance
            content: Message content
            
        Returns:
            Created Message instance
        """
        # Create user message
        user_message = Message.objects.create(
            conversation=conversation,
            role='user',
            content=content
        )
        
        # Update conversation title if this is the first message
        if conversation.messages.count() == 1 and conversation.title == 'New Conversation':
            # Generate title from first user message (first 50 chars)
            new_title = content[:50] + ('...' if len(content) > 50 else '')
            conversation.title = new_title
            conversation.save()
            
        return user_message
    
    def create_assistant_message(self, conversation: Conversation, response: Dict[str, Any]) -> Message:
        """
        Create assistant message with response content.
        
        Args:
            conversation: Conversation instance
            response: Chat service response
            
        Returns:
            Created Message instance
        """
        content = response.get('content', 'I apologize, but I encountered an error.')
        
        return Message.objects.create(
            conversation=conversation,
            role='assistant',
            content=content,
            model=response.get('model', conversation.agent.model),
            tokens_used=response.get('tokens_used', 0)
        )
    
    def create_error_message(self, conversation: Conversation) -> Message:
        """
        Create error response message.
        
        Args:
            conversation: Conversation instance
            
        Returns:
            Created Message instance with error content
        """
        return Message.objects.create(
            conversation=conversation,
            role='assistant',
            content='I apologize, but I encountered an error processing your message. Please try again.',
            model=conversation.agent.model
        )
    
    def update_conversation_tracking(self, conversation: Conversation, is_response_to_proactive: bool) -> None:
        """
        Update conversation tracking for engagement metrics.
        
        Args:
            conversation: Conversation instance
            is_response_to_proactive: Whether this is a response to proactive message
        """
        # Record user message for engagement tracking
        conversation.record_user_message()
        
        # If this is a response to a proactive message, record it
        if is_response_to_proactive:
            conversation.record_proactive_response()
    
    def process_message(self, conversation: Conversation, content: str, is_response_to_proactive: bool = False, is_task_command_override: Optional[bool] = None) -> Dict[str, Any]:
        """
        Main method to process a chat message with full business logic.
        
        Args:
            conversation: Conversation instance
            content: Message content
            is_response_to_proactive: Whether this is response to proactive message
            is_task_command_override: Optional override for task command detection
            
        Returns:
            Dictionary with processing results including user_message, assistant_message, success, etc.
        """
        try:
            # Update conversation tracking
            self.update_conversation_tracking(conversation, is_response_to_proactive)
            
            # Detect if this is a command
            is_task_command, detection_result = self.detect_command(content, is_task_command_override)
            
            # Create user message
            user_message = self.create_user_message(conversation, content)
            
            # Process message through Bruno chat service (which now handles timer/notes abilities)
            response = self.process_chat_message(conversation, content, is_task_command)
            
            # Create assistant message with response
            assistant_message = self.create_assistant_message(conversation, response)
            
            # Extract and save long-term memories (async background task)
            self.extract_memories_async(conversation.user, content, str(user_message.id))
            
            return {
                'user_message': user_message,
                'assistant_message': assistant_message,
                'success': response.get('success', True)
            }
            
        except Exception as e:
            logger.error(f"Error processing message: {e}")
            
            # Create user message if it doesn't exist yet
            if 'user_message' not in locals():
                user_message = self.create_user_message(conversation, content)
            
            # Create error response message
            assistant_message = self.create_error_message(conversation)
            
            return {
                'user_message': user_message,
                'assistant_message': assistant_message,
                'success': False,
                'error': str(e)
            }