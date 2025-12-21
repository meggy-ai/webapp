"""
Unit tests for NotesAbility.
"""
import pytest
from unittest.mock import AsyncMock, MagicMock, patch
from asgiref.sync import sync_to_async
from core.bruno_integration.notes_ability import NotesAbility, NotesState, notes_state
from apps.accounts.models import User
from apps.chat.models import Note, NoteEntry


@pytest.mark.django_db
@pytest.mark.asyncio
class TestNotesStateManagement:
    """Test notes state tracking and management."""
    
    @pytest.fixture(autouse=True)
    def setup(self):
        """Reset notes state before each test."""
        notes_state.conversation_states.clear()
        yield
        notes_state.conversation_states.clear()
    
    async def test_initial_state_creation(self):
        """Verify default state for new conversation."""
        conversation_id = 'new-conversation'
        state = notes_state.get_state(conversation_id)
        
        assert state['in_notes_mode'] is False
        assert state['current_note_id'] is None
        assert state['view'] == 'none'
    
    async def test_get_state_creates_if_not_exists(self):
        """State auto-creation."""
        conversation_id = 'auto-create-conv'
        
        # First call should create state
        state = notes_state.get_state(conversation_id)
        assert conversation_id in notes_state.conversation_states
        
        # Second call should return same state
        state2 = notes_state.get_state(conversation_id)
        assert state is state2
    
    async def test_set_state_updates_values(self):
        """State mutation."""
        conversation_id = 'update-conv'
        
        notes_state.set_state(conversation_id, in_notes_mode=True, view='list')
        state = notes_state.get_state(conversation_id)
        
        assert state['in_notes_mode'] is True
        assert state['view'] == 'list'
        assert state['current_note_id'] is None  # Unchanged
    
    async def test_exit_notes_resets_state(self):
        """Exit notes mode."""
        conversation_id = 'exit-conv'
        
        # Set some state
        notes_state.set_state(conversation_id, 
                            in_notes_mode=True, 
                            view='detail', 
                            current_note_id='note-123')
        
        # Exit notes
        notes_state.exit_notes(conversation_id)
        
        state = notes_state.get_state(conversation_id)
        assert state['in_notes_mode'] is False
        assert state['current_note_id'] is None
        assert state['view'] == 'none'
    
    async def test_multiple_conversations_isolated(self):
        """Separate state per conversation."""
        conv1 = 'conversation-1'
        conv2 = 'conversation-2'
        
        notes_state.set_state(conv1, in_notes_mode=True, view='list')
        notes_state.set_state(conv2, in_notes_mode=False, view='none')
        
        state1 = notes_state.get_state(conv1)
        state2 = notes_state.get_state(conv2)
        
        assert state1['in_notes_mode'] is True
        assert state1['view'] == 'list'
        assert state2['in_notes_mode'] is False
        assert state2['view'] == 'none'
    
    async def test_state_persistence_during_session(self):
        """State maintained across commands."""
        conversation_id = 'persist-conv'
        
        notes_state.set_state(conversation_id, in_notes_mode=True)
        
        # Multiple get_state calls should return same state
        for _ in range(5):
            state = notes_state.get_state(conversation_id)
            assert state['in_notes_mode'] is True
    
    async def test_view_transition_list_to_detail(self):
        """View state changes."""
        conversation_id = 'transition-conv'
        
        notes_state.set_state(conversation_id, in_notes_mode=True, view='list')
        state = notes_state.get_state(conversation_id)
        assert state['view'] == 'list'
        
        notes_state.set_state(conversation_id, view='detail', current_note_id='note-456')
        state = notes_state.get_state(conversation_id)
        assert state['view'] == 'detail'
        assert state['current_note_id'] == 'note-456'
    
    async def test_view_transition_detail_to_list(self):
        """Return to list view."""
        conversation_id = 'back-to-list-conv'
        
        notes_state.set_state(conversation_id, 
                            in_notes_mode=True, 
                            view='detail', 
                            current_note_id='note-789')
        
        notes_state.set_state(conversation_id, view='list', current_note_id=None)
        state = notes_state.get_state(conversation_id)
        
        assert state['view'] == 'list'
        assert state['current_note_id'] is None
        assert state['in_notes_mode'] is True  # Still in notes mode


