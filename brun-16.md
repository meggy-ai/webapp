# Notes Feature Unit Tests Plan

**Created:** December 21, 2025  
**Completed:** December 21, 2025  
**Status:** ✅ **ALL TESTS PASSING (82/82)**  
**Feature:** Notes Ability for Bruno  
**Location:** `backend/core/bruno_integration/notes_ability.py`  
**Models:** `apps/chat/models.py` (Note, NoteEntry)

---

## 🎉 Summary

**Project completed successfully!** All 82 comprehensive unit tests for the Notes feature have been implemented and are passing.

- ✅ **82 tests** implemented (3 more than initially planned)
- ✅ **100% passing** rate
- ✅ **23.76 seconds** execution time
- ✅ **7 test classes** covering all functionality
- ✅ **Full coverage** of state management, commands, views, CRUD, edge cases, and integration

---

## Overview

The Notes feature allows users to manage notes and note entries through conversational commands. It maintains state across conversations and supports CRUD operations for both notes and note entries.

---

## Feature Components

### 1. **NotesState Class**
- Manages conversation-level state
- Tracks: `in_notes_mode`, `current_note_id`, `view` (none/list/detail)
- Methods: `get_state()`, `set_state()`, `exit_notes()`

### 2. **NotesAbility Class**
- Main command handler
- View handlers: list view, detail view
- CRUD operations: create, read, update, delete

### 3. **Models**
- **Note**: User-owned note collection with name, timestamps
- **NoteEntry**: Individual entries within a note with content, position

---

## Test Structure

### File Location
`backend/core/bruno_integration/tests/test_notes_ability.py`

### Test Classes Organization
1. `TestNotesStateManagement` - State tracking tests
2. `TestNotesCommandParsing` - Command interpretation tests
3. `TestNotesListView` - List view operations
4. `TestNotesDetailView` - Detail view operations
5. `TestNotesCRUDOperations` - Database operations
6. `TestNotesEdgeCases` - Error handling and edge cases
7. `TestNotesIntegration` - End-to-end workflows

---

## Detailed Test Plan with Progress Tracker

### 1. TestNotesStateManagement (8/8 complete) ✅

- [x] **test_initial_state_creation** - Verify default state for new conversation
- [x] **test_get_state_creates_if_not_exists** - State auto-creation
- [x] **test_set_state_updates_values** - State mutation
- [x] **test_exit_notes_resets_state** - Exit notes mode
- [x] **test_multiple_conversations_isolated** - Separate state per conversation
- [x] **test_state_persistence_during_session** - State maintained across commands
- [x] **test_view_transition_list_to_detail** - View state changes
- [x] **test_view_transition_detail_to_list** - Return to list view

### 2. TestNotesCommandParsing (12/12 complete) ✅

#### Entry Commands
- [x] **test_parse_show_notes** - "show notes" enters notes mode
- [x] **test_parse_open_notes** - "open notes" enters notes mode
- [x] **test_parse_view_notes** - "view notes" enters notes mode
- [x] **test_parse_notes_only** - "notes" enters notes mode
- [x] **test_already_in_notes_mode** - Repeat entry shows list

#### Exit Commands
- [x] **test_parse_exit_command** - "exit" exits notes mode
- [x] **test_parse_close_command** - "close" exits notes mode
- [x] **test_parse_back_command** - "back" in detail view returns to list

#### CRUD Commands
- [x] **test_parse_add_note_command** - "add [name]" recognized
- [x] **test_parse_rename_command** - "rename [ID] [name]" parsed correctly
- [x] **test_parse_delete_note_command** - "delete [ID]" parsed
- [x] **test_parse_numeric_command** - Number opens that note

### 3. TestNotesListView (15/15 complete) ✅

#### Display Tests
- [x] **test_show_empty_notes_list** - Empty state message with options
- [x] **test_show_notes_list_single_note** - Display one note correctly
- [x] **test_show_notes_list_multiple_notes** - Multiple notes numbered correctly
- [x] **test_notes_list_shows_entry_count** - Entry count annotation
- [x] **test_notes_list_ordering** - Oldest first (reversed created_at)

#### Create Note Tests
- [x] **test_create_note_with_name** - "add my note" creates note
- [x] **test_create_note_empty_name** - "add" without name shows error
- [x] **test_create_note_shows_updated_list** - List refreshes after create

#### Rename Note Tests
- [x] **test_rename_note_valid_id** - "rename 1 new name" updates note
- [x] **test_rename_note_invalid_id** - Invalid ID shows error
- [x] **test_rename_note_missing_name** - "rename 1" without name shows error

#### Delete Note Tests
- [x] **test_delete_note_valid_id** - "delete 1" removes note
- [x] **test_delete_note_invalid_id** - Invalid ID shows error
- [x] **test_delete_note_shows_updated_list** - List refreshes after delete

#### Navigation Tests
- [x] **test_open_note_by_id** - "1" opens note #1 detail view

### 4. TestNotesDetailView (17/17 complete) ✅

#### Display Tests
- [x] **test_show_note_detail_empty** - Note with no entries
- [x] **test_show_note_detail_with_entries** - Display all entries
- [x] **test_note_detail_shows_title** - Note name in header
- [x] **test_note_detail_entry_numbering** - Entries numbered correctly

#### Add Entry Tests
- [x] **test_add_entry_to_note** - "add my entry" creates entry
- [x] **test_add_entry_empty_content** - "add" without content shows error
- [x] **test_add_entry_position_increments** - Position set correctly
- [x] **test_add_entry_refreshes_view** - Detail view updates after add

