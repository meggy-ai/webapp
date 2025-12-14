"""
Proactive message generation for Meggy AI.
Generates contextual, friendly messages to initiate conversations.
"""
from typing import Dict, Any, Optional
import logging
import random
from datetime import datetime
from asgiref.sync import sync_to_async

logger = logging.getLogger(__name__)


class ProactiveMessageGenerator:
    """Generates proactive messages for Meggy to initiate conversations."""
    
    def __init__(self):
        logger.info("Initialized ProactiveMessageGenerator")
    
    async def generate_proactive_message(
        self,
        user_id: str,
        conversation_id: str,
        proactivity_level: int = 5
    ) -> Dict[str, Any]:
        """
        Generate a proactive message based on context and proactivity level.
        
        Args:
            user_id: User's ID
            conversation_id: Conversation ID
            proactivity_level: Current proactivity level (1-10)
            
        Returns:
            Dict with message content and metadata
        """
        # Get user memories and context
        from core.bruno_integration.memory_extraction import memory_extractor
        memories = await memory_extractor.get_relevant_memories(user_id, limit=5)
        
        # Get user's name if available
        user_name = None
        for mem in memories:
            if mem['key'] == 'user_name':
                user_name = mem['value']
                break
        
        # Get time of day for context
        hour = datetime.now().hour
        time_of_day = self._get_time_of_day(hour)
        
        # Generate message based on proactivity level
        if proactivity_level >= 8:
            # Very proactive - personal and engaging
            message = await self._generate_high_proactivity_message(
                user_name, time_of_day, memories
            )
        elif proactivity_level >= 5:
            # Moderate - friendly check-in
            message = await self._generate_medium_proactivity_message(
                user_name, time_of_day, memories
            )
        else:
            # Low proactivity - gentle and respectful
            message = await self._generate_low_proactivity_message(
                user_name, time_of_day
            )
        
        return {
            'content': message,
            'proactivity_level': proactivity_level,
            'timestamp': datetime.now().isoformat()
        }
    
    def _get_time_of_day(self, hour: int) -> str:
        """Get time of day category."""
        if 5 <= hour < 12:
            return 'morning'
        elif 12 <= hour < 17:
            return 'afternoon'
        elif 17 <= hour < 21:
            return 'evening'
        else:
            return 'night'
    
    async def _generate_high_proactivity_message(
        self,
        user_name: Optional[str],
        time_of_day: str,
        memories: list
    ) -> str:
        """Generate highly proactive, personalized message."""
        greeting = f"Hey {user_name}! " if user_name else "Hey there! "
        
        # Personalized based on memories
        if memories:
            # Find a relevant memory to reference
            for mem in memories:
                if mem['type'] == 'goal':
                    return (
                        f"{greeting}I was thinking about your goal to {mem['value'].lower()}. "
                        f"How's that going? Any progress or challenges you'd like to talk about?"
                    )
                elif mem['type'] == 'preference':
                    if 'likes' in mem['key'].lower():
                        return (
                            f"{greeting}I remember you mentioned you enjoy {mem['value'].lower()}. "
                            f"Done anything fun with that lately?"
                        )
        
        # Time-based greetings
        messages = {
            'morning': [
                f"{greeting}Good morning! How are you starting your day?",
                f"{greeting}Hope you're having a great morning! What's on your agenda today?",
                f"{greeting}Morning! Anything exciting planned for today?"
            ],
            'afternoon': [
                f"{greeting}How's your day going so far?",
                f"{greeting}Hope you're having a good afternoon! How are things?",
                f"{greeting}Just checking in - how's everything going today?"
            ],
            'evening': [
                f"{greeting}How was your day?",
                f"{greeting}Hope you had a good day! How are you doing this evening?",
                f"{greeting}Evening! Anything interesting happen today?"
            ],
            'night': [
                f"{greeting}Still up? How are you doing?",
                f"{greeting}Hope you had a good day! Winding down for the evening?",
                f"{greeting}How's your night going?"
            ]
        }
        
        return random.choice(messages.get(time_of_day, messages['afternoon']))
    
    async def _generate_medium_proactivity_message(
        self,
        user_name: Optional[str],
        time_of_day: str,
        memories: list
    ) -> str:
        """Generate moderately proactive message."""
        greeting = f"Hi {user_name}! " if user_name else "Hi! "
        
        messages = {
            'morning': [
                f"{greeting}Hope you're having a good morning! 😊",
                f"{greeting}Just wanted to say hi! How are you?",
                f"{greeting}Good morning! Hope your day is going well."
            ],
            'afternoon': [
                f"{greeting}Hope your day is going well! 😊",
                f"{greeting}Just checking in - how are you doing?",
                f"{greeting}Hi there! How's everything?"
            ],
            'evening': [
                f"{greeting}Hope you had a good day!",
                f"{greeting}How are you doing this evening?",
                f"{greeting}Just wanted to check in and say hi!"
            ],
            'night': [
                f"{greeting}Hope you had a great day!",
                f"{greeting}Just saying hi! How are you?",
                f"{greeting}Evening! Hope all is well."
            ]
        }
        
        return random.choice(messages.get(time_of_day, messages['afternoon']))
    
    async def _generate_low_proactivity_message(
        self,
        user_name: Optional[str],
        time_of_day: str
    ) -> str:
        """Generate gentle, low-key proactive message."""
        greeting = f"Hi {user_name}" if user_name else "Hi"
        
        messages = [
            f"{greeting} 👋",
            f"{greeting}! Hope you're doing well 😊",
            f"{greeting}, just wanted to say hello!",
            f"Hey! Hope everything is going well 🌟"
        ]
        
        return random.choice(messages)


# Global instance
proactive_message_generator = ProactiveMessageGenerator()
