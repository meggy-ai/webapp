"""
WebSocket consumers for real-time chat functionality.
"""
import json
import logging
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from apps.chat.models import Conversation, Message
from apps.accounts.models import User

logger = logging.getLogger(__name__)


class ChatConsumer(AsyncWebsocketConsumer):
    """
    WebSocket consumer for chat messages and proactive notifications.
    """
    
    async def connect(self):
        """Handle WebSocket connection."""
        # Get user from scope (set by AuthMiddlewareStack)
        self.user = self.scope.get('user')
        
        if not self.user or not self.user.is_authenticated:
            logger.warning("Unauthenticated WebSocket connection attempt")
            await self.close()
            return
        
        # Get or create conversation for this user
        self.conversation = await self.get_or_create_conversation()
        
        if not self.conversation:
            logger.error(f"Failed to get conversation for user {self.user.id}")
            await self.close()
            return
        
        # Join user-specific channel
        self.room_group_name = f'chat_{self.user.id}'
        
        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )
        
        await self.accept()
        logger.info(f"WebSocket connected for user {self.user.id}")
        
        # Send connection confirmation
        await self.send(text_data=json.dumps({
            'type': 'connection_established',
            'conversation_id': str(self.conversation.id),
            'proactivity_level': self.conversation.proactivity_level
        }))
    
    async def disconnect(self, close_code):
        """Handle WebSocket disconnection."""
        if hasattr(self, 'room_group_name'):
            await self.channel_layer.group_discard(
                self.room_group_name,
                self.channel_name
            )
            logger.info(f"WebSocket disconnected for user {self.user.id}")
    
    async def receive(self, text_data):
        """
        Handle incoming WebSocket messages.
        Not used for chat messages (those go through REST API),
        but can be used for other real-time interactions.
        """
        try:
            data = json.loads(text_data)
            message_type = data.get('type')
            
            if message_type == 'ping':
                # Keepalive ping
                await self.send(text_data=json.dumps({
                    'type': 'pong'
                }))
            elif message_type == 'check_proactive':
                # Manual check for proactive messages
                await self.check_and_send_proactive()
            
        except json.JSONDecodeError:
            logger.error("Invalid JSON received on WebSocket")
        except Exception as e:
            logger.error(f"Error handling WebSocket message: {e}")
    
    async def proactive_message(self, event):
        """
        Handle proactive message event sent from other parts of the application.
        """
        await self.send(text_data=json.dumps({
            'type': 'proactive_message',
            'message': event['message']
        }))
    
    async def chat_message(self, event):
        """
        Handle regular chat message event (for future real-time chat).
        """
        await self.send(text_data=json.dumps({
            'type': 'chat_message',
            'message': event['message']
        }))
    
    async def proactivity_update(self, event):
        """
        Handle proactivity level update event.
        """
        await self.send(text_data=json.dumps({
            'type': 'proactivity_update',
            'proactivity_level': event['proactivity_level'],
            'reason': event.get('reason', '')
        }))
    
    @database_sync_to_async
    def get_or_create_conversation(self):
        """Get or create conversation for the user."""
        try:
            conversation, _ = Conversation.get_or_create_for_user(self.user)
            return conversation
        except Exception as e:
            logger.error(f"Error getting conversation: {e}")
            return None
    
    async def check_and_send_proactive(self):
        """Check if proactive message should be sent and send it."""
        should_send, reason = await self.should_send_proactive()
        
        if should_send:
            # Generate and send proactive message
            message_data = await self.generate_proactive_message()
            
            if message_data:
                await self.send(text_data=json.dumps({
                    'type': 'proactive_message',
                    'message': message_data
                }))
    
    @database_sync_to_async
    def should_send_proactive(self):
        """Check if proactive message should be sent."""
        return self.conversation.should_send_proactive_message()
    
    @database_sync_to_async
    def generate_proactive_message(self):
        """Generate a proactive message."""
        from core.bruno_integration.proactive_messages import proactive_message_generator
        from asgiref.sync import async_to_sync
        
        try:
            message_data = async_to_sync(proactive_message_generator.generate_proactive_message)(
                user_id=str(self.user.id),
                conversation_id=str(self.conversation.id),
                proactivity_level=self.conversation.proactivity_level
            )
            
            # Record that we sent a proactive message
            self.conversation.record_proactive_message()
            
            # Create the message in database
            message = Message.objects.create(
                conversation=self.conversation,
                role='assistant',
                content=message_data['content'],
                model=self.conversation.agent.model
            )
            
            return {
                'id': str(message.id),
                'content': message.content,
                'created_at': message.created_at.isoformat(),
                'role': 'assistant',
                'proactivity_level': self.conversation.proactivity_level
            }
        except Exception as e:
            logger.error(f"Error generating proactive message: {e}")
            return None