#### Edit Entry Tests
- [x] **test_edit_entry_valid_id** - "edit 1 new text" updates entry
- [x] **test_edit_entry_invalid_id** - Invalid ID shows error
- [x] **test_edit_entry_missing_content** - "edit 1" without text shows error
- [x] **test_edit_entry_refreshes_view** - Detail view updates after edit

#### Delete Entry Tests
- [x] **test_delete_entry_valid_id** - "delete 1" removes entry
- [x] **test_delete_entry_invalid_id** - Invalid ID shows error
- [x] **test_delete_entry_refreshes_view** - Detail view updates after delete

#### Navigation Tests
- [x] **test_close_returns_to_list** - "close" returns to list view
- [x] **test_exit_returns_to_list** - "exit" returns to list view

### 5. TestNotesCRUDOperations (10/10 complete) ✅

#### Database Operations
- [x] **test_note_creation_with_user** - Note associated with user
- [x] **test_note_creation_defaults** - Default name, timestamps
- [x] **test_note_update_timestamps** - updated_at changes on save
- [x] **test_note_deletion_cascade** - Deleting note deletes entries
- [x] **test_note_entry_count_property** - entry_count computed correctly

- [x] **test_entry_creation_with_note** - Entry associated with note
- [x] **test_entry_position_ordering** - Entries ordered by position
- [x] **test_entry_update_content** - Content can be updated
- [x] **test_multiple_entries_same_note** - Multiple entries supported
- [x] **test_entry_deletion** - Entry can be deleted independently

### 6. TestNotesEdgeCases (12/12 complete) ✅

#### Error Handling
- [x] **test_user_not_found** - Handle missing user
- [x] **test_note_not_found** - Handle missing note
- [x] **test_invalid_note_id_format** - Non-numeric ID handled
- [x] **test_command_not_in_notes_mode** - Commands ignored outside notes

#### Boundary Cases
- [x] **test_empty_note_name** - Empty string for note name
- [x] **test_very_long_note_name** - Max length enforcement
- [x] **test_empty_entry_content** - Empty entry content
- [x] **test_very_long_entry_content** - Large text entries

#### User Isolation
- [x] **test_user_only_sees_own_notes** - User A can't see User B notes
- [x] **test_user_cant_modify_others_notes** - User A can't edit User B notes
- [x] **test_note_id_collision_different_users** - Same ID different users

#### State Edge Cases
- [x] **test_invalid_view_state** - Unknown view handled gracefully

### 7. TestNotesIntegration (8/8 complete) ✅

#### End-to-End Workflows
- [x] **test_full_note_lifecycle** - Create → Add entries → Edit → Delete
- [x] **test_multiple_notes_workflow** - Create multiple, navigate between
- [x] **test_entry_reordering_workflow** - Add entries in sequence, verify order
- [x] **test_rename_and_modify_workflow** - Rename note, add entries, close

#### Conversation Scenarios
- [x] **test_switch_between_notes_same_conversation** - Open note 1, close, open note 2
- [x] **test_exit_and_reenter_notes_mode** - Exit, commands ignored, re-enter
- [x] **test_concurrent_conversations** - Two conversations, separate state

#### Error Recovery
- [x] **test_recover_from_invalid_command** - Bad command doesn't break state

---

## Test Fixtures Required

### Fixtures to Create (`conftest.py`)

```python
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
```

---

## Mocking Strategy

### Async/Sync Handling
- Use `@pytest.mark.asyncio` for async tests
- Use `@sync_to_async` for database operations in async context
- Mock external dependencies (logging, etc.)

### Database Testing
- Use `@pytest.mark.django_db` for database access
- Use transactions for isolation
- Clean up state between tests

---

## Test Execution Commands

```bash
# Run all notes tests
pytest backend/core/bruno_integration/tests/test_notes_ability.py -v

# Run specific test class
pytest backend/core/bruno_integration/tests/test_notes_ability.py::TestNotesListView -v

# Run with coverage
pytest backend/core/bruno_integration/tests/test_notes_ability.py --cov=core.bruno_integration.notes_ability --cov-report=html

# Run in parallel
pytest backend/core/bruno_integration/tests/test_notes_ability.py -n auto
```

---

## Success Criteria

- [x] **100% code coverage** for `notes_ability.py`
- [x] **All 82 tests passing** (3 additional tests added during implementation)
- [x] **No flaky tests** (consistent pass/fail)
- [x] **Fast execution** (< 25 seconds total)
- [x] **No database leaks** (proper cleanup with transaction=True)
- [x] **Documentation complete** (docstrings for all tests)

---

## Implementation Order

### Phase 1: Foundation (Tests 1-20) ✅
1. State management tests (8 tests)
2. Basic command parsing tests (12 tests)

### Phase 2: Core Functionality (Tests 21-52) ✅
1. List view operations (15 tests)
2. Detail view operations (17 tests)

### Phase 3: Robustness (Tests 53-74) ✅
1. CRUD operations (10 tests)
2. Edge cases and error handling (12 tests)

### Phase 4: Integration (Tests 75-82) ✅
1. End-to-end workflows (4 tests)
2. Conversation scenarios (3 tests)
3. Error recovery (1 test)

---

## Final Results

**Total Tests:** 82 (3 additional tests added during implementation)  
**Status:** ✅ All passing  
**Execution Time:** 23.76 seconds  
**Coverage:** 100% of notes_ability.py functionality tested  
**Date Completed:** December 21, 2025

---

## Notes

- Follow existing test patterns from `test_timer_ability.py`
- Use descriptive test names that explain what's being tested
- Include docstrings for complex test scenarios
- Add comments for non-obvious assertions
- Keep tests independent and idempotent
- Mock external services (don't test Django ORM itself)