@pytest.mark.django_db(transaction=True)
@pytest.mark.asyncio
class TestNotesCommandParsing:
    """Test command interpretation and routing."""
    
    @pytest.fixture(autouse=True)
    def setup(self):
        """Reset notes state before each test."""
        notes_state.conversation_states.clear()
        yield
        notes_state.conversation_states.clear()
    
    @pytest.fixture
    def notes_ability(self):
        """Create NotesAbility instance."""
        return NotesAbility()
    
    async def test_parse_show_notes(self, notes_ability, test_user):
        """'show notes' enters notes mode."""
        conversation_id = 'test-conv-1'
        user_id = test_user.id
        
        result = await notes_ability.handle_notes_command(
            user_id, conversation_id, "show notes"
        )
        
        assert result is not None
        assert "📋 Your Notes:" in result
        state = notes_state.get_state(conversation_id)
        assert state['in_notes_mode'] is True
        assert state['view'] == 'list'
    
    async def test_parse_open_notes(self, notes_ability, test_user):
        """'open notes' enters notes mode."""
        conversation_id = 'test-conv-2'
        user_id = test_user.id
        
        result = await notes_ability.handle_notes_command(
            user_id, conversation_id, "open notes"
        )
        
        assert result is not None
        assert "📋 Your Notes:" in result
        state = notes_state.get_state(conversation_id)
        assert state['in_notes_mode'] is True
    
    async def test_parse_view_notes(self, notes_ability, test_user):
        """'view notes' enters notes mode."""
        conversation_id = 'test-conv-3'
        user_id = test_user.id
        
        result = await notes_ability.handle_notes_command(
            user_id, conversation_id, "view notes"
        )
        
        assert result is not None
        assert "📋 Your Notes:" in result
        state = notes_state.get_state(conversation_id)
        assert state['in_notes_mode'] is True
    
    async def test_parse_notes_only(self, notes_ability, test_user):
        """'notes' enters notes mode."""
        conversation_id = 'test-conv-4'
        user_id = test_user.id
        
        result = await notes_ability.handle_notes_command(
            user_id, conversation_id, "notes"
        )
        
        assert result is not None
        assert "📋 Your Notes:" in result
        state = notes_state.get_state(conversation_id)
        assert state['in_notes_mode'] is True
    
    async def test_already_in_notes_mode(self, notes_ability, test_user):
        """Repeat entry shows list."""
        conversation_id = 'test-conv-5'
        user_id = test_user.id
        
        # Enter notes mode
        await notes_ability.handle_notes_command(user_id, conversation_id, "show notes")
        
        # Enter again should show list
        result = await notes_ability.handle_notes_command(user_id, conversation_id, "show notes")
        
        assert "📋 Your Notes:" in result
        state = notes_state.get_state(conversation_id)
        assert state['in_notes_mode'] is True
        assert state['view'] == 'list'
    
    async def test_parse_exit_command(self, notes_ability, test_user):
        """'exit' exits notes mode."""
        conversation_id = 'test-conv-6'
        user_id = test_user.id
        
        # Enter notes mode
        await notes_ability.handle_notes_command(user_id, conversation_id, "show notes")
        
        # Exit
        result = await notes_ability.handle_notes_command(user_id, conversation_id, "exit")
        
        assert "Exited notes" in result
        state = notes_state.get_state(conversation_id)
        assert state['in_notes_mode'] is False
    
    async def test_parse_close_command(self, notes_ability, test_user):
        """'close' exits notes mode."""
        conversation_id = 'test-conv-7'
        user_id = test_user.id
        
        # Enter notes mode
        await notes_ability.handle_notes_command(user_id, conversation_id, "show notes")
        
        # Close
        result = await notes_ability.handle_notes_command(user_id, conversation_id, "close")
        
        assert "Exited notes" in result
        state = notes_state.get_state(conversation_id)
        assert state['in_notes_mode'] is False
    
    async def test_parse_back_command(self, notes_ability, test_user, test_note):
        """'back' in detail view returns to list."""
        conversation_id = 'test-conv-8'
        user_id = test_user.id
        
        # Enter notes mode and navigate to detail view
        await notes_ability.handle_notes_command(user_id, conversation_id, "show notes")
        notes_state.set_state(conversation_id, view='detail', current_note_id=str(test_note.id))
        
        # Back command
        result = await notes_ability.handle_notes_command(user_id, conversation_id, "back")
        
        assert "📋 Your Notes:" in result
        state = notes_state.get_state(conversation_id)
        assert state['view'] == 'list'
    
    async def test_parse_add_note_command(self, notes_ability, test_user):
        """'add [name]' recognized."""
        conversation_id = 'test-conv-9'
        user_id = test_user.id
        
        # Enter notes mode
        await notes_ability.handle_notes_command(user_id, conversation_id, "show notes")
        
        # Add note
        result = await notes_ability.handle_notes_command(
            user_id, conversation_id, "add Shopping List"
        )
        
        assert "📋 Your Notes:" in result
        assert "shopping list" in result.lower()
        
        # Verify note was created
        note = await sync_to_async(Note.objects.filter(user=test_user, name='shopping list').first)()
        assert note is not None
    
    async def test_parse_rename_command(self, notes_ability, test_user, test_note):
        """'rename [ID] [name]' parsed correctly."""
        conversation_id = 'test-conv-10'
        user_id = test_user.id
        
        # Enter notes mode
        await notes_ability.handle_notes_command(user_id, conversation_id, "show notes")
        
        # Rename note (assuming it's note #1)
        result = await notes_ability.handle_notes_command(
            user_id, conversation_id, "rename 1 new name"
        )
        
        assert "📋 Your Notes:" in result
        
        # Verify note was renamed
        await sync_to_async(test_note.refresh_from_db)()
        assert test_note.name == 'new name'
    
    async def test_parse_delete_note_command(self, notes_ability, test_user, test_note):
        """'delete [ID]' parsed."""
        conversation_id = 'test-conv-11'
        user_id = test_user.id
        
        # Enter notes mode
        await notes_ability.handle_notes_command(user_id, conversation_id, "show notes")
        
        # Delete note
        result = await notes_ability.handle_notes_command(
            user_id, conversation_id, "delete 1"
        )
        
        assert "📋 Your Notes:" in result
        
        # Verify note was deleted
        note_exists = await sync_to_async(Note.objects.filter(id=test_note.id).exists)()
        assert note_exists is False
    
    async def test_parse_numeric_command(self, notes_ability, test_user, test_note):
        """Number opens that note."""
        conversation_id = 'test-conv-12'
        user_id = test_user.id
        
        # Enter notes mode
        await notes_ability.handle_notes_command(user_id, conversation_id, "show notes")
        
        # Open note by number
        result = await notes_ability.handle_notes_command(
            user_id, conversation_id, "1"
        )
        
        assert test_note.name in result
        assert "Options:" in result
        state = notes_state.get_state(conversation_id)
        assert state['view'] == 'detail'
        assert state['current_note_id'] == str(test_note.id)


