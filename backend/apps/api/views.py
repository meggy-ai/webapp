from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from django.contrib.auth import authenticate
from asgiref.sync import async_to_sync
from apps.accounts.models import User
from apps.agents.models import Agent
from apps.chat.models import Conversation, Message
from core.services import chat_service
from .serializers import (
    UserSerializer, UserCreateSerializer,
    AgentSerializer,
    ConversationSerializer, ConversationListSerializer,
    MessageSerializer
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
        
        if not content:
            return Response(
                {'error': 'Content is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
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
            # Process message through Bruno chat service
            response = async_to_sync(chat_service.process_message)(
                conversation_id=str(conversation.id),
                user_message=content,
                agent_id=str(conversation.agent.id),
                user_id=str(request.user.id)
            )
            
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
