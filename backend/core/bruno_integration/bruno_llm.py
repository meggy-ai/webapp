"""
Bruno LLM - Language model integration with Ollama support
"""
from typing import Dict, List, Optional, Any
import aiohttp
import logging
import json

logger = logging.getLogger(__name__)


class OllamaClient:
    """Client for Ollama LLM API."""
    
    def __init__(self, base_url: str = "http://172.24.163.246:11434"):
        self.base_url = base_url.rstrip('/')
        logger.info(f"Initialized OllamaClient with base_url: {self.base_url}")
    
    async def generate(
        self,
        messages: List[Dict[str, str]],
        model: str = "llama3.2",
        temperature: float = 0.7,
        max_tokens: int = 2000,
        stream: bool = False
    ) -> Dict[str, Any]:
        """
        Generate a response using Ollama.
        
        Args:
            messages: List of message dicts with 'role' and 'content'
            model: Model name to use (e.g., 'llama3.2', 'mistral', 'phi3')
            temperature: Sampling temperature (0-1)
            max_tokens: Maximum tokens to generate
            stream: Whether to stream the response
            
        Returns:
            Dict with 'content', 'tokens_used', and other metadata
        """
        try:
            # Convert messages to Ollama format
            prompt = self._messages_to_prompt(messages)
            
            payload = {
                "model": model,
                "prompt": prompt,
                "temperature": temperature,
                "options": {
                    "num_predict": max_tokens,
                },
                "stream": stream
            }
            
            url = f"{self.base_url}/api/generate"
            
            # Create a new session for each request to avoid event loop issues with async_to_sync
            async with aiohttp.ClientSession() as session:
                async with session.post(url, json=payload) as response:
                    if response.status != 200:
                        error_text = await response.text()
                        raise Exception(f"Ollama API error: {response.status} - {error_text}")
                    
                    if stream:
                        # Handle streaming response
                        full_response = ""
                        async for line in response.content:
                            if line:
                                data = json.loads(line.decode('utf-8'))
                                if 'response' in data:
                                    full_response += data['response']
                        
                        return {
                            "content": full_response,
                            "model": model,
                            "tokens_used": 0  # Ollama doesn't provide token count in streaming
                        }
                    else:
                        # Handle non-streaming response
                        data = await response.json()
                        
                        return {
                            "content": data.get('response', ''),
                            "model": model,
                            "tokens_used": data.get('eval_count', 0)
                        }
                    
        except Exception as e:
            logger.error(f"Error generating response with Ollama: {str(e)}", exc_info=True)
            raise
    
    def _messages_to_prompt(self, messages: List[Dict[str, str]]) -> str:
        """Convert messages array to a single prompt string."""
        prompt_parts = []
        
        for msg in messages:
            role = msg.get('role', 'user')
            content = msg.get('content', '')
            
            if role == 'system':
                prompt_parts.append(f"System: {content}")
            elif role == 'user':
                prompt_parts.append(f"User: {content}")
            elif role == 'assistant':
                prompt_parts.append(f"Assistant: {content}")
        
        prompt_parts.append("Assistant:")
        return "\n\n".join(prompt_parts)
    
    async def list_models(self) -> List[str]:
        """List available Ollama models."""
        try:
            url = f"{self.base_url}/api/tags"
            async with aiohttp.ClientSession() as session:
                async with session.get(url) as response:
                    if response.status != 200:
                        raise Exception(f"Failed to list models: {response.status}")
                    
                    data = await response.json()
                    models = [model['name'] for model in data.get('models', [])]
                    logger.info(f"Available Ollama models: {models}")
                    return models
                
        except Exception as e:
            logger.error(f"Error listing Ollama models: {str(e)}", exc_info=True)
            return []
    
    async def pull_model(self, model: str) -> bool:
        """Pull a model from Ollama registry."""
        try:
            url = f"{self.base_url}/api/pull"
            payload = {"name": model}
            
            async with aiohttp.ClientSession() as session:
                async with session.post(url, json=payload) as response:
                    if response.status != 200:
                        raise Exception(f"Failed to pull model: {response.status}")
                    
                    logger.info(f"Successfully pulled model: {model}")
                    return True
                
        except Exception as e:
            logger.error(f"Error pulling Ollama model: {str(e)}", exc_info=True)
            return False
    
    async def close(self):
        """Close method for compatibility (no-op since we don't maintain a session)."""
        pass


class LLMFactory:
    """Factory for creating LLM clients."""
    
    @staticmethod
    def create_client(provider: str, **kwargs) -> Any:
        """
        Create an LLM client based on provider.
        
        Args:
            provider: LLM provider name ('ollama', 'openai', etc.)
            **kwargs: Provider-specific configuration
            
        Returns:
            LLM client instance
        """
        if provider.lower() == 'ollama':
            base_url = kwargs.get('base_url', 'http://172.24.163.246:11434')
            return OllamaClient(base_url=base_url)
        else:
            raise ValueError(f"Unsupported LLM provider: {provider}")
