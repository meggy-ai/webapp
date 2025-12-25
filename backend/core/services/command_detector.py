"""
Command Detector Service - Uses LLM to detect if a message is a command
"""
from typing import Dict, Optional
import logging
import json
from core.bruno_integration.bruno_llm import OllamaClient

logger = logging.getLogger(__name__)


class CommandDetector:
    """Service to detect if a user message is a command using LLM."""
    
    DETECTION_PROMPT = """You are a command detector. Your job is to determine if a user message is a COMMAND or a CONVERSATION.

            Commands are requests that require ACTION, such as:
            - Setting timers, reminders, or alarms
            - Creating, updating, or deleting notes
            - Managing tasks or to-do items
            - Performing calculations
            - Looking up information that requires tool usage

            Conversations are:
            - Greetings, small talk, or general chat
            - Questions about concepts or explanations
            - Discussions that don't require specific actions
            - Follow-up questions about previous topics

            Analyze the message and respond with ONLY a JSON object in this exact format:
            {{"is_command": true/false, "command_type": "timer|reminder|note|task|calculation|lookup|other", "confidence": 0.0-1.0}}

            Examples:
            User: "set a timer for 10 minutes"
            {{"is_command": true, "command_type": "timer", "confidence": 0.95}}

            User: "remind me to call mom at 5pm"
            {{"is_command": true, "command_type": "reminder", "confidence": 0.9}}

            User: "create a note about the meeting"
            {{"is_command": true, "command_type": "note", "confidence": 0.85}}

            User: "cancel all timers"
            {{"is_command": true, "command_type": "timer", "confidence": 0.95}}

            User: "what's the weather like?"
            {{"is_command": false, "command_type": "other", "confidence": 0.8}}

            User: "how are you?"
            {{"is_command": false, "command_type": "other", "confidence": 0.95}}

            User: "tell me about Python"
            {{"is_command": false, "command_type": "other", "confidence": 0.85}}

            Now analyze this message:
            User: "{message}"

            Respond with ONLY the JSON object, nothing else."""

    def __init__(self, llm_client: Optional[OllamaClient] = None):
        """
        Initialize command detector.
        
        Args:
            llm_client: Optional LLM client. If not provided, creates a default Ollama client.
        """
        self.llm_client = llm_client or OllamaClient(base_url="http://localhost:11434")
        logger.info("Initialized CommandDetector")
    
    async def detect_command(self, message: str, model: str = "mistral:7b") -> Dict:
        """
        Detect if a message is a command using LLM.
        
        Args:
            message: User message to analyze
            model: LLM model to use for detection
            
        Returns:
            Dict with keys:
                - is_command: bool
                - command_type: str (timer|reminder|note|task|calculation|lookup|other)
                - confidence: float (0.0-1.0)
                - raw_response: str (for debugging)
        """
        try:
            # Build detection prompt
            prompt = self.DETECTION_PROMPT.format(message=message.strip())
            
            logger.info(f"🔍 Detecting command for message: '{message}'")
            
            # Call LLM with low temperature for consistent results
            response = await self.llm_client.generate(
                model=model,
                messages=[
                    {"role": "system", "content": "You are a precise command detector. Respond only with JSON."},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.1,  # Low temperature for consistency
                max_tokens=100    # Short response expected
            )
            
            response_text = response['content'].strip()
            logger.info(f"📥 LLM response: {response_text}")
            
            # Try to extract JSON from response
            result = self._parse_detection_response(response_text)
            result['raw_response'] = response_text
            
            logger.info(f"✅ Detection result: is_command={result['is_command']}, type={result['command_type']}, confidence={result['confidence']}")
            return result
            
        except Exception as e:
            logger.error(f"❌ Error in command detection: {str(e)}", exc_info=True)
            # Fallback to safe default (treat as conversation)
            return {
                'is_command': False,
                'command_type': 'other',
                'confidence': 0.0,
                'error': str(e),
                'raw_response': ''
            }
    
    def _parse_detection_response(self, response: str) -> Dict:
        """
        Parse LLM response to extract command detection result.
        
        Args:
            response: Raw LLM response text
            
        Returns:
            Dict with is_command, command_type, and confidence
        """
        try:
            # Try to find JSON in the response
            # Sometimes LLM adds extra text, so we need to extract JSON
            start_idx = response.find('{')
            end_idx = response.rfind('}') + 1
            
            if start_idx != -1 and end_idx > start_idx:
                json_str = response[start_idx:end_idx]
                data = json.loads(json_str)
                
                # Validate required fields
                return {
                    'is_command': bool(data.get('is_command', False)),
                    'command_type': str(data.get('command_type', 'other')),
                    'confidence': float(data.get('confidence', 0.5))
                }
            else:
                logger.warning(f"No JSON found in response: {response}")
                return {
                    'is_command': False,
                    'command_type': 'other',
                    'confidence': 0.0
                }
                
        except (json.JSONDecodeError, KeyError, ValueError) as e:
            logger.warning(f"Failed to parse detection response: {e}")
            return {
                'is_command': False,
                'command_type': 'other',
                'confidence': 0.0
            }
    
    async def is_timer_command(self, message: str, model: str = "mistral:7b") -> bool:
        """
        Check if a message is specifically a timer command.
        
        Args:
            message: User message to check
            model: LLM model to use
            
        Returns:
            True if message is a timer command
        """
        result = await self.detect_command(message, model)
        return result['is_command'] and result['command_type'] == 'timer' and result['confidence'] >= 0.7
    
    async def is_any_command(self, message: str, model: str = "mistral", confidence_threshold: float = 0.7) -> bool:
        """
        Check if a message is any type of command.
        
        Args:
            message: User message to check
            model: LLM model to use
            confidence_threshold: Minimum confidence to consider as command
            
        Returns:
            True if message is a command with sufficient confidence
        """
        result = await self.detect_command(message, model)
        return result['is_command'] and result['confidence'] >= confidence_threshold
