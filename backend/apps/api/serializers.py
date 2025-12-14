from rest_framework import serializers
from apps.accounts.models import User
from apps.agents.models import Agent
from apps.chat.models import Conversation, Message, Timer


class UserSerializer(serializers.ModelSerializer):
    """Serializer for User model."""
    
    class Meta:
        model = User
        fields = ['id', 'email', 'name', 'avatar_url', 'is_active', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']


class UserCreateSerializer(serializers.ModelSerializer):
    """Serializer for user registration."""
    password = serializers.CharField(write_only=True, min_length=8)
    
    class Meta:
        model = User
        fields = ['email', 'name', 'password']
    
    def create(self, validated_data):
        return User.objects.create_user(**validated_data)


class AgentSerializer(serializers.ModelSerializer):
    """Serializer for Agent model."""
    
    class Meta:
        model = Agent
        fields = [
            'id', 'name', 'description', 'llm_provider', 'model',
            'temperature', 'max_tokens', 'system_prompt',
            'is_default', 'is_active', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class MessageSerializer(serializers.ModelSerializer):
    """Serializer for Message model."""
    
    class Meta:
        model = Message
        fields = ['id', 'conversation', 'role', 'content', 'tokens_used', 'model', 'created_at']
        read_only_fields = ['id', 'created_at']


class ConversationSerializer(serializers.ModelSerializer):
    """Serializer for Conversation model."""
    messages = MessageSerializer(many=True, read_only=True)
    message_count = serializers.SerializerMethodField()
    
    class Meta:
        model = Conversation
        fields = [
            'id', 'agent', 'title', 'messages', 'message_count',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']
    
    def get_message_count(self, obj):
        return obj.messages.count()


class ConversationListSerializer(serializers.ModelSerializer):
    """Lightweight serializer for conversation lists."""
    message_count = serializers.SerializerMethodField()
    last_message = serializers.SerializerMethodField()
    
    class Meta:
        model = Conversation
        fields = ['id', 'agent', 'title', 'message_count', 'last_message', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']
    
    def get_message_count(self, obj):
        return obj.messages.count()
    
    def get_last_message(self, obj):
        last_msg = obj.messages.last()
        if last_msg:
            return {
                'role': last_msg.role,
                'content': last_msg.content[:100],
                'created_at': last_msg.created_at
            }
        return None


class TimerSerializer(serializers.ModelSerializer):
    """Serializer for Timer model."""
    time_remaining = serializers.SerializerMethodField()
    time_remaining_display = serializers.SerializerMethodField()
    
    class Meta:
        model = Timer
        fields = [
            'id', 'name', 'duration_seconds', 'end_time', 'status',
            'time_remaining', 'time_remaining_display',
            'three_minute_warning_sent', 'completion_notification_sent',
            'created_at', 'updated_at'
        ]
        read_only_fields = [
            'id', 'three_minute_warning_sent', 'completion_notification_sent',
            'created_at', 'updated_at'
        ]
    
    def get_time_remaining(self, obj):
        return obj.get_time_remaining()
    
    def get_time_remaining_display(self, obj):
        return obj.get_time_remaining_display()