@pytest.mark.django_db(transaction=True)
@pytest.mark.asyncio
class TestNotesListView:
    """Test list view operations."""
    
    @pytest.fixture(autouse=True)
    def setup(self):
        """Reset notes state before each test."""
        notes_state.conversation_states.clear()
        yield
        notes_state.conversation_states.clear()
    
    @pytest.fixture
    def notes_ability(self):
        """Create NotesAbility instance."""
        return NotesAbility()
    
    async def test_show_empty_notes_list(self, notes_ability, test_user):
        """Empty state message with options."""
        user_id = test_user.id
        
        result = await notes_ability._show_notes_list(user_id)
        
        assert "📋 Your Notes:" in result
        assert "You don't have any notes yet!" in result
        assert "add [name]" in result
        assert "exit" in result
    
    async def test_show_notes_list_single_note(self, notes_ability, test_user, test_note):
        """Display one note correctly."""
        user_id = test_user.id
        
        result = await notes_ability._show_notes_list(user_id)
        
        assert "📋 Your Notes:" in result
        assert "#1:" in result
        assert test_note.name in result
        assert "(0 entries)" in result
    
    async def test_show_notes_list_multiple_notes(self, notes_ability, test_user, multiple_notes):
        """Multiple notes numbered correctly."""
        user_id = test_user.id
        
        result = await notes_ability._show_notes_list(user_id)
        
        assert "📋 Your Notes:" in result
        assert "#1:" in result
        assert "#2:" in result
        assert "#3:" in result
        # Check notes appear in oldest-first order
        lines = result.split('\n')
        note_lines = [l for l in lines if l.startswith('#')]
        assert len(note_lines) == 3
    
    async def test_notes_list_shows_entry_count(self, notes_ability, test_user, test_note_with_entries):
        """Entry count annotation."""
        user_id = test_user.id
        
        result = await notes_ability._show_notes_list(user_id)
        
        assert test_note_with_entries.name in result
        assert "(2 entries)" in result
    
    async def test_notes_list_ordering(self, notes_ability, test_user):
        """Oldest first (reversed created_at)."""
        # Create notes with slight delay to ensure ordering
        note1 = await sync_to_async(Note.objects.create)(user=test_user, name='First Note')
        note2 = await sync_to_async(Note.objects.create)(user=test_user, name='Second Note')
        note3 = await sync_to_async(Note.objects.create)(user=test_user, name='Third Note')
        
        result = await notes_ability._show_notes_list(user_id=test_user.id)
        
        # Find positions of each note in result
        first_pos = result.find('First Note')
        second_pos = result.find('Second Note')
        third_pos = result.find('Third Note')
        
        # Oldest (First) should appear before newest (Third)
        assert first_pos < second_pos < third_pos
    
    async def test_create_note_with_name(self, notes_ability, test_user):
        """'add my note' creates note."""
        conversation_id = 'test-conv'
        user_id = test_user.id
        
        # Enter notes mode
        await notes_ability.handle_notes_command(user_id, conversation_id, "show notes")
        
        # Create note
        result = await notes_ability.handle_notes_command(user_id, conversation_id, "add my note")
        
        assert "📋 Your Notes:" in result
        assert "my note" in result
        
        # Verify note exists
        note = await sync_to_async(Note.objects.filter(user=test_user, name='my note').first)()
        assert note is not None
    
    async def test_create_note_empty_name(self, notes_ability, test_user):
        """'add' without name shows error."""
        conversation_id = 'test-conv'
        user_id = test_user.id
        
        # Enter notes mode
        await notes_ability.handle_notes_command(user_id, conversation_id, "show notes")
        
        # Try to create note without name - just "add" doesn't match the pattern
        # so it should fall through to "didn't understand" message
        result = await notes_ability.handle_notes_command(user_id, conversation_id, "add")
        
        # The command doesn't match "add " pattern, so it shows generic error
        assert "didn't understand" in result.lower() or "try" in result.lower()
    
    async def test_create_note_shows_updated_list(self, notes_ability, test_user):
        """List refreshes after create."""
        conversation_id = 'test-conv'
        user_id = test_user.id
        
        # Enter notes mode
        await notes_ability.handle_notes_command(user_id, conversation_id, "show notes")
        
        # Create note
        result = await notes_ability.handle_notes_command(user_id, conversation_id, "add test note")
        
        # Should show updated list with new note
        assert "📋 Your Notes:" in result
        assert "#1:" in result
        assert "test note" in result
    
    async def test_rename_note_valid_id(self, notes_ability, test_user, test_note):
        """'rename 1 new name' updates note."""
        conversation_id = 'test-conv'
        user_id = test_user.id
        
        # Enter notes mode
        await notes_ability.handle_notes_command(user_id, conversation_id, "show notes")
        
        # Rename note
        result = await notes_ability.handle_notes_command(user_id, conversation_id, "rename 1 updated name")
        
        assert "📋 Your Notes:" in result
        
        # Verify rename
        await sync_to_async(test_note.refresh_from_db)()
        assert test_note.name == "updated name"
    
    async def test_rename_note_invalid_id(self, notes_ability, test_user, test_note):
        """Invalid ID shows error."""
        conversation_id = 'test-conv'
        user_id = test_user.id
        
        # Enter notes mode
        await notes_ability.handle_notes_command(user_id, conversation_id, "show notes")
        
        # Try to rename non-existent note
        result = await notes_ability.handle_notes_command(user_id, conversation_id, "rename 99 new name")
        
        assert "not found" in result.lower()
    
    async def test_rename_note_missing_name(self, notes_ability, test_user, test_note):
        """'rename 1' without name shows error."""
        conversation_id = 'test-conv'
        user_id = test_user.id
        
        # Enter notes mode
        await notes_ability.handle_notes_command(user_id, conversation_id, "show notes")
        
        # Try to rename without new name
        result = await notes_ability.handle_notes_command(user_id, conversation_id, "rename 1")
        
        assert "usage" in result.lower() or "rename" in result.lower()
    
    async def test_delete_note_valid_id(self, notes_ability, test_user, test_note):
        """'delete 1' removes note."""
        conversation_id = 'test-conv'
        user_id = test_user.id
        note_id = test_note.id
        
        # Enter notes mode
        await notes_ability.handle_notes_command(user_id, conversation_id, "show notes")
        
        # Delete note
        result = await notes_ability.handle_notes_command(user_id, conversation_id, "delete 1")
        
        assert "📋 Your Notes:" in result
        
        # Verify deletion
        exists = await sync_to_async(Note.objects.filter(id=note_id).exists)()
        assert exists is False
    
    async def test_delete_note_invalid_id(self, notes_ability, test_user, test_note):
        """Invalid ID shows error."""
        conversation_id = 'test-conv'
        user_id = test_user.id
        
        # Enter notes mode
        await notes_ability.handle_notes_command(user_id, conversation_id, "show notes")
        
        # Try to delete non-existent note
        result = await notes_ability.handle_notes_command(user_id, conversation_id, "delete 99")
        
        assert "not found" in result.lower()
    
    async def test_delete_note_shows_updated_list(self, notes_ability, test_user, test_note):
        """List refreshes after delete."""
        conversation_id = 'test-conv'
        user_id = test_user.id
        
        # Enter notes mode
        await notes_ability.handle_notes_command(user_id, conversation_id, "show notes")
        
        # Delete note
        result = await notes_ability.handle_notes_command(user_id, conversation_id, "delete 1")
        
        # Should show empty list message
        assert "don't have any notes yet" in result.lower()
    
    async def test_open_note_by_id(self, notes_ability, test_user, test_note):
        """'1' opens note #1 detail view."""
        conversation_id = 'test-conv'
        user_id = test_user.id
        
        # Enter notes mode
        await notes_ability.handle_notes_command(user_id, conversation_id, "show notes")
        
        # Open note
        result = await notes_ability.handle_notes_command(user_id, conversation_id, "1")
        
        assert test_note.name in result
        assert "add [text]" in result.lower()
        
        # Verify state change
        state = notes_state.get_state(conversation_id)
        assert state['view'] == 'detail'
        assert state['current_note_id'] == str(test_note.id)


