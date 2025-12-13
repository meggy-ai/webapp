from django.db import models
from django.conf import settings
import uuid


class Conversation(models.Model):
    """
    Single continuous conversation timeline between user and Meggy AI.
    Each user has ONE conversation - this represents their ongoing relationship with Meggy.
    """
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='conversation')
    agent = models.ForeignKey('agents.Agent', on_delete=models.CASCADE, related_name='conversations')
    title = models.CharField(max_length=200, default='Chat with Meggy')
    
    # Proactive agent settings
    is_active = models.BooleanField(default=True, help_text='Whether Meggy is actively monitoring and can proactively engage')
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'conversations'
        ordering = ['-updated_at']
    
    def __str__(self):
        return f"Meggy & {self.user.email}"
    
    @classmethod
    def get_or_create_for_user(cls, user):
        """
        Get or create the single conversation for a user.
        Each user has exactly one conversation with Meggy.
        """
        conversation, created = cls.objects.get_or_create(
            user=user,
            defaults={
                'agent': user.agents.filter(is_default=True).first() or user.agents.first(),
                'title': 'Chat with Meggy',
                'is_active': True
            }
        )
        return conversation, created


class Message(models.Model):
    """Individual message in a conversation."""
    
    ROLE_CHOICES = [
        ('user', 'User'),
        ('assistant', 'Assistant'),
        ('system', 'System'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    conversation = models.ForeignKey(Conversation, on_delete=models.CASCADE, related_name='messages')
    role = models.CharField(max_length=20, choices=ROLE_CHOICES)
    content = models.TextField()
    
    # Metadata
    tokens_used = models.IntegerField(null=True, blank=True)
    model = models.CharField(max_length=100, blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'messages'
        ordering = ['created_at']
    
    def __str__(self):
        return f"{self.role}: {self.content[:50]}..."
