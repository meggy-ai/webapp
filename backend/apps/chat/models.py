from django.db import models
from django.conf import settings
import uuid


class Note(models.Model):
    """A note collection that contains multiple entries."""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='notes'
    )
    name = models.CharField(max_length=100, default='Untitled')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'notes'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['user', '-created_at']),
        ]
    
    def __str__(self):
        return f"{self.name} ({self.entry_count} entries)"
    
    @property
    def entry_count(self):
        """Get count of entries in this note."""
        return self.entries.count()


class NoteEntry(models.Model):
    """An individual entry within a note."""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    note = models.ForeignKey(
        Note,
        on_delete=models.CASCADE,
        related_name='entries'
    )
    content = models.TextField()
    position = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'note_entries'
        ordering = ['position', 'created_at']
        indexes = [
            models.Index(fields=['note', 'position']),
        ]
        verbose_name_plural = 'Note entries'
    
    def __str__(self):
        return f"{self.note.name}: {self.content[:50]}"


class Timer(models.Model):
    """A timer set by user with Meggy's help."""
    
    STATUS_CHOICES = [
        ('active', 'Active'),
        ('paused', 'Paused'),
        ('completed', 'Completed'),
        ('cancelled', 'Cancelled'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='timers'
    )
    conversation = models.ForeignKey(
        'Conversation',
        on_delete=models.CASCADE,
        related_name='timers',
        null=True,
        blank=True
    )
    
    # Timer details
    name = models.CharField(max_length=200, help_text='Description of what the timer is for')
    duration_seconds = models.IntegerField(help_text='Total duration in seconds')
    end_time = models.DateTimeField(help_text='When the timer will end')
    
    # State management
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='active')
    paused_at = models.DateTimeField(null=True, blank=True)
    remaining_seconds = models.IntegerField(null=True, blank=True, help_text='Seconds remaining when paused')
    
    # Notifications
    three_minute_warning_sent = models.BooleanField(default=False)
    completion_notification_sent = models.BooleanField(default=False)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'timers'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['user', 'status']),
            models.Index(fields=['end_time', 'status']),
        ]
    
    def __str__(self):
        return f"{self.name} ({self.get_time_remaining_display()})"
    
    def get_time_remaining(self):
        """Get seconds remaining on timer."""
        from django.utils import timezone
        
        if self.status == 'completed' or self.status == 'cancelled':
            return 0
        
        if self.status == 'paused':
            return self.remaining_seconds if self.remaining_seconds else 0
        
        # Active timer
        now = timezone.now()
        if now >= self.end_time:
            return 0
        
        return int((self.end_time - now).total_seconds())
    
    def get_time_remaining_display(self):
        """Get human-readable time remaining."""
        seconds = self.get_time_remaining()
        
        if seconds <= 0:
            return "Done"
        
        hours = seconds // 3600
        minutes = (seconds % 3600) // 60
        secs = seconds % 60
        
        if hours > 0:
            return f"{hours}h {minutes}m {secs}s"
        elif minutes > 0:
            return f"{minutes}m {secs}s"
        else:
            return f"{secs}s"
    
    def pause(self):
        """Pause the timer."""
        from django.utils import timezone
        
        if self.status != 'active':
            return False
        
        self.remaining_seconds = self.get_time_remaining()
        self.paused_at = timezone.now()
        self.status = 'paused'
        self.save()
        return True
    
    def resume(self):
        """Resume a paused timer."""
        from django.utils import timezone
        from datetime import timedelta
        
        if self.status != 'paused':
            return False
        
        # Set new end time based on remaining seconds
        self.end_time = timezone.now() + timedelta(seconds=self.remaining_seconds)
        self.status = 'active'
        self.paused_at = None
        self.save()
        return True
    
    def cancel(self):
        """Cancel the timer."""
        if self.status in ['completed', 'cancelled']:
            return False
        
        self.status = 'cancelled'
        self.save()
        return True
    
    def complete(self):
        """Mark timer as completed."""
        if self.status != 'active':
            return False
        
        self.status = 'completed'
        self.save()
        return True