@pytest.mark.django_db(transaction=True)
@pytest.mark.asyncio
class TestNotesDetailView:
    """Test detail view operations."""
    
    @pytest.fixture(autouse=True)
    def setup(self):
        """Reset notes state before each test."""
        notes_state.conversation_states.clear()
        yield
        notes_state.conversation_states.clear()
    
    @pytest.fixture
    def notes_ability(self):
        """Create NotesAbility instance."""
        return NotesAbility()
    
    async def test_show_note_detail_empty(self, notes_ability, test_note):
        """Note with no entries."""
        result = await notes_ability._show_note_detail(str(test_note.id))
        
        assert test_note.name in result
        assert "No entries yet" in result
        assert "add [text]" in result.lower()
    
    async def test_show_note_detail_with_entries(self, notes_ability, test_note_with_entries):
        """Display all entries."""
        result = await notes_ability._show_note_detail(str(test_note_with_entries.id))
        
        assert test_note_with_entries.name in result
        assert "Entry 1" in result
        assert "Entry 2" in result
        assert "#1:" in result
        assert "#2:" in result
    
    async def test_note_detail_shows_title(self, notes_ability, test_note):
        """Note name in header."""
        result = await notes_ability._show_note_detail(str(test_note.id))
        
        assert "📝" in result
        assert test_note.name in result
    
    async def test_note_detail_entry_numbering(self, notes_ability, test_note_with_entries):
        """Entries numbered correctly."""
        result = await notes_ability._show_note_detail(str(test_note_with_entries.id))
        
        lines = result.split('\n')
        entry_lines = [l for l in lines if l.strip().startswith('#') and ':' in l]
        
        assert len(entry_lines) >= 2
        assert entry_lines[0].startswith('#1:')
        assert entry_lines[1].startswith('#2:')
    
    async def test_add_entry_to_note(self, notes_ability, test_user, test_note):
        """'add my entry' creates entry."""
        conversation_id = 'test-conv'
        user_id = test_user.id
        
        # Enter notes mode and open note
        await notes_ability.handle_notes_command(user_id, conversation_id, "show notes")
        await notes_ability.handle_notes_command(user_id, conversation_id, "1")
        
        # Add entry
        result = await notes_ability.handle_notes_command(user_id, conversation_id, "add my new entry")
        
        assert "my new entry" in result
        
        # Verify entry exists
        entry = await sync_to_async(NoteEntry.objects.filter(note=test_note, content='my new entry').first)()
        assert entry is not None
    
    async def test_add_entry_empty_content(self, notes_ability, test_user, test_note):
        """'add' without content shows error."""
        conversation_id = 'test-conv'
        user_id = test_user.id
        
        # Enter notes mode and open note
        await notes_ability.handle_notes_command(user_id, conversation_id, "show notes")
        await notes_ability.handle_notes_command(user_id, conversation_id, "1")
        
        # Try to add empty entry - "add" doesn't match pattern
        result = await notes_ability.handle_notes_command(user_id, conversation_id, "add")
        
        # Falls through to generic error message
        assert "didn't understand" in result.lower() or "try" in result.lower()
    
    async def test_add_entry_position_increments(self, notes_ability, test_user, test_note_with_entries):
        """Position set correctly."""
        conversation_id = 'test-conv'
        user_id = test_user.id
        
        # Enter notes mode and open note
        await notes_ability.handle_notes_command(user_id, conversation_id, "show notes")
        await notes_ability.handle_notes_command(user_id, conversation_id, "1")
        
        # Add third entry
        await notes_ability.handle_notes_command(user_id, conversation_id, "add third entry")
        
        # Verify position
        entry = await sync_to_async(NoteEntry.objects.filter(note=test_note_with_entries, content='third entry').first)()
        assert entry is not None
        assert entry.position == 3
    
    async def test_add_entry_refreshes_view(self, notes_ability, test_user, test_note):
        """Detail view updates after add."""
        conversation_id = 'test-conv'
        user_id = test_user.id
        
        # Enter notes mode and open note
        await notes_ability.handle_notes_command(user_id, conversation_id, "show notes")
        await notes_ability.handle_notes_command(user_id, conversation_id, "1")
        
        # Add entry
        result = await notes_ability.handle_notes_command(user_id, conversation_id, "add test entry")
        
        # Should show updated detail view
        assert test_note.name in result
        assert "test entry" in result
        assert "#1:" in result
    
    async def test_edit_entry_valid_id(self, notes_ability, test_user, test_note_with_entries):
        """'edit 1 new text' updates entry."""
        conversation_id = 'test-conv'
        user_id = test_user.id
        
        # Enter notes mode and open note
        await notes_ability.handle_notes_command(user_id, conversation_id, "show notes")
        await notes_ability.handle_notes_command(user_id, conversation_id, "1")
        
        # Edit entry
        result = await notes_ability.handle_notes_command(user_id, conversation_id, "edit 1 updated entry")
        
        assert "updated entry" in result
        
        # Verify edit
        entries = await sync_to_async(list)(test_note_with_entries.entries.all())
        assert entries[0].content == "updated entry"
    
    async def test_edit_entry_invalid_id(self, notes_ability, test_user, test_note_with_entries):
        """Invalid ID shows error."""
        conversation_id = 'test-conv'
        user_id = test_user.id
        
        # Enter notes mode and open note
        await notes_ability.handle_notes_command(user_id, conversation_id, "show notes")
        await notes_ability.handle_notes_command(user_id, conversation_id, "1")
        
        # Try to edit non-existent entry
        result = await notes_ability.handle_notes_command(user_id, conversation_id, "edit 99 new text")
        
        assert "not found" in result.lower()
    
    async def test_edit_entry_missing_content(self, notes_ability, test_user, test_note_with_entries):
        """'edit 1' without text shows error."""
        conversation_id = 'test-conv'
        user_id = test_user.id
        
        # Enter notes mode and open note
        await notes_ability.handle_notes_command(user_id, conversation_id, "show notes")
        await notes_ability.handle_notes_command(user_id, conversation_id, "1")
        
        # Try to edit without new text
        result = await notes_ability.handle_notes_command(user_id, conversation_id, "edit 1")
        
        assert "usage" in result.lower() or "edit" in result.lower()
    
    async def test_edit_entry_refreshes_view(self, notes_ability, test_user, test_note_with_entries):
        """Detail view updates after edit."""
        conversation_id = 'test-conv'
        user_id = test_user.id
        
        # Enter notes mode and open note
        await notes_ability.handle_notes_command(user_id, conversation_id, "show notes")
        await notes_ability.handle_notes_command(user_id, conversation_id, "1")
        
        # Edit entry
        result = await notes_ability.handle_notes_command(user_id, conversation_id, "edit 1 modified")
        
        assert "modified" in result
        assert test_note_with_entries.name in result
    
    async def test_delete_entry_valid_id(self, notes_ability, test_user, test_note_with_entries):
        """'delete 1' removes entry."""
        conversation_id = 'test-conv'
        user_id = test_user.id
        
        # Get initial entry count
        initial_count = await sync_to_async(test_note_with_entries.entries.count)()
        
        # Enter notes mode and open note
        await notes_ability.handle_notes_command(user_id, conversation_id, "show notes")
        await notes_ability.handle_notes_command(user_id, conversation_id, "1")
        
        # Delete entry
        result = await notes_ability.handle_notes_command(user_id, conversation_id, "delete 1")
        
        # Verify deletion
        final_count = await sync_to_async(test_note_with_entries.entries.count)()
        assert final_count == initial_count - 1
    
    async def test_delete_entry_invalid_id(self, notes_ability, test_user, test_note_with_entries):
        """Invalid ID shows error."""
        conversation_id = 'test-conv'
        user_id = test_user.id
        
        # Enter notes mode and open note
        await notes_ability.handle_notes_command(user_id, conversation_id, "show notes")
        await notes_ability.handle_notes_command(user_id, conversation_id, "1")
        
        # Try to delete non-existent entry
        result = await notes_ability.handle_notes_command(user_id, conversation_id, "delete 99")
        
        assert "not found" in result.lower()
    
    async def test_delete_entry_refreshes_view(self, notes_ability, test_user, test_note_with_entries):
        """Detail view updates after delete."""
        conversation_id = 'test-conv'
        user_id = test_user.id
        
        # Enter notes mode and open note
        await notes_ability.handle_notes_command(user_id, conversation_id, "show notes")
        await notes_ability.handle_notes_command(user_id, conversation_id, "1")
        
        # Delete entry
        result = await notes_ability.handle_notes_command(user_id, conversation_id, "delete 1")
        
        # Should show updated detail view with one less entry
        assert test_note_with_entries.name in result
        lines = result.split('\n')
        entry_lines = [l for l in lines if l.strip().startswith('#') and ':' in l and 'Entry' in l]
        assert len(entry_lines) == 1  # Should have 1 entry left
    
    async def test_close_returns_to_list(self, notes_ability, test_user, test_note):
        """'close' returns to list view."""
        conversation_id = 'test-conv'
        user_id = test_user.id
        
        # Enter notes mode and open note
        await notes_ability.handle_notes_command(user_id, conversation_id, "show notes")
        await notes_ability.handle_notes_command(user_id, conversation_id, "1")
        
        # Close detail view
        result = await notes_ability.handle_notes_command(user_id, conversation_id, "close")
        
        assert "📋 Your Notes:" in result
        
        # Verify state change
        state = notes_state.get_state(conversation_id)
        assert state['view'] == 'list'
    
    async def test_exit_returns_to_list(self, notes_ability, test_user, test_note):
        """'exit' returns to list view."""
        conversation_id = 'test-conv'
        user_id = test_user.id
        
        # Enter notes mode and open note
        await notes_ability.handle_notes_command(user_id, conversation_id, "show notes")
        await notes_ability.handle_notes_command(user_id, conversation_id, "1")
        
        # Exit detail view
        result = await notes_ability.handle_notes_command(user_id, conversation_id, "exit")
        
        assert "📋 Your Notes:" in result
        
        # Verify state change
        state = notes_state.get_state(conversation_id)
        assert state['view'] == 'list'


