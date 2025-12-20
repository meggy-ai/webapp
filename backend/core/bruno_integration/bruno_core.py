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
    
    def __init__(self, config: AgentConfig, llm_client, memory_manager=None, notes_ability=None, timer_ability=None):
        self.config = config
        self.llm_client = llm_client
        self.memory_manager = memory_manager
        self.notes_ability = notes_ability
        self.timer_ability = timer_ability
        logger.info(f"Initialized BrunoAgent: {config.name} with {config.llm_provider}/{config.model}")
    
    async def process_message(
        self,
        user_message: str,
        conversation_id: str,
        user_id: str = None,
        context: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """
        Process a user message and generate a response.
        
        Args:
            user_message: The user's input message
            conversation_id: ID of the conversation
            user_id: ID of the user (for notes functionality)
            context: Additional context for the conversation
            
        Returns:
            Dict containing response, tokens used, and metadata
        """
        try:
            # Check if this is a timer command first
            if self.timer_ability and user_id:
                timer_response = await self.timer_ability.handle_timer_command(
                    user_id=user_id,
                    conversation_id=conversation_id,
                    command=user_message
                )
                if timer_response:
                    # This was a timer command - return timer response
                    return {
                        "content": timer_response,
                        "model": self.config.model,
                        "tokens_used": 0,
                        "success": True,
                        "is_timer_response": True
                    }
            
            # Check if this is a notes command
            if self.notes_ability and user_id:
                notes_response = await self.notes_ability.handle_notes_command(
                    user_id=user_id,
                    conversation_id=conversation_id,
                    command=user_message
                )
                if notes_response:
                    # This was a notes command - return notes response
                    return {
                        "content": notes_response,
                        "model": self.config.model,
                        "tokens_used": 0,
                        "success": True,
                        "is_notes_response": True
                    }
            

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
            system_prompt = self.config.system_prompt
            
            # For task commands, prepend instruction for concise response
            is_task_command = context and context.get("is_task_command", False)
            if is_task_command:
                logger.info("🔍 Task command detected - using concise response mode")
                system_prompt = (
                    "**CRITICAL INSTRUCTION: This is a TASK COMMAND (timer/reminder/note). "
                    "You MUST respond with EXACTLY ONE SHORT sentence confirming the task. "
                    "Example: 'Timer set for 4 minutes.' or '4-minute timer started.' "
                    "DO NOT add any conversational text, questions, or additional commentary. "
                    "JUST confirm the task action in 5-10 words maximum.**\n\n"
                    + system_prompt
                )
            
            messages = [
                {"role": "system", "content": system_prompt}
            ]
            
            # Inject long-term memories into context if available (skip for task commands)
            if user_id and not is_task_command:
                from core.bruno_integration.memory_extraction import memory_extractor
                memory_context = await memory_extractor.format_memories_for_context(user_id, limit=10)
                if memory_context:
                    messages.append({
                        "role": "system",
                        "content": memory_context
                    })
                    logger.info(f"Injected long-term memories into context for user {user_id}")
            
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