class UserMemory(models.Model):
    """
    Long-term memory storage for user information.
    Stores facts, preferences, and knowledge about the user that Meggy learns over time.
    """
    
    MEMORY_TYPES = [
        ('personal', 'Personal Information'),  # Name, age, location, etc.
        ('preference', 'Preference'),  # Likes, dislikes, habits
        ('relationship', 'Relationship'),  # People in user's life
        ('goal', 'Goal/Aspiration'),  # User's goals and dreams
        ('experience', 'Past Experience'),  # Important past events
        ('skill', 'Skill/Ability'),  # What user can do
        ('fact', 'General Fact'),  # Any other factual information
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='memories'
    )
    memory_type = models.CharField(max_length=20, choices=MEMORY_TYPES, default='fact')
    key = models.CharField(max_length=200, help_text='Memory key/topic (e.g., "favorite_food", "hometown")')
    value = models.TextField(help_text='The actual memory content')
    confidence = models.FloatField(default=1.0, help_text='Confidence score 0-1')
    importance = models.IntegerField(default=5, help_text='Importance score 1-10')
    
    # When was this memory formed/last accessed
    first_mentioned = models.DateTimeField(auto_now_add=True)
    last_accessed = models.DateTimeField(auto_now=True)
    access_count = models.IntegerField(default=0)
    
    # Source tracking
    source_message_id = models.UUIDField(null=True, blank=True, help_text='Message that created this memory')
    
    class Meta:
        db_table = 'user_memories'
        ordering = ['-importance', '-last_accessed']
        indexes = [
            models.Index(fields=['user', 'memory_type']),
            models.Index(fields=['user', '-importance']),
            models.Index(fields=['user', 'key']),
        ]
        unique_together = [['user', 'key']]
    
    def __str__(self):
        return f"{self.user.email}: {self.key} = {self.value[:50]}"
    
    def access(self):
        """Increment access count and update last accessed time."""
        self.access_count += 1
        self.save(update_fields=['access_count', 'last_accessed'])


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
    proactivity_level = models.IntegerField(
        default=5,
        help_text='Proactivity level 1-10 (1=passive, 10=very proactive). Auto-adjusts based on user engagement.'
    )
    
    # User preferences for proactivity
    proactive_messages_enabled = models.BooleanField(
        default=True,
        help_text='User preference: Enable/disable proactive messages entirely'
    )
    auto_adjust_proactivity = models.BooleanField(
        default=True,
        help_text='User preference: Allow system to auto-adjust proactivity level based on engagement'
    )
    min_proactivity_level = models.IntegerField(
        default=1,
        help_text='User preference: Minimum proactivity level (prevents auto-adjustment below this)'
    )
    max_proactivity_level = models.IntegerField(
        default=10,
        help_text='User preference: Maximum proactivity level (prevents auto-adjustment above this)'
    )
    quiet_hours_start = models.TimeField(
        null=True,
        blank=True,
        help_text='User preference: Start of quiet hours (no proactive messages)'
    )
    quiet_hours_end = models.TimeField(
        null=True,
        blank=True,
        help_text='User preference: End of quiet hours'
    )
    
    # Engagement tracking
    last_user_message_at = models.DateTimeField(null=True, blank=True, help_text='When user last sent a message')
    last_proactive_message_at = models.DateTimeField(null=True, blank=True, help_text='When Meggy last initiated contact')
    total_user_messages = models.IntegerField(default=0)
    total_proactive_messages = models.IntegerField(default=0)
    proactive_responses_received = models.IntegerField(default=0, help_text='How many times user responded to proactive messages')
    
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
        # Get or create default agent for user
        from apps.agents.models import Agent
        agent = user.agents.filter(is_default=True).first() or user.agents.first()
        
        if not agent:
            # Create a default Meggy agent for this user
            agent = Agent.objects.create(
                user=user,
                name='Meggy',
                description='Your proactive AI companion',
                llm_provider='ollama',
                model='mistral:7b',
                temperature=0.7,
                max_tokens=2000,
                system_prompt=(
                    'You are Meggy, a friendly and proactive AI companion who learns about your user over time. '
                    'You have access to long-term memories about the user (their name, preferences, goals, relationships, etc.) '
                    'which will be provided at the start of each conversation. Use these memories to personalize your responses. '
                    '\n\n'
                    'You provide clear, concise responses while maintaining a warm, conversational tone. '
                    '\n\n'
                    'BUILT-IN FEATURES:\n'
                    '• Notes System: Users can say "show notes" to access their notes, create new notes, add entries, and manage their collection.\n'
                    '• Memory: You automatically remember important facts about the user (name, preferences, goals, etc.) and can reference them naturally.\n'
                    '\n'
                    'When users share personal information, acknowledge it naturally - you\'ll remember it for future conversations. '
                    'Be proactive and caring, like a good friend who pays attention and remembers what matters.'
                ),
                is_default=True,
                is_active=True
            )
        
        conversation, created = cls.objects.get_or_create(
            user=user,
            defaults={
                'agent': agent,
                'title': 'Chat with Meggy',
                'is_active': True,
                'proactivity_level': 5
            }
        )
        return conversation, created
    
    def record_user_message(self):
        """Record that user sent a message."""
        from django.utils import timezone
        self.last_user_message_at = timezone.now()
        self.total_user_messages += 1
        self.save(update_fields=['last_user_message_at', 'total_user_messages'])
    
    def record_proactive_message(self):
        """Record that Meggy initiated a proactive message."""
        from django.utils import timezone
        self.last_proactive_message_at = timezone.now()
        self.total_proactive_messages += 1
        self.save(update_fields=['last_proactive_message_at', 'total_proactive_messages'])
    
    def record_proactive_response(self):
        """Record that user responded to a proactive message."""
        self.proactive_responses_received += 1
        self.save(update_fields=['proactive_responses_received'])
    
    def adjust_proactivity(self):
        """
        Auto-adjust proactivity level based on user engagement.
        Increases if user responds well, decreases if ignored.
        Respects user-configured min/max bounds.
        """
        # Only auto-adjust if user has enabled it
        if not self.auto_adjust_proactivity:
            return
        
        if self.total_proactive_messages == 0:
            return  # No data to adjust yet
        
        # Calculate response rate to proactive messages
        response_rate = self.proactive_responses_received / self.total_proactive_messages
        
        # Adjust based on response rate
        if response_rate > 0.7:  # High engagement - increase proactivity
            new_level = min(self.max_proactivity_level, self.proactivity_level + 1)
        elif response_rate < 0.3:  # Low engagement - decrease proactivity
            new_level = max(self.min_proactivity_level, self.proactivity_level - 1)
        else:
            new_level = self.proactivity_level  # Keep current level
        
        if new_level != self.proactivity_level:
            self.proactivity_level = new_level
            self.save(update_fields=['proactivity_level'])
    
    def should_send_proactive_message(self):
        """
        Determine if Meggy should send a proactive message.
        Returns (should_send: bool, reason: str) tuple.
        """
        from django.utils import timezone
        from datetime import timedelta, time as dt_time
        
        # Check user preferences
        if not self.proactive_messages_enabled:
            return False, "Proactive messages disabled by user"
        
        # Check quiet hours
        if self.quiet_hours_start and self.quiet_hours_end:
            current_time = timezone.now().time()
            if self.quiet_hours_start < self.quiet_hours_end:
                # Normal range (e.g., 22:00 - 08:00 next day)
                if self.quiet_hours_start <= current_time <= self.quiet_hours_end:
                    return False, "Currently in quiet hours"
            else:
                # Overnight range (e.g., 22:00 - 08:00 crosses midnight)
                if current_time >= self.quiet_hours_start or current_time <= self.quiet_hours_end:
                    return False, "Currently in quiet hours"
        
        if not self.is_active:
            return False, "Conversation is not active"
        
        if self.proactivity_level < 1:
            return False, "Proactivity level is too low"
        
        now = timezone.now()
        
        # Calculate cooldown period based on proactivity level
        # Level 10 = 30 min, Level 5 = 2 hours, Level 1 = 8 hours
        hours_cooldown = 8 - (self.proactivity_level - 1) * 0.75
        cooldown = timedelta(hours=hours_cooldown)
        
        # Check if enough time has passed since last proactive message
        if self.last_proactive_message_at:
            time_since_last = now - self.last_proactive_message_at
            if time_since_last < cooldown:
                remaining = cooldown - time_since_last
                return False, f"Cooldown period not met. Wait {remaining.total_seconds() / 60:.0f} more minutes"
        
        # Check if user has been away for a while
        if self.last_user_message_at:
            time_since_user = now - self.last_user_message_at
            # Only send if user hasn't messaged recently (at least 30 min)
            if time_since_user < timedelta(minutes=30):
                return False, f"User messaged recently ({time_since_user.total_seconds() / 60:.0f} min ago)"
            return True, f"User has been away for {time_since_user.total_seconds() / 60:.0f} minutes"
        
        # First time - send a proactive message
        return True, "First proactive message"


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