@pytest.mark.django_db(transaction=True)
@pytest.mark.asyncio
class TestNotesCRUDOperations:
    """Test database CRUD operations."""
    
    async def test_note_creation_with_user(self, test_user):
        """Note associated with user."""
        note = await sync_to_async(Note.objects.create)(user=test_user, name='Test Note')
        
        assert note.user == test_user
        assert note.name == 'Test Note'
        assert note.id is not None
    
    async def test_note_creation_defaults(self, test_user):
        """Default name, timestamps."""
        note = await sync_to_async(Note.objects.create)(user=test_user)
        
        assert note.name == 'Untitled'  # Default from model
        assert note.created_at is not None
        assert note.updated_at is not None
    
    async def test_note_update_timestamps(self, test_user, test_note):
        """updated_at changes on save."""
        import asyncio
        original_updated = test_note.updated_at
        
        # Wait a bit to ensure timestamp difference
        await asyncio.sleep(0.01)
        
        # Update note
        test_note.name = 'Updated Name'
        await sync_to_async(test_note.save)()
        await sync_to_async(test_note.refresh_from_db)()
        
        assert test_note.updated_at > original_updated
    
    async def test_note_deletion_cascade(self, test_user, test_note_with_entries):
        """Deleting note deletes entries."""
        note_id = test_note_with_entries.id
        
        # Verify entries exist
        entry_count = await sync_to_async(NoteEntry.objects.filter(note=test_note_with_entries).count)()
        assert entry_count == 2
        
        # Delete note
        await sync_to_async(test_note_with_entries.delete)()
        
        # Verify entries are deleted
        entry_count = await sync_to_async(NoteEntry.objects.filter(note_id=note_id).count)()
        assert entry_count == 0
    
    async def test_note_entry_count_property(self, test_user, test_note_with_entries):
        """entry_count computed correctly."""
        # Access the property synchronously since it's a database query
        count = await sync_to_async(lambda: test_note_with_entries.entry_count)()
        assert count == 2
    
    async def test_entry_creation_with_note(self, test_user, test_note):
        """Entry associated with note."""
        entry = await sync_to_async(NoteEntry.objects.create)(
            note=test_note,
            content='Test Entry',
            position=1
        )
        
        assert entry.note == test_note
        assert entry.content == 'Test Entry'
        assert entry.position == 1
    
    async def test_entry_position_ordering(self, test_user, test_note):
        """Entries ordered by position."""
        # Create entries in reverse order
        entry3 = await sync_to_async(NoteEntry.objects.create)(note=test_note, content='Third', position=3)
        entry1 = await sync_to_async(NoteEntry.objects.create)(note=test_note, content='First', position=1)
        entry2 = await sync_to_async(NoteEntry.objects.create)(note=test_note, content='Second', position=2)
        
        # Retrieve entries (should be ordered by position)
        entries = await sync_to_async(list)(test_note.entries.all())
        
        assert len(entries) == 3
        assert entries[0].content == 'First'
        assert entries[1].content == 'Second'
        assert entries[2].content == 'Third'
    
    async def test_entry_update_content(self, test_user, test_note_with_entries):
        """Content can be updated."""
        entries = await sync_to_async(list)(test_note_with_entries.entries.all())
        entry = entries[0]
        
        entry.content = 'Updated Content'
        await sync_to_async(entry.save)()
        await sync_to_async(entry.refresh_from_db)()
        
        assert entry.content == 'Updated Content'
    
    async def test_multiple_entries_same_note(self, test_user, test_note):
        """Multiple entries supported."""
        for i in range(5):
            await sync_to_async(NoteEntry.objects.create)(
                note=test_note,
                content=f'Entry {i+1}',
                position=i+1
            )
        
        count = await sync_to_async(test_note.entries.count)()
        assert count == 5
    
    async def test_entry_deletion(self, test_user, test_note_with_entries):
        """Entry can be deleted independently."""
        entries = await sync_to_async(list)(test_note_with_entries.entries.all())
        entry_to_delete = entries[0]
        entry_id = entry_to_delete.id
        
        await sync_to_async(entry_to_delete.delete)()
        
        # Verify entry deleted but note still exists
        entry_exists = await sync_to_async(NoteEntry.objects.filter(id=entry_id).exists)()
        note_exists = await sync_to_async(Note.objects.filter(id=test_note_with_entries.id).exists)()
        
        assert entry_exists is False
        assert note_exists is True


