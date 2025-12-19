from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from django.contrib.auth import authenticate
from django.utils import timezone
from datetime import timedelta
from asgiref.sync import async_to_sync
from apps.accounts.models import User
from apps.agents.models import Agent
from apps.chat.models import Conversation, Message, Timer
from core.services import chat_service
from .serializers import (
    UserSerializer, UserCreateSerializer,
    AgentSerializer,
    ConversationSerializer, ConversationListSerializer,
    MessageSerializer,
    TimerSerializer
)


class UserViewSet(viewsets.ModelViewSet):
    """ViewSet for User operations."""
    queryset = User.objects.all()
    permission_classes = [permissions.IsAuthenticated]
    
    def get_serializer_class(self):
        if self.action == 'create':
            return UserCreateSerializer
        return UserSerializer
    
    def get_queryset(self):
        # Users can only see themselves
        return User.objects.filter(id=self.request.user.id)
    
    @action(detail=False, methods=['get'])
    def me(self, request):
        """Get current user."""
        serializer = self.get_serializer(request.user)
        return Response(serializer.data)


class AgentViewSet(viewsets.ModelViewSet):
    """ViewSet for Agent operations."""
    serializer_class = AgentSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        return Agent.objects.filter(user=self.request.user)
    
    def perform_create(self, serializer):
        serializer.save(user=self.request.user)
    
    @action(detail=False, methods=['get'])
    def default(self, request):
        """Get default agent for user."""
        agent = Agent.objects.filter(user=request.user, is_default=True).first()
        if not agent:
            # Create default agent if none exists
            agent = Agent.objects.create(
                user=request.user,
                name='Bruno',
                is_default=True
            )
        serializer = self.get_serializer(agent)
        return Response(serializer.data)


