"""
Chat Service - Handles chat operations with Bruno integration
"""
from typing import Dict, Optional, Any
import logging
from asgiref.sync import sync_to_async

from apps.chat.models import Conversation, Message
from apps.agents.models import Agent
from core.bruno_integration import (
    BrunoAgent,
    AgentConfig,
    LLMFactory,
    MemoryManager,
    DjangoMemoryBackend,
    create_default_abilities
)
from core.services.command_detector import CommandDetector

logger = logging.getLogger(__name__)


class ChatService:
    """Service for handling chat operations."""
    
    def __init__(self):
        """Initialize chat service."""
        self.agent_instances: Dict[str, BrunoAgent] = {}
        self.memory_backend = DjangoMemoryBackend(Message, Conversation)
        self.memory_manager = MemoryManager(db_backend=self.memory_backend)
        self.ability_manager = create_default_abilities()
        
        # Initialize notes ability
        from core.bruno_integration.notes_ability import NotesAbility
        self.notes_ability = NotesAbility()
        
        # Initialize timer ability
        from core.bruno_integration.timer_ability import TimerAbility
        self.timer_ability = TimerAbility()
        
        # Initialize command detector
        self.command_detector = CommandDetector()
        
        logger.info("Initialized ChatService")
    
    async def get_or_create_agent(self, agent_id: str) -> BrunoAgent:
        """
        Get or create a Bruno agent instance.
        
        Args:
            agent_id: Database ID of the agent
            
        Returns:
            BrunoAgent instance
        """
        # Check if agent is already initialized
        if agent_id in self.agent_instances:
            return self.agent_instances[agent_id]
        
        # Load agent configuration from database
        @sync_to_async
        def get_agent_config():
            agent = Agent.objects.get(id=agent_id)
            return AgentConfig(
                name=agent.name,
                model=agent.model,
                temperature=agent.temperature,
                max_tokens=agent.max_tokens,
                system_prompt=agent.system_prompt,
                llm_provider=agent.llm_provider
            )
        
        config = await get_agent_config()
        
        # Create LLM client
        llm_client = LLMFactory.create_client(
            provider=config.llm_provider,
            base_url='http://localhost:11434'  # Ollama default URL
        )
        
        # Create Bruno agent
        bruno_agent = BrunoAgent(
            config=config,
            llm_client=llm_client,
            memory_manager=self.memory_manager,
            notes_ability=self.notes_ability,
            timer_ability=self.timer_ability
        )
        
        # Cache the agent instance
        self.agent_instances[agent_id] = bruno_agent
        
        logger.info(f"Created Bruno agent for agent_id: {agent_id}")
        return bruno_agent
    
    async def process_message(
        self,
        conversation_id: str,
        user_message: str,
        agent_id: str,
        user_id: str = None,
        is_task_command: bool = False
    ) -> Dict[str, Any]:
        """
        Process a user message and generate a response.
        
        Args:
            conversation_id: ID of the conversation
            user_message: User's input message
            agent_id: ID of the agent to use
            user_id: ID of the user (for notes functionality)
            is_task_command: Whether this is a task command (timer, reminder, note)
            
        Returns:
            Dict with response content and metadata
        """
        try:
            # Get or create agent
            agent = await self.get_or_create_agent(agent_id)
            
            # Process message through Bruno agent
            response = await agent.process_message(
                user_message=user_message,
                conversation_id=conversation_id,
                user_id=user_id,
                context={"is_task_command": is_task_command}
            )
            
            return response
            
        except Exception as e:
            logger.error(f"Error processing message: {str(e)}", exc_info=True)
            return {
                "content": "I apologize, but I encountered an error. Please try again.",
                "success": False,
                "error": str(e)
            }
    
    async def create_conversation(
        self,
        user_id: str,
        agent_id: str,
        title: str = "New Conversation"
    ) -> str:
        """
        Create a new conversation.
        
        Args:
            user_id: ID of the user
            agent_id: ID of the agent
            title: Title for the conversation
            
        Returns:
            ID of the created conversation
        """
        @sync_to_async
        def _create():
            from django.contrib.auth import get_user_model
            User = get_user_model()
            
            user = User.objects.get(id=user_id)
            agent = Agent.objects.get(id=agent_id)
            
            conversation = Conversation.objects.create(
                user=user,
                agent=agent,
                title=title
            )
            return str(conversation.id)
        
        conversation_id = await _create()
        logger.info(f"Created conversation: {conversation_id}")
        return conversation_id
    
    async def get_conversation_history(
        self,
        conversation_id: str,
        limit: Optional[int] = None
    ) -> list:
        """Get conversation message history."""
        messages = await self.memory_manager.get_history(conversation_id, limit)
        return messages
    
    def clear_agent_cache(self, agent_id: Optional[str] = None):
        """Clear cached agent instances."""
        if agent_id:
            if agent_id in self.agent_instances:
                del self.agent_instances[agent_id]
                logger.info(f"Cleared cache for agent: {agent_id}")
        else:
            self.agent_instances.clear()
            logger.info("Cleared all agent cache")


# Global chat service instance
chat_service = ChatService()
