"""
Management command to send proactive messages via WebSocket.
This runs as a background task, checking periodically for users who should receive proactive messages.
"""
import asyncio
import logging
from datetime import datetime
from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync
from apps.chat.models import Conversation, Message
from core.bruno_integration.proactive_messages import proactive_message_generator

User = get_user_model()
logger = logging.getLogger(__name__)


class Command(BaseCommand):
    help = 'Background task to send proactive messages to users via WebSocket'

    def add_arguments(self, parser):
        parser.add_argument(
            '--interval',
            type=int,
            default=300,  # 5 minutes
            help='Check interval in seconds (default: 300)',
        )

    def handle(self, *args, **options):
        interval = options['interval']
        self.stdout.write(self.style.SUCCESS(
            f'Starting proactive message sender (checking every {interval}s)'
        ))

        try:
            while True:
                self.check_and_send_proactive_messages()
                asyncio.run(asyncio.sleep(interval))
        except KeyboardInterrupt:
            self.stdout.write(self.style.WARNING('Stopping proactive message sender'))

    def check_and_send_proactive_messages(self):
        """Check all conversations and send proactive messages if needed."""
        channel_layer = get_channel_layer()
        
        # Get all conversations
        conversations = Conversation.objects.select_related('user', 'agent').all()
        
        for conversation in conversations:
            try:
                # Check if proactive message should be sent
                should_send, reason = conversation.should_send_proactive_message()
                
                if should_send:
                    # Generate proactive message
                    message_data = async_to_sync(
                        proactive_message_generator.generate_proactive_message
                    )(
                        user_id=str(conversation.user.id),
                        conversation_id=str(conversation.id),
                        proactivity_level=conversation.proactivity_level
                    )
                    
                    # Record that we sent a proactive message
                    conversation.record_proactive_message()
                    
                    # Create message in database
                    message = Message.objects.create(
                        conversation=conversation,
                        role='assistant',
                        content=message_data['content'],
                        model=conversation.agent.model
                    )
                    
                    # Send via WebSocket
                    async_to_sync(channel_layer.group_send)(
                        f'chat_{conversation.user.id}',
                        {
                            'type': 'proactive_message',
                            'message': {
                                'id': str(message.id),
                                'content': message.content,
                                'created_at': message.created_at.isoformat(),
                                'role': 'assistant',
                                'proactivity_level': conversation.proactivity_level
                            }
                        }
                    )
                    
                    self.stdout.write(self.style.SUCCESS(
                        f'Sent proactive message to user {conversation.user.id}'
                    ))
                    
            except Exception as e:
                logger.error(f'Error sending proactive message to user {conversation.user.id}: {e}')
                self.stdout.write(self.style.ERROR(
                    f'Error for user {conversation.user.id}: {str(e)}'
                ))