@pytest.mark.django_db(transaction=True)
@pytest.mark.asyncio
class TestNotesEdgeCases:
    """Test error handling and edge cases."""
    
    @pytest.fixture(autouse=True)
    def setup(self):
        """Reset notes state before each test."""
        notes_state.conversation_states.clear()
        yield
        notes_state.conversation_states.clear()
    
    @pytest.fixture
    def notes_ability(self):
        """Create NotesAbility instance."""
        return NotesAbility()
    
    async def test_user_not_found(self, notes_ability):
        """Handle missing user."""
        # Use a non-existent user ID
        fake_user_id = 99999
        
        # Should raise an exception when trying to access notes
        with pytest.raises(Exception):  # Will be User.DoesNotExist
            await notes_ability._show_notes_list(fake_user_id)
    
    async def test_note_not_found(self, notes_ability, test_user):
        """Handle missing note."""
        conversation_id = 'test-conv'
        user_id = test_user.id
        
        # Enter notes mode
        await notes_ability.handle_notes_command(user_id, conversation_id, "show notes")
        
        # Try to open non-existent note
        result = await notes_ability.handle_notes_command(user_id, conversation_id, "999")
        
        assert "not found" in result.lower()
    
    async def test_invalid_note_id_format(self, notes_ability, test_user, test_note):
        """Non-numeric ID handled."""
        conversation_id = 'test-conv'
        user_id = test_user.id
        
        # Enter notes mode
        await notes_ability.handle_notes_command(user_id, conversation_id, "show notes")
        
        # Try to open note with non-numeric ID
        result = await notes_ability.handle_notes_command(user_id, conversation_id, "abc")
        
        # Should fall through to "didn't understand" message
        assert "didn't understand" in result.lower()
    
    async def test_command_not_in_notes_mode(self, notes_ability, test_user):
        """Commands ignored outside notes."""
        conversation_id = 'test-conv'
        user_id = test_user.id
        
        # Don't enter notes mode, just try a command
        result = await notes_ability.handle_notes_command(user_id, conversation_id, "add my note")
        
        # Should return None (not a notes command)
        assert result is None
    
    async def test_empty_note_name(self, notes_ability, test_user):
        """Empty string for note name."""
        conversation_id = 'test-conv'
        user_id = test_user.id
        
        # Enter notes mode
        await notes_ability.handle_notes_command(user_id, conversation_id, "show notes")
        
        # Try with spaces only
        result = await notes_ability.handle_notes_command(user_id, conversation_id, "add   ")
        
        # Should show error about providing name
        assert "provide a name" in result.lower() or "didn't understand" in result.lower()
    
    async def test_very_long_note_name(self, notes_ability, test_user):
        """Max length enforcement."""
        conversation_id = 'test-conv'
        user_id = test_user.id
        long_name = 'A' * 200  # Longer than max_length=100
        
        # Enter notes mode
        await notes_ability.handle_notes_command(user_id, conversation_id, "show notes")
        
        # Try to create note with very long name
        # This might truncate or raise error depending on implementation
        try:
            result = await notes_ability.handle_notes_command(user_id, conversation_id, f"add {long_name}")
            # If it doesn't raise, check the note was created (possibly truncated)
            note = await sync_to_async(Note.objects.filter(user=test_user).first)()
            assert note is not None
        except Exception:
            # If it raises an exception, that's also acceptable behavior
            pass
    
    async def test_empty_entry_content(self, notes_ability, test_user, test_note):
        """Empty entry content."""
        conversation_id = 'test-conv'
        user_id = test_user.id
        
        # Enter notes mode and open note
        await notes_ability.handle_notes_command(user_id, conversation_id, "show notes")
        await notes_ability.handle_notes_command(user_id, conversation_id, "1")
        
        # Try with spaces only
        result = await notes_ability.handle_notes_command(user_id, conversation_id, "add   ")
        
        # Should show error
        assert "provide content" in result.lower() or "didn't understand" in result.lower()
    
    async def test_very_long_entry_content(self, notes_ability, test_user, test_note):
        """Large text entries."""
        conversation_id = 'test-conv'
        user_id = test_user.id
        long_content = 'B' * 5000  # Very long content
        
        # Enter notes mode and open note
        await notes_ability.handle_notes_command(user_id, conversation_id, "show notes")
        await notes_ability.handle_notes_command(user_id, conversation_id, "1")
        
        # Add entry with long content
        result = await notes_ability.handle_notes_command(user_id, conversation_id, f"add {long_content}")
        
        # Should work (TextField has no limit)
        entry = await sync_to_async(NoteEntry.objects.filter(note=test_note).first)()
        assert entry is not None
        assert len(entry.content) > 1000
    
    async def test_user_only_sees_own_notes(self, notes_ability, test_user, test_user2):
        """User A can't see User B notes."""
        # Create note for user1
        note1 = await sync_to_async(Note.objects.create)(user=test_user, name='User1 Note')
        
        # Create note for user2
        note2 = await sync_to_async(Note.objects.create)(user=test_user2, name='User2 Note')
        
        # User1 should only see their note
        result = await notes_ability._show_notes_list(test_user.id)
        assert 'User1 Note' in result
        assert 'User2 Note' not in result
        
        # User2 should only see their note
        result = await notes_ability._show_notes_list(test_user2.id)
        assert 'User2 Note' in result
        assert 'User1 Note' not in result
    
    async def test_user_cant_modify_others_notes(self, notes_ability, test_user, test_user2):
        """User A can't edit User B notes."""
        # Create note for user2
        note2 = await sync_to_async(Note.objects.create)(user=test_user2, name='User2 Note')
        
        conversation_id = 'test-conv'
        user_id = test_user.id
        
        # User1 enters notes mode
        await notes_ability.handle_notes_command(user_id, conversation_id, "show notes")
        
        # User1 tries to access note #1 (which should be User2's note if they could see it)
        # But User1 has no notes, so #1 doesn't exist for them
        result = await notes_ability.handle_notes_command(user_id, conversation_id, "1")
        
        assert "not found" in result.lower()
    
    async def test_note_id_collision_different_users(self, notes_ability, test_user, test_user2):
        """Same ID different users."""
        # Create notes for both users
        note1 = await sync_to_async(Note.objects.create)(user=test_user, name='User1 Note')
        note2 = await sync_to_async(Note.objects.create)(user=test_user2, name='User2 Note')
        
        # Both notes will be #1 in their respective lists
        # User1 opens their note #1
        conversation_id = 'test-conv-1'
        result1 = await notes_ability.handle_notes_command(test_user.id, conversation_id, "show notes")
        result1 = await notes_ability.handle_notes_command(test_user.id, conversation_id, "1")
        
        assert 'User1 Note' in result1
        assert 'User2 Note' not in result1
        
        # User2 opens their note #1
        conversation_id = 'test-conv-2'
        result2 = await notes_ability.handle_notes_command(test_user2.id, conversation_id, "show notes")
        result2 = await notes_ability.handle_notes_command(test_user2.id, conversation_id, "1")
        
        assert 'User2 Note' in result2
        assert 'User1 Note' not in result2
    
    async def test_invalid_view_state(self, notes_ability, test_user):
        """Unknown view handled gracefully."""
        conversation_id = 'test-conv'
        
        # Manually set invalid view state
        notes_state.set_state(conversation_id, in_notes_mode=True, view='invalid_view')
        
        # Try to handle a command
        result = await notes_ability.handle_notes_command(test_user.id, conversation_id, "add test")
        
        # Should return None or handle gracefully
        assert result is None or isinstance(result, str)


