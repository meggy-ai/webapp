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
        
        if not content:
            return Response(
                {'error': 'Content is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
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
                agent_id=str(conversation.agent.id)
            )
            
            # Create assistant message with response
            assistant_message = Message.objects.create(
                conversation=conversation,
                role='assistant',
                content=response.get('content', 'I apologize, but I encountered an error.'),
                model=response.get('model', conversation.agent.model),
                tokens_used=response.get('tokens_used', 0)
            )
            
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


class MessageViewSet(viewsets.ReadOnlyModelViewSet):
    """ViewSet for Message operations (read-only)."""
    serializer_class = MessageSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        return Message.objects.filter(conversation__user=self.request.user)
