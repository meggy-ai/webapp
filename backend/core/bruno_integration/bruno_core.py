"""
Bruno Core - Core agent functionality
"""
from typing import Dict, List, Optional, Any
from dataclasses import dataclass
import logging

logger = logging.getLogger(__name__)


@dataclass
class AgentConfig:
    """Configuration for an AI agent."""
    name: str
    model: str
    temperature: float = 0.7
    max_tokens: int = 2000
    system_prompt: str = "You are Bruno, a helpful AI assistant."
    llm_provider: str = "ollama"


class BrunoAgent:
    """Core Bruno AI Agent."""
    
    def __init__(self, config: AgentConfig, llm_client, memory_manager=None):
        self.config = config
        self.llm_client = llm_client
        self.memory_manager = memory_manager
        logger.info(f"Initialized BrunoAgent: {config.name} with {config.llm_provider}/{config.model}")
    
    async def process_message(
        self,
        user_message: str,
        conversation_id: str,
        context: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """
        Process a user message and generate a response.
        
        Args:
            user_message: The user's input message
            conversation_id: ID of the conversation
            context: Additional context for the conversation
            
        Returns:
            Dict containing response, tokens used, and metadata
        """
        try:
            # Get conversation history from memory if available
            conversation_history = []
            if self.memory_manager:
                conversation_history = await self.memory_manager.get_history(
                    conversation_id, limit=10
                )
            
            logger.info(f"Conversation history retrieved: {len(conversation_history)} messages for {conversation_id}")
            for i, msg in enumerate(conversation_history):
                logger.info(f"  History {i+1}: [{msg['role']}] {msg['content'][:50]}...")
            
            # Build messages for LLM
            messages = [
                {"role": "system", "content": self.config.system_prompt}
            ]
            
            # Add conversation history (excluding the last user message if it matches current input)
            # This prevents duplicate messages when the current user message is already in history
            for msg in conversation_history:
                # Skip if this is the current user message (already in DB before this function is called)
                if msg["role"] == "user" and msg["content"] == user_message:
                    continue
                messages.append({
                    "role": msg["role"],
                    "content": msg["content"]
                })
            
            # Add current user message (might be duplicate from history, but we ensure uniqueness above)
            messages.append({
                "role": "user",
                "content": user_message
            })
            
            logger.info(f"Total messages being sent to LLM: {len(messages)}")
            
            # Generate response using LLM
            response = await self.llm_client.generate(
                messages=messages,
                model=self.config.model,
                temperature=self.config.temperature,
                max_tokens=self.config.max_tokens
            )
            
            # Note: Messages are saved to database by views.py, not here
            # Memory manager only reads from database for conversation history
            
            return {
                "content": response["content"],
                "model": self.config.model,
                "tokens_used": response.get("tokens_used", 0),
                "success": True
            }
            
        except Exception as e:
            logger.error(f"Error processing message: {str(e)}", exc_info=True)
            return {
                "content": "I apologize, but I encountered an error processing your message. Please try again.",
                "model": self.config.model,
                "tokens_used": 0,
                "success": False,
                "error": str(e)
            }
    
    def update_config(self, **kwargs):
        """Update agent configuration."""
        for key, value in kwargs.items():
            if hasattr(self.config, key):
                setattr(self.config, key, value)
        logger.info(f"Updated agent config: {kwargs}")