class ConversationViewSet(viewsets.ModelViewSet):
    """
    ViewSet for Conversation operations.
    Note: Each user has ONE conversation with Meggy (continuous timeline).
    """
    permission_classes = [permissions.IsAuthenticated]
    
    def get_serializer_class(self):
        if self.action == 'list':
            return ConversationListSerializer
        return ConversationSerializer
    
    def get_queryset(self):
        # Users only see their single conversation
        return Conversation.objects.filter(user=self.request.user)
    
    def perform_create(self, serializer):
        # This shouldn't normally be called - use get_or_create endpoint instead
        serializer.save(user=self.request.user)
    
    @action(detail=False, methods=['get'])
    def get_or_create(self, request):
        """
        Get or create the user's single conversation with Meggy.
        This is the primary way to access the conversation.
        """
        conversation, created = Conversation.get_or_create_for_user(request.user)
        serializer = self.get_serializer(conversation)
        return Response({
            'conversation': serializer.data,
            'created': created
        })
    
    @action(detail=True, methods=['post'])
    def send_message(self, request, pk=None):
        """Send a message in a conversation."""
        conversation = self.get_object()
        content = request.data.get('content')
        is_response_to_proactive = request.data.get('is_response_to_proactive', False)
        # is_task_command is now deprecated - we'll use LLM detection instead
        # But keep for backward compatibility
        is_task_command_override = request.data.get('is_task_command', None)
        
        if not content:
            return Response(
                {'error': 'Content is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Use LLM to detect if this is a command (unless overridden by frontend)
        import logging
        logger = logging.getLogger(__name__)
        
        detection_result = None
        if is_task_command_override is None:
            logger.info(f"🔍 Using LLM to detect command for message: '{content}'")
            
            detection_result = async_to_sync(chat_service.command_detector.detect_command)(content)
            is_task_command = detection_result['is_command'] and detection_result['confidence'] >= 0.7
            
            logger.info(f"📊 Command detection: is_command={is_task_command}, type={detection_result['command_type']}, confidence={detection_result['confidence']}")
        else:
            is_task_command = is_task_command_override
        
        # Record user message for engagement tracking
        conversation.record_user_message()
        
        # If this is a response to a proactive message, record it
        if is_response_to_proactive:
            conversation.record_proactive_response()
        
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
        
        try:
            # Check if this is a timer command and handle it
            timer_result = None
            
            # Simple regex check for timer commands as fallback
            import re
            timer_create_pattern = r'(?:(?:set|create|start|make)\s*(?:a\s+)?timer\s+(?:for\s+)?(\d+)\s*(?:min|mins|minute|minutes)|(?:remind\s+me\s+in\s+)(\d+)\s*(?:min|mins|minute|minutes))'
            timer_cancel_all_pattern = r'(?:cancel|stop|delete|clear|remove)\s+(?:all|every)\s+(?:timers?|alarms?)'
            
            timer_create_match = re.search(timer_create_pattern, content.lower())
            timer_cancel_all_match = re.search(timer_cancel_all_pattern, content.lower())
            
            if timer_create_match or timer_cancel_all_match or (is_task_command and detection_result and detection_result.get('command_type') == 'timer'):
                from core.services.timer_command_handler import TimerCommandHandler
                timer_handler = TimerCommandHandler()
                
                logger.info(f"⏱️  Timer command detected - Create: {timer_create_match}, Cancel All: {timer_cancel_all_match}, LLM: {is_task_command and detection_result}")
                logger.info(f"⏱️  Parsing timer command: '{content}'")
                
                # If regex matched for create, use simple parsing
                if timer_create_match:
                    # Extract duration from either capture group (timer pattern or remind pattern)
                    duration_minutes = int(timer_create_match.group(1) or timer_create_match.group(2))
                    timer_name = f"{duration_minutes} minute timer"
                    
                    command_data = {
                        'action': 'create',
                        'duration_minutes': duration_minutes,
                        'timer_name': timer_name,
                        'timer_id': None
                    }
                    logger.info(f"⏱️  Using regex-parsed CREATE command: {command_data}")
                # If regex matched for cancel all
                elif timer_cancel_all_match:
                    command_data = {
                        'action': 'cancel_all',
                        'duration_minutes': None,
                        'timer_name': None,
                        'timer_id': None
                    }
                    logger.info(f"⏱️  Using regex-parsed CANCEL ALL command: {command_data}")
                else:
                    # Use LLM parsing
                    command_data = async_to_sync(timer_handler.parse_command)(content)
                    logger.info(f"⏱️  Using LLM-parsed command: {command_data}")
                
                if command_data['action'] != 'none':
                    timer_result = timer_handler.execute_command(request.user, command_data)
                    logger.info(f"⏱️  Timer command executed: {timer_result}")
            
            # Process message through Bruno chat service
            response = async_to_sync(chat_service.process_message)(
                conversation_id=str(conversation.id),
                user_message=content,
                agent_id=str(conversation.agent.id),
                user_id=str(request.user.id),
                is_task_command=is_task_command
            )
            
            # If timer command was successful, append result to response
            if timer_result and timer_result['success']:
                response['content'] = timer_result['message']
            
            # Create assistant message with response
            assistant_message = Message.objects.create(
                conversation=conversation,
                role='assistant',
                content=response.get('content', 'I apologize, but I encountered an error.'),
                model=response.get('model', conversation.agent.model),
                tokens_used=response.get('tokens_used', 0)
            )
            
            # Extract and save long-term memories from user message (async background task)
            try:
                from core.bruno_integration.memory_extraction import memory_extractor
                async_to_sync(memory_extractor.extract_memories_from_conversation)(
                    user_id=str(request.user.id),
                    conversation_text=content,
                    message_id=str(user_message.id)
                )
            except Exception as mem_error:
                # Don't fail the request if memory extraction fails
                import logging
                logging.getLogger(__name__).warning(f"Memory extraction failed: {mem_error}")
            
            return Response({
                'user_message': MessageSerializer(user_message).data,
                'assistant_message': MessageSerializer(assistant_message).data,
                'success': response.get('success', True)
            })
            
        except Exception as e:
            # Create error response message
            assistant_message = Message.objects.create(
                conversation=conversation,
                role='assistant',
                content='I apologize, but I encountered an error processing your message. Please try again.',
                model=conversation.agent.model
            )
            
            return Response({
                'user_message': MessageSerializer(user_message).data,
                'assistant_message': MessageSerializer(assistant_message).data,
                'success': False,
                'error': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    @action(detail=True, methods=['get'])
    def check_proactive(self, request, pk=None):
        """
        Check if a proactive message should be sent.
        Returns message if it should be sent, or null if not.
        """
        conversation = self.get_object()
        
        # Check if we should send a proactive message
        should_send, reason = conversation.should_send_proactive_message()
        
        if not should_send:
            return Response({
                'should_send': False,
                'reason': reason,
                'proactivity_level': conversation.proactivity_level
            })
        
        try:
            # Generate proactive message
            from core.bruno_integration.proactive_messages import proactive_message_generator
            message_data = async_to_sync(proactive_message_generator.generate_proactive_message)(
                user_id=str(request.user.id),
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
            
            return Response({
                'should_send': True,
                'message': MessageSerializer(proactive_message).data,
                'proactivity_level': conversation.proactivity_level,
                'metadata': message_data
            })
            
        except Exception as e:
            import logging
            logging.getLogger(__name__).error(f"Error generating proactive message: {e}")
            return Response({
                'should_send': False,
                'error': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    @action(detail=True, methods=['post'])
    def adjust_proactivity(self, request, pk=None):
        """
        Manually trigger proactivity adjustment.
        Normally this happens automatically, but can be triggered manually for testing.
        """
        conversation = self.get_object()
        old_level = conversation.proactivity_level
        
        conversation.adjust_proactivity()
        
        return Response({
            'old_level': old_level,
            'new_level': conversation.proactivity_level,
            'total_proactive': conversation.total_proactive_messages,
            'responses_received': conversation.proactive_responses_received,
            'response_rate': (
                conversation.proactive_responses_received / conversation.total_proactive_messages
                if conversation.total_proactive_messages > 0 else 0
            )
        })
    
    @action(detail=True, methods=['get'])
    def proactivity_settings(self, request, pk=None):
        """Get current proactivity settings for the conversation."""
        conversation = self.get_object()
        
        return Response({
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
            'response_rate': (
                conversation.proactive_responses_received / conversation.total_proactive_messages
                if conversation.total_proactive_messages > 0 else 0
            )
        })
    
    @action(detail=True, methods=['patch'])
    def update_proactivity_settings(self, request, pk=None):
        """Update proactivity settings for the conversation."""
        conversation = self.get_object()
        
        # Update enabled/disabled
        if 'proactive_messages_enabled' in request.data:
            conversation.proactive_messages_enabled = request.data['proactive_messages_enabled']
        
        # Update auto-adjust setting
        if 'auto_adjust_proactivity' in request.data:
            conversation.auto_adjust_proactivity = request.data['auto_adjust_proactivity']
        
        # Update manual proactivity level
        if 'proactivity_level' in request.data:
            level = int(request.data['proactivity_level'])
            if 1 <= level <= 10:
                conversation.proactivity_level = level
        
        # Update min/max bounds
        if 'min_proactivity_level' in request.data:
            min_level = int(request.data['min_proactivity_level'])
            if 1 <= min_level <= 10:
                conversation.min_proactivity_level = min_level
        
        if 'max_proactivity_level' in request.data:
            max_level = int(request.data['max_proactivity_level'])
            if 1 <= max_level <= 10:
                conversation.max_proactivity_level = max_level
        
        # Update quiet hours
        if 'quiet_hours_start' in request.data:
            from datetime import datetime
            time_str = request.data['quiet_hours_start']
            if time_str:
                conversation.quiet_hours_start = datetime.strptime(time_str, '%H:%M').time()
            else:
                conversation.quiet_hours_start = None
        
        if 'quiet_hours_end' in request.data:
            from datetime import datetime
            time_str = request.data['quiet_hours_end']
            if time_str:
                conversation.quiet_hours_end = datetime.strptime(time_str, '%H:%M').time()
            else:
                conversation.quiet_hours_end = None
        
        conversation.save()
        
        return Response({
            'message': 'Proactivity settings updated successfully',
            'settings': {
                'proactive_messages_enabled': conversation.proactive_messages_enabled,
                'auto_adjust_proactivity': conversation.auto_adjust_proactivity,
                'proactivity_level': conversation.proactivity_level,
                'min_proactivity_level': conversation.min_proactivity_level,
                'max_proactivity_level': conversation.max_proactivity_level,
                'quiet_hours_start': conversation.quiet_hours_start.isoformat() if conversation.quiet_hours_start else None,
                'quiet_hours_end': conversation.quiet_hours_end.isoformat() if conversation.quiet_hours_end else None,
            }
        })


class MessageViewSet(viewsets.ReadOnlyModelViewSet):
    """ViewSet for Message operations (read-only)."""
    serializer_class = MessageSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        queryset = Message.objects.filter(conversation__user=self.request.user)
        
        # Support pagination parameters
        conversation_id = self.request.query_params.get('conversation')
        before_id = self.request.query_params.get('before')  # Load messages before this message ID
        
        if conversation_id:
            queryset = queryset.filter(conversation_id=conversation_id)
        
        if before_id:
            # Get messages created before the specified message
            try:
                before_message = Message.objects.get(id=before_id)
                queryset = queryset.filter(created_at__lt=before_message.created_at)
            except Message.DoesNotExist:
                pass
        
        # Order by created_at descending (newest first), then we'll reverse in list action
        queryset = queryset.order_by('-created_at')
        
        return queryset
    
    def list(self, request, *args, **kwargs):
        """Override list to handle limit parameter and reverse order."""
        queryset = self.filter_queryset(self.get_queryset())
        
        # Handle limit parameter
        limit = self.request.query_params.get('limit')
        if limit:
            try:
                limit = int(limit)
                queryset = queryset[:limit]
            except ValueError:
                pass
        
        # Get the messages and reverse them for chronological order
        messages = list(queryset)
        messages.reverse()
        
        serializer = self.get_serializer(messages, many=True)
        return Response(serializer.data)


class TimerViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing user timers.
    Provides CRUD operations and custom actions for pause/resume/cancel.
    """
    serializer_class = TimerSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        """Return only the authenticated user's timers."""
        return Timer.objects.filter(user=self.request.user).order_by('-created_at')
    
    def perform_create(self, serializer):
        """Create a new timer for the authenticated user."""
        import logging
        logger = logging.getLogger(__name__)
        
        # Calculate end time based on duration
        duration_seconds = serializer.validated_data['duration_seconds']
        end_time = timezone.now() + timedelta(seconds=duration_seconds)
        
        logger.info(f"Creating timer for user: {self.request.user} (ID: {self.request.user.id}, PK: {self.request.user.pk})")
        logger.info(f"User type: {type(self.request.user)}, ID type: {type(self.request.user.id)}")
        
        conversation = Conversation.objects.filter(user=self.request.user).first()
        logger.info(f"Conversation: {conversation.id if conversation else None}")
        
        timer = serializer.save(
            user=self.request.user,
            conversation=conversation,
            end_time=end_time,
            status='active'
        )
        
        logger.info(f"Timer saved - timer.user: {timer.user}, timer.user.id: {timer.user.id}, timer.user_id: {timer.user_id}")
        
        # Send WebSocket update
        from channels.layers import get_channel_layer
        channel_layer = get_channel_layer()
        group_name = f"chat_{self.request.user.id}"
        logger.info(f"Sending timer_update to WebSocket group: {group_name}")
        async_to_sync(channel_layer.group_send)(
            group_name,
            {
                'type': 'timer_update',
                'action': 'created',
                'timer_id': str(timer.id),
                'message': f'Timer "{timer.name}" created'
            }
        )
    
    @action(detail=True, methods=['post'])
    def pause(self, request, pk=None):
        """Pause an active timer."""
        timer = self.get_object()
        
        if timer.status != 'active':
            return Response(
                {'error': 'Only active timers can be paused'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        timer.pause()
        
        # Send WebSocket update
        from channels.layers import get_channel_layer
        channel_layer = get_channel_layer()
        group_name = f"chat_{request.user.id}"
        async_to_sync(channel_layer.group_send)(
            group_name,
            {
                'type': 'timer_update',
                'action': 'paused',
                'timer_id': str(timer.id),
                'message': f'Timer "{timer.name}" paused'
            }
        )
        
        serializer = self.get_serializer(timer)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def resume(self, request, pk=None):
        """Resume a paused timer."""
        timer = self.get_object()
        
        if timer.status != 'paused':
            return Response(
                {'error': 'Only paused timers can be resumed'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        timer.resume()
        
        # Send WebSocket update
        from channels.layers import get_channel_layer
        channel_layer = get_channel_layer()
        group_name = f"chat_{request.user.id}"
        async_to_sync(channel_layer.group_send)(
            group_name,
            {
                'type': 'timer_update',
                'action': 'resumed',
                'timer_id': str(timer.id),
                'message': f'Timer "{timer.name}" resumed'
            }
        )
        
        serializer = self.get_serializer(timer)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def cancel(self, request, pk=None):
        """Cancel a timer."""
        timer = self.get_object()
        
        if timer.status in ['completed', 'cancelled']:
            return Response(
                {'error': 'Timer is already completed or cancelled'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        timer.cancel()
        
        # Send WebSocket update
        from channels.layers import get_channel_layer
        channel_layer = get_channel_layer()
        group_name = f"chat_{request.user.id}"
        async_to_sync(channel_layer.group_send)(
            group_name,
            {
                'type': 'timer_update',
                'action': 'cancelled',
                'timer_id': str(timer.id),
                'message': f'Timer "{timer.name}" cancelled'
            }
        )
        
        serializer = self.get_serializer(timer)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def active(self, request):
        """Get all active and paused timers for the user."""
        timers = self.get_queryset().filter(status__in=['active', 'paused'])
        serializer = self.get_serializer(timers, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['post'])
    def cancel_all(self, request):
        """Cancel all active and paused timers for the user."""
        timers = self.get_queryset().filter(status__in=['active', 'paused'])
        count = timers.count()
        
        # Cancel each timer
        for timer in timers:
            timer.cancel()
        
        # Send WebSocket update
        from channels.layers import get_channel_layer
        channel_layer = get_channel_layer()
        group_name = f"chat_{request.user.id}"
        async_to_sync(channel_layer.group_send)(
            group_name,
            {
                'type': 'timer_update',
                'action': 'cancelled_all',
                'message': f'All timers cancelled ({count} timer{"s" if count != 1 else ""})'
            }
        )
        
        return Response({
            'message': f'Successfully cancelled {count} timer{"s" if count != 1 else ""}',
            'count': count
        })