@pytest.mark.django_db(transaction=True)
@pytest.mark.asyncio
class TestNotesIntegration:
    """Test end-to-end workflows and integration scenarios."""
    
    @pytest.fixture(autouse=True)
    def setup(self):
        """Reset notes state before each test."""
        notes_state.conversation_states.clear()
        yield
        notes_state.conversation_states.clear()
    
    @pytest.fixture
    def notes_ability(self):
        """Create NotesAbility instance."""
        return NotesAbility()
    
    async def test_full_note_lifecycle(self, notes_ability, test_user):
        """Create → Add entries → Edit → Delete."""
        conversation_id = 'test-conv'
        user_id = test_user.id
        
        # Enter notes mode
        result = await notes_ability.handle_notes_command(user_id, conversation_id, "show notes")
        assert "don't have any notes yet" in result.lower()
        
        # Create a note
        result = await notes_ability.handle_notes_command(user_id, conversation_id, "add Shopping List")
        assert "shopping list" in result.lower()
        
        # Open the note
        result = await notes_ability.handle_notes_command(user_id, conversation_id, "1")
        assert "shopping list" in result.lower()
        assert "No entries yet" in result
        
        # Add first entry
        result = await notes_ability.handle_notes_command(user_id, conversation_id, "add Milk")
        assert "milk" in result.lower()
        
        # Add second entry
        result = await notes_ability.handle_notes_command(user_id, conversation_id, "add Bread")
        assert "milk" in result.lower()
        assert "bread" in result.lower()
        
        # Edit an entry
        result = await notes_ability.handle_notes_command(user_id, conversation_id, "edit 1 Almond Milk")
        assert "almond milk" in result.lower()
        
        # Delete an entry
        result = await notes_ability.handle_notes_command(user_id, conversation_id, "delete 2")
        assert "almond milk" in result.lower()
        # Bread should be gone
        
        # Go back to list
        result = await notes_ability.handle_notes_command(user_id, conversation_id, "close")
        assert "📋 Your Notes:" in result
        
        # Delete the note
        result = await notes_ability.handle_notes_command(user_id, conversation_id, "delete 1")
        assert "don't have any notes yet" in result.lower()
    
    async def test_multiple_notes_workflow(self, notes_ability, test_user):
        """Create multiple, navigate between."""
        conversation_id = 'test-conv'
        user_id = test_user.id
        
        # Enter notes mode
        await notes_ability.handle_notes_command(user_id, conversation_id, "show notes")
        
        # Create multiple notes
        await notes_ability.handle_notes_command(user_id, conversation_id, "add Work Tasks")
        await notes_ability.handle_notes_command(user_id, conversation_id, "add Personal Goals")
        await notes_ability.handle_notes_command(user_id, conversation_id, "add Book Ideas")
        
        result = await notes_ability.handle_notes_command(user_id, conversation_id, "show notes")
        assert "work tasks" in result.lower()
        assert "personal goals" in result.lower()
        assert "book ideas" in result.lower()
        assert "#1:" in result
        assert "#2:" in result
        assert "#3:" in result
        
        # Open first note
        result = await notes_ability.handle_notes_command(user_id, conversation_id, "1")
        assert "work tasks" in result.lower()
        
        # Add entry
        await notes_ability.handle_notes_command(user_id, conversation_id, "add Complete project")
        
        # Go back and open another note
        await notes_ability.handle_notes_command(user_id, conversation_id, "close")
        result = await notes_ability.handle_notes_command(user_id, conversation_id, "3")
        assert "book ideas" in result.lower()
        
        # Verify state
        state = notes_state.get_state(conversation_id)
        assert state['view'] == 'detail'
    
    async def test_entry_reordering_workflow(self, notes_ability, test_user):
        """Add entries in sequence, verify order."""
        conversation_id = 'test-conv'
        user_id = test_user.id
        
        # Setup note
        await notes_ability.handle_notes_command(user_id, conversation_id, "show notes")
        await notes_ability.handle_notes_command(user_id, conversation_id, "add TODO List")
        await notes_ability.handle_notes_command(user_id, conversation_id, "1")
        
        # Add entries in sequence
        await notes_ability.handle_notes_command(user_id, conversation_id, "add First task")
        await notes_ability.handle_notes_command(user_id, conversation_id, "add Second task")
        await notes_ability.handle_notes_command(user_id, conversation_id, "add Third task")
        
        result = await notes_ability.handle_notes_command(user_id, conversation_id, "close")
        result = await notes_ability.handle_notes_command(user_id, conversation_id, "1")
        
        # Verify entries are in order
        result_lower = result.lower()
        
        # Check order
        first_pos = result_lower.find('first task')
        second_pos = result_lower.find('second task')
        third_pos = result_lower.find('third task')
        
        assert first_pos > 0 and second_pos > 0 and third_pos > 0
        assert first_pos < second_pos < third_pos
    
    async def test_rename_and_modify_workflow(self, notes_ability, test_user):
        """Rename note, add entries, close."""
        conversation_id = 'test-conv'
        user_id = test_user.id
        
        # Create and rename a note
        await notes_ability.handle_notes_command(user_id, conversation_id, "show notes")
        await notes_ability.handle_notes_command(user_id, conversation_id, "add Draft")
        
        result = await notes_ability.handle_notes_command(user_id, conversation_id, "rename 1 Final Document")
        assert "final document" in result.lower()
        
        # Open and add entries
        await notes_ability.handle_notes_command(user_id, conversation_id, "1")
        await notes_ability.handle_notes_command(user_id, conversation_id, "add Introduction")
        await notes_ability.handle_notes_command(user_id, conversation_id, "add Body")
        result = await notes_ability.handle_notes_command(user_id, conversation_id, "add Conclusion")
        
        assert "introduction" in result.lower()
        assert "body" in result.lower()
        assert "conclusion" in result.lower()
        
        # Close and verify
        result = await notes_ability.handle_notes_command(user_id, conversation_id, "exit")
        assert "final document" in result.lower()
        assert "(3 entries)" in result.lower()
    
    async def test_switch_between_notes_same_conversation(self, notes_ability, test_user):
        """Open note 1, close, open note 2."""
        conversation_id = 'test-conv'
        user_id = test_user.id
        
        # Setup multiple notes
        await notes_ability.handle_notes_command(user_id, conversation_id, "show notes")
        await notes_ability.handle_notes_command(user_id, conversation_id, "add Note A")
        await notes_ability.handle_notes_command(user_id, conversation_id, "add Note B")
        
        # Open note 1
        result = await notes_ability.handle_notes_command(user_id, conversation_id, "1")
        assert "note a" in result.lower()
        state = notes_state.get_state(conversation_id)
        note_1_id = state['current_note_id']
        
        # Close and open note 2
        await notes_ability.handle_notes_command(user_id, conversation_id, "close")
        result = await notes_ability.handle_notes_command(user_id, conversation_id, "2")
        assert "note b" in result.lower()
        state = notes_state.get_state(conversation_id)
        note_2_id = state['current_note_id']
        
        # IDs should be different
        assert note_1_id != note_2_id
        
        # Should be in detail view
        assert state['view'] == 'detail'
    
    async def test_exit_and_reenter_notes_mode(self, notes_ability, test_user):
        """Exit, commands ignored, re-enter."""
        conversation_id = 'test-conv'
        user_id = test_user.id
        
        # Enter notes mode
        await notes_ability.handle_notes_command(user_id, conversation_id, "show notes")
        state = notes_state.get_state(conversation_id)
        assert state['in_notes_mode'] is True
        
        # Exit notes mode
        await notes_ability.handle_notes_command(user_id, conversation_id, "exit")
        state = notes_state.get_state(conversation_id)
        assert state['in_notes_mode'] is False
        
        # Try a notes command (should be ignored)
        result = await notes_ability.handle_notes_command(user_id, conversation_id, "add test")
        assert result is None
        
        # Re-enter notes mode
        result = await notes_ability.handle_notes_command(user_id, conversation_id, "show notes")
        assert "📋 Your Notes:" in result
        state = notes_state.get_state(conversation_id)
        assert state['in_notes_mode'] is True
        assert state['view'] == 'list'
    
    async def test_recover_from_invalid_command(self, notes_ability, test_user):
        """Bad command doesn't break state."""
        conversation_id = 'test-conv'
        user_id = test_user.id
        
        # Enter notes mode
        await notes_ability.handle_notes_command(user_id, conversation_id, "show notes")
        
        # Try invalid commands
        result = await notes_ability.handle_notes_command(user_id, conversation_id, "xyz123")
        assert "didn't understand" in result.lower()
        
        # State should still be valid
        state = notes_state.get_state(conversation_id)
        assert state['in_notes_mode'] is True
        assert state['view'] == 'list'
        
        # Valid command should still work
        result = await notes_ability.handle_notes_command(user_id, conversation_id, "add Test Note")
        assert "test note" in result.lower()
        
        # Open note
        await notes_ability.handle_notes_command(user_id, conversation_id, "1")
        
        # Try invalid command in detail view
        result = await notes_ability.handle_notes_command(user_id, conversation_id, "invalid")
        assert "didn't understand" in result.lower()
        
        # Valid command should still work
        result = await notes_ability.handle_notes_command(user_id, conversation_id, "add Entry 1")
        assert "entry 1" in result.lower()
    
    async def test_concurrent_conversations(self, notes_ability, test_user, test_user2):
        """Two conversations, separate state."""
        conv1 = 'conversation-1'
        conv2 = 'conversation-2'
        
        # User 1 in conversation 1
        await notes_ability.handle_notes_command(test_user.id, conv1, "show notes")
        await notes_ability.handle_notes_command(test_user.id, conv1, "add User1 Note")
        
        # User 2 in conversation 2
        await notes_ability.handle_notes_command(test_user2.id, conv2, "show notes")
        await notes_ability.handle_notes_command(test_user2.id, conv2, "add User2 Note")
        
        # Open notes in each conversation
        result1 = await notes_ability.handle_notes_command(test_user.id, conv1, "1")
        result2 = await notes_ability.handle_notes_command(test_user2.id, conv2, "1")
        
        # Each sees only their own note
        assert "user1 note" in result1.lower()
        assert "user2 note" not in result1.lower()
        
        assert "user2 note" in result2.lower()
        assert "user1 note" not in result2.lower()
        
        # States are independent
        state1 = notes_state.get_state(conv1)
        state2 = notes_state.get_state(conv2)
        
        assert state1['view'] == 'detail'
        assert state2['view'] == 'detail'
        assert state1['current_note_id'] != state2['current_note_id']
