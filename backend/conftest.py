"""
Shared pytest fixtures for backend tests.
"""
import pytest
from django.utils import timezone
from datetime import timedelta


@pytest.fixture
def test_user(db):
    """Create a test user."""
    from apps.accounts.models import User
    return User.objects.create_user(
        email='test@example.com',
        password='testpass123'
    )


@pytest.fixture
def test_user2(db):
    """Create a second test user."""
    from apps.accounts.models import User
    return User.objects.create_user(
        email='test2@example.com',
        password='testpass123'
    )


@pytest.fixture
def test_agent(test_user):
    """Create a test agent."""
    from apps.agents.models import Agent
    return Agent.objects.create(
        user=test_user,
        name='Test Agent',
        model='mistral:7b',
        is_default=True
    )


@pytest.fixture
def test_conversation(test_user, test_agent):
    """Create a test conversation."""
    from apps.chat.models import Conversation
    return Conversation.objects.create(
        user=test_user,
        agent=test_agent,
        title='Test Conversation'
    )


@pytest.fixture
def active_timer(test_user, test_conversation):
    """Create an active timer."""
    from apps.chat.models import Timer
    return Timer.objects.create(
        user=test_user,
        conversation=test_conversation,
        name='Active Timer',
        duration_seconds=300,
        end_time=timezone.now() + timedelta(seconds=300),
        status='active'
    )


@pytest.fixture
def paused_timer(test_user, test_conversation):
    """Create a paused timer."""
    from apps.chat.models import Timer
    timer = Timer.objects.create(
        user=test_user,
        conversation=test_conversation,
        name='Paused Timer',
        duration_seconds=300,
        end_time=timezone.now() + timedelta(seconds=300),
        status='active'
    )
    timer.pause()
    return timer


@pytest.fixture
def completed_timer(test_user, test_conversation):
    """Create a completed timer."""
    from apps.chat.models import Timer
    timer = Timer.objects.create(
        user=test_user,
        conversation=test_conversation,
        name='Completed Timer',
        duration_seconds=300,
        end_time=timezone.now() - timedelta(seconds=1),  # Already ended
        status='completed'
    )
    return timer


@pytest.fixture
def cancelled_timer(test_user, test_conversation):
    """Create a cancelled timer."""
    from apps.chat.models import Timer
    timer = Timer.objects.create(
        user=test_user,
        conversation=test_conversation,
        name='Cancelled Timer',
        duration_seconds=300,
        end_time=timezone.now() + timedelta(seconds=300),
        status='active'
    )
    timer.cancel()
    return timer


@pytest.fixture
def timer_data(test_user, test_conversation):
    """Basic timer data dictionary."""
    return {
        'user': test_user,
        'conversation': test_conversation,
        'name': 'Test Timer',
        'duration_seconds': 300,
        'end_time': timezone.now() + timedelta(seconds=300),
        'status': 'active'
    }


# Notes fixtures
@pytest.fixture
def test_note(test_user):
    """Create a test note."""
    from apps.chat.models import Note
    return Note.objects.create(
        user=test_user,
        name='Test Note'
    )


@pytest.fixture
def test_note_with_entries(test_user):
    """Create a test note with entries."""
    from apps.chat.models import Note, NoteEntry
    note = Note.objects.create(user=test_user, name='Note with Entries')
    NoteEntry.objects.create(note=note, content='Entry 1', position=1)
    NoteEntry.objects.create(note=note, content='Entry 2', position=2)
    return note


@pytest.fixture
def multiple_notes(test_user):
    """Create multiple test notes."""
    from apps.chat.models import Note
    notes = []
    for i in range(3):
        note = Note.objects.create(user=test_user, name=f'Note {i+1}')
        notes.append(note)
    return notes


@pytest.fixture
def notes_ability():
    """Create NotesAbility instance."""
    from core.bruno_integration.notes_ability import NotesAbility
    return NotesAbility()


@pytest.fixture
def conversation_id():
    """Generate a test conversation ID."""
    return 'test-conversation-123'
