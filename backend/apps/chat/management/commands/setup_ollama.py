"""
Management command to test Ollama connection and setup
"""
from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
import asyncio
from core.bruno_integration import OllamaClient
from apps.agents.models import Agent

User = get_user_model()


class Command(BaseCommand):
    help = 'Test Ollama connection and setup default agent'
    
    def handle(self, *args, **options):
        self.stdout.write('Testing Ollama connection...')
        
        # Test Ollama connection
        async def test_ollama():
            client = OllamaClient()
            
            try:
                # List available models
                models = await client.list_models()
                self.stdout.write(self.style.SUCCESS(f'✓ Connected to Ollama'))
                self.stdout.write(f'Available models: {", ".join(models) if models else "None"}')
                
                if not models:
                    self.stdout.write(
                        self.style.WARNING(
                            '\nNo models found. Pull a model first:'
                        )
                    )
                    self.stdout.write('  ollama pull mistral:7b')
                    return False
                
                # Test generation with first available model
                test_model = models[0]
                self.stdout.write(f'\nTesting generation with {test_model}...')
                
                response = await client.generate(
                    messages=[
                        {"role": "system", "content": "You are a helpful assistant."},
                        {"role": "user", "content": "Say hello!"}
                    ],
                    model=test_model
                )
                
                self.stdout.write(self.style.SUCCESS(f'✓ Generation test successful'))
                self.stdout.write(f'Response: {response["content"][:100]}...')
                
                await client.close()
                return True
                
            except Exception as e:
                self.stdout.write(self.style.ERROR(f'✗ Ollama connection failed: {str(e)}'))
                self.stdout.write('\nMake sure Ollama is running:')
                self.stdout.write('  1. Install Ollama from https://ollama.ai')
                self.stdout.write('  2. Start Ollama service')
                self.stdout.write('  3. Pull a model: ollama pull mistral:7b')
                await client.close()
                return False
        
        # Run async test
        ollama_ok = asyncio.run(test_ollama())
        
        if not ollama_ok:
            return
        
        # Setup default agent for first user
        self.stdout.write('\n' + '='*50)
        self.stdout.write('Setting up default agent...')
        
        try:
            user = User.objects.first()
            if not user:
                self.stdout.write(self.style.WARNING('No users found. Create a user first.'))
                return
            
            # Check if default agent exists
            agent = Agent.objects.filter(user=user, is_default=True).first()
            
            if agent:
                self.stdout.write(self.style.WARNING(f'Default agent already exists: {agent.name}'))
            else:
                # Create default agent
                agent = Agent.objects.create(
                    user=user,
                    name='Meggy',
                    description='Your proactive AI companion powered by Ollama',
                    llm_provider='ollama',
                    model='mistral:7b',
                    temperature=0.7,
                    max_tokens=2000,
                    system_prompt='You are Meggy, a friendly and proactive AI companion. '
                                 'You provide clear, concise responses while maintaining a warm, conversational tone. '
                                 'You have a built-in notes system - users can say "show notes" to access their notes, '
                                 'create new notes, add entries, and manage their personal note collection. '
                                 'When users interact with notes, respond naturally and guide them through the interface.',
                    is_default=True,
                    is_active=True
                )
                self.stdout.write(self.style.SUCCESS(f'✓ Created default agent: {agent.name}'))
            
            self.stdout.write('\n' + '='*50)
            self.stdout.write(self.style.SUCCESS('Setup complete! You can now use the chat feature.'))
            
        except Exception as e:
            self.stdout.write(self.style.ERROR(f'✗ Failed to setup agent: {str(e)}'))
