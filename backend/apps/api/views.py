from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from django.contrib.auth import authenticate
from django.utils import timezone
from datetime import timedelta
from asgiref.sync import async_to_sync
import logging
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
        
        # Delegate to message service for business logic
        from core.services.message_service import MessageService
        message_service = MessageService()
        
        result = message_service.process_message(
            conversation=conversation,
            content=content,
            is_response_to_proactive=is_response_to_proactive,
            is_task_command_override=is_task_command_override
        )
        
        # Format response
        response_data = {
            'user_message': MessageSerializer(result['user_message']).data,
            'assistant_message': MessageSerializer(result['assistant_message']).data,
            'success': result['success']
        }
        
        if not result['success']:
            response_data['error'] = result.get('error')
            return Response(response_data, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
        return Response(response_data)
    
    @action(detail=True, methods=['get'])
    def check_proactive(self, request, pk=None):
        """
        Check if a proactive message should be sent.
        Returns message if it should be sent, or null if not.
        """
        conversation = self.get_object()
        
        # Delegate to proactive message service
        from core.services.proactive_message_service import ProactiveMessageService
        proactive_service = ProactiveMessageService()
        
        result = proactive_service.check_and_generate_proactive_message(conversation)
        
        if not result['should_send']:
            return Response(result)
        
        if 'error' in result:
            return Response(result, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
        # Serialize the message for response
        result['message'] = MessageSerializer(result['message']).data
        return Response(result)
    
    @action(detail=True, methods=['post'])
    def adjust_proactivity(self, request, pk=None):
        """
        Manually trigger proactivity adjustment.
        Normally this happens automatically, but can be triggered manually for testing.
        """
        conversation = self.get_object()
        
        # Delegate to proactive message service
        from core.services.proactive_message_service import ProactiveMessageService
        proactive_service = ProactiveMessageService()
        
        result = proactive_service.adjust_proactivity(conversation)
        return Response(result)
    
    @action(detail=True, methods=['get'])
    def proactivity_settings(self, request, pk=None):
        """Get current proactivity settings for the conversation."""
        conversation = self.get_object()
        
        # Delegate to proactive message service
        from core.services.proactive_message_service import ProactiveMessageService
        proactive_service = ProactiveMessageService()
        
        settings = proactive_service.get_proactivity_settings(conversation)
        return Response(settings)
    
    @action(detail=True, methods=['patch'])
    def update_proactivity_settings(self, request, pk=None):
        """Update proactivity settings for the conversation."""
        conversation = self.get_object()
        
        # Delegate to proactive message service
        from core.services.proactive_message_service import ProactiveMessageService
        proactive_service = ProactiveMessageService()
        
        result = proactive_service.update_proactivity_settings(conversation, request.data)
        return Response(result)


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
