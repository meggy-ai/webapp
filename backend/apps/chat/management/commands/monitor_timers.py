"""
Management command to monitor active timers and send notifications.
Should be run periodically (e.g., every 30-60 seconds) via a scheduler like cron or celery beat.
"""
import asyncio
from django.core.management.base import BaseCommand
from django.utils import timezone
from datetime import timedelta
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync
from apps.chat.models import Timer


class Command(BaseCommand):
    help = 'Monitor active timers and send notifications for warnings and completions'

    def handle(self, *args, **options):
        """Check all active timers and send notifications."""
        channel_layer = get_channel_layer()
        now = timezone.now()
        
        # Get all active timers
        active_timers = Timer.objects.filter(status='active')
        
        self.stdout.write(f"Checking {active_timers.count()} active timers...")
        
        for timer in active_timers:
            time_remaining = timer.get_time_remaining()
            
            # Check if timer has completed
            if time_remaining <= 0:
                self.handle_timer_completion(timer, channel_layer)
                continue
            
            # Check if 3-minute warning should be sent
            # Send warning when between 3 minutes and 2:30 minutes remaining
            # (30-second window to avoid missing it)
            if 150 <= time_remaining <= 180 and not timer.three_minute_warning_sent:
                self.handle_three_minute_warning(timer, channel_layer)
    
    def handle_timer_completion(self, timer, channel_layer):
        """Handle timer completion - mark complete and send notification."""
        timer.complete()
        
        self.stdout.write(
            self.style.SUCCESS(f"Timer '{timer.name}' completed for user {timer.user.email}")
        )
        
        # Send WebSocket notification
        group_name = f"chat_{timer.user.id}"
        
        notification_data = {
            'type': 'timer_completed',
            'timer_id': timer.id,
            'timer_name': timer.name,
            'message': f"⏰ Timer '{timer.name}' has completed!"
        }
        
        try:
            async_to_sync(channel_layer.group_send)(
                group_name,
                notification_data
            )
            self.stdout.write(
                self.style.SUCCESS(f"Sent completion notification to {group_name}")
            )
        except Exception as e:
            self.stdout.write(
                self.style.ERROR(f"Error sending notification: {str(e)}")
            )
    
    def handle_three_minute_warning(self, timer, channel_layer):
        """Handle 3-minute warning - mark sent and send notification."""
        timer.three_minute_warning_sent = True
        timer.save(update_fields=['three_minute_warning_sent'])
        
        self.stdout.write(
            self.style.WARNING(f"3-minute warning for timer '{timer.name}'")
        )
        
        # Send WebSocket notification
        group_name = f"chat_{timer.user.id}"
        
        notification_data = {
            'type': 'timer_warning',
            'timer_id': timer.id,
            'timer_name': timer.name,
            'time_remaining': timer.get_time_remaining(),
            'message': f"⏰ Timer '{timer.name}' will complete in 3 minutes!"
        }
        
        try:
            async_to_sync(channel_layer.group_send)(
                group_name,
                notification_data
            )
            self.stdout.write(
                self.style.SUCCESS(f"Sent 3-minute warning to {group_name}")
            )
        except Exception as e:
            self.stdout.write(
                self.style.ERROR(f"Error sending notification: {str(e)}")
            )
