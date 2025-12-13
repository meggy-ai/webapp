from django.db import models
from django.conf import settings
import uuid


class Agent(models.Model):
    """AI Agent instance for a user."""
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='agents')
    name = models.CharField(max_length=100, default='Bruno')
    description = models.TextField(blank=True)
    
    # Agent configuration
    llm_provider = models.CharField(max_length=50, default='ollama')  # openai, ollama
    model = models.CharField(max_length=100, default='llama3.2:latest')
    temperature = models.FloatField(default=0.7)
    max_tokens = models.IntegerField(default=2000)
    system_prompt = models.TextField(default='You are Bruno, a helpful AI assistant.')
    
    is_default = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'agents'
        ordering = ['-created_at']
        unique_together = [['user', 'name']]
    
    def __str__(self):
        return f"{self.name} ({self.user.email})"
    
    def save(self, *args, **kwargs):
        # Ensure only one default agent per user
        if self.is_default:
            Agent.objects.filter(user=self.user, is_default=True).update(is_default=False)
        super().save(*args, **kwargs)
