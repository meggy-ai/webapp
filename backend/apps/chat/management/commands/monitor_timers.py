"""
Management command to monitor active timers and send notifications.
Runs continuously in a loop, checking every 10 seconds.
"""
import asyncio
import time
from django.core.management.base import BaseCommand
from django.utils import timezone
from datetime import timedelta
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync
from apps.chat.models import Timer


class Command(BaseCommand):
    help = 'Monitor active timers and send notifications for warnings and completions'

    def handle(self, *args, **options):
        """Check all active timers and send notifications continuously."""
        self.stdout.write(self.style.SUCCESS('Starting timer monitor service...'))
        
        while True:
            try:
                self.check_timers()
                time.sleep(10)  # Check every 10 seconds
            except KeyboardInterrupt:
                self.stdout.write(self.style.WARNING('Stopping timer monitor service...'))
                break
            except Exception as e:
                self.stdout.write(self.style.ERROR(f'Error in timer monitor: {str(e)}'))
                time.sleep(10)
    
    def check_timers(self):
        """Check all active timers and send notifications."""
        channel_layer = get_channel_layer()
        now = timezone.now()
        
        # Get all active timers
        active_timers = Timer.objects.filter(status='active')
        
        self.stdout.write(f"Checking {active_timers.count()} active timers...")
        
        # Send periodic update for all active timers (for real-time countdown)
        for timer in active_timers:
            group_name = f"chat_{str(timer.user.id)}"
            try:
                async_to_sync(channel_layer.group_send)(
                    group_name,
                    {
                        'type': 'timer_update',
                        'action': 'tick',
                        'timer_id': str(timer.id),
                    }
                )
            except Exception:
                pass  # Silent fail for tick updates
        
        for timer in active_timers:
            time_remaining = timer.get_time_remaining()
            
            self.stdout.write(f"Timer '{timer.name}': {time_remaining}s remaining, warning_sent={timer.three_minute_warning_sent}")
            
            # Check if timer has completed
            if time_remaining <= 0:
                self.handle_timer_completion(timer, channel_layer)
                continue
            
            # Check if 3-minute warning should be sent
            # Send warning when less than 3 minutes remaining (wider window)
            # Use 185 seconds (3:05) to ensure we catch it
            if time_remaining <= 185 and not timer.three_minute_warning_sent:
                self.stdout.write(f"⚠️ Triggering 3-minute warning for '{timer.name}'")
                self.handle_three_minute_warning(timer, channel_layer)
    
    def handle_timer_completion(self, timer, channel_layer):
        """Handle timer completion - mark complete and send notification."""
        timer.complete()
        
        self.stdout.write(
            self.style.SUCCESS(f"Timer '{timer.name}' completed for user {timer.user.email}")
        )
        
        # Send WebSocket notification  
        group_name = f"chat_{str(timer.user.id)}"
        self.stdout.write(f"DEBUG: Timer user ID = {timer.user.id}, Group name = {group_name}")
        
        notification_data = {
            'type': 'timer_completed',
            'timer_id': str(timer.id),
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
        group_name = f"chat_{str(timer.user.id)}"
        self.stdout.write(f"DEBUG: Timer user ID = {timer.user.id}, Group name = {group_name}")
        
        notification_data = {
            'type': 'timer_warning',
            'timer_id': str(timer.id),
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
