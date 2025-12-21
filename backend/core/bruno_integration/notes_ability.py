"""
Notes ability for Bruno - Manage user notes and entries
"""
from typing import Dict, Any, Optional
import logging
from asgiref.sync import sync_to_async

logger = logging.getLogger(__name__)


class NotesState:
    """Tracks the state of the notes interface for each conversation."""
    def __init__(self):
        self.conversation_states: Dict[str, Dict[str, Any]] = {}
    
    def get_state(self, conversation_id: str) -> Dict[str, Any]:
        """Get state for a conversation."""
        if conversation_id not in self.conversation_states:
            self.conversation_states[conversation_id] = {
                'in_notes_mode': False,
                'current_note_id': None,
                'view': 'none'  # 'none', 'list', 'detail'
            }
        return self.conversation_states[conversation_id]
    
    def set_state(self, conversation_id: str, **kwargs):
        """Update state for a conversation."""
        state = self.get_state(conversation_id)
        state.update(kwargs)
    
    def exit_notes(self, conversation_id: str):
        """Exit notes mode."""
        self.conversation_states[conversation_id] = {
            'in_notes_mode': False,
            'current_note_id': None,
            'view': 'none'
        }


# Global notes state manager
notes_state = NotesState()


class NotesAbility:
    """Manages note-taking functionality for Bruno."""
    
    def __init__(self):
        from apps.chat.models import Note, NoteEntry
        self.Note = Note
        self.NoteEntry = NoteEntry
        logger.info("Initialized NotesAbility")
    
    async def handle_notes_command(
        self,
        user_id: str,
        conversation_id: str,
        command: str
    ) -> str:
        """
        Handle notes commands and route to appropriate handler.
        
        Args:
            user_id: User's ID
            conversation_id: Current conversation ID
            command: User's command (e.g., 'show notes', 'add entry', etc.)
            
        Returns:
            Formatted response string
        """
        command_lower = command.lower().strip()
        state = notes_state.get_state(conversation_id)
        
        logger.info(f"📝 Notes command handler: '{command_lower}', in_notes_mode={state['in_notes_mode']}, view={state['view']}")
        
        # Check if user wants to enter notes mode
        # Match "show notes", "view notes", "open notes", or just "notes"
        if any(phrase in command_lower for phrase in ['show notes', 'open notes', 'view notes']) or command_lower == 'notes':
            if not state['in_notes_mode']:
                logger.info(f"📝 Entering notes mode")
                notes_state.set_state(conversation_id, in_notes_mode=True, view='list')
                return await self._show_notes_list(user_id)
            else:
                # Already in notes mode, just show the list again
                logger.info(f"📝 Already in notes mode, showing list")
                return await self._show_notes_list(user_id)
        
        # If not in notes mode, return None (not a notes command)
        if not state['in_notes_mode']:
            logger.info(f"📝 Not in notes mode, ignoring command")
            return None
        
        # Handle commands based on current view
        logger.info(f"📝 Routing to view handler: {state['view']}")
        if state['view'] == 'list':
            return await self._handle_list_view_command(user_id, conversation_id, command_lower)
        elif state['view'] == 'detail':
            return await self._handle_detail_view_command(user_id, conversation_id, command_lower)
        
        logger.warning(f"📝 No handler found for view: {state['view']}")
        return None
    
    async def _show_notes_list(self, user_id: str) -> str:
        """Show list of all user notes."""
        @sync_to_async
        def get_notes():
            from django.contrib.auth import get_user_model
            from django.db.models import Count
            User = get_user_model()
            user = User.objects.get(id=user_id)
            # Annotate with entry count to avoid async issues
            notes = list(self.Note.objects.filter(user=user).annotate(
                entries_count=Count('entries')
            ).order_by('-created_at'))
            return notes
        
        notes = await get_notes()
        
        if not notes:
            return """📋 Your Notes:

You don't have any notes yet!

💡 Options:
• Say 'add [name]' to add a note
• Say 'exit' or 'close' to leave notes"""
        
        lines = ["📋 Your Notes:", ""]
        for idx, note in enumerate(reversed(notes), 1):  # Reverse to show oldest first with #1
            lines.append(f"#{idx}: {note.name} ({note.entries_count} entries)")
        
        lines.extend([
            "",
            "💡 Options:",
            "• Say a note ID to open it (e.g., '1')",
            "• Say 'add [name]' to add a note",
            "• Say 'rename [ID] [new name]' to rename a note",
            "• Say 'delete [ID]' to remove a note",
            "• Say 'exit' or 'close' to leave notes"
        ])
        
        return "\n".join(lines)
    
    async def _handle_list_view_command(
        self,
        user_id: str,
        conversation_id: str,
        command: str
    ) -> str:
        """Handle commands when viewing the notes list."""
        
        # Exit notes mode
        if command in ['exit', 'close']:
            notes_state.exit_notes(conversation_id)
            return "👋 Exited notes. Your notes are saved!"
        
        # Create new note
        if command.startswith('add '):
            note_name = command[4:].strip()
            if not note_name:
                return "Please provide a name for the note. Try 'add [name]'"
            
            @sync_to_async
            def create_note():
                from django.contrib.auth import get_user_model
                User = get_user_model()
                user = User.objects.get(id=user_id)
                note = self.Note.objects.create(user=user, name=note_name)
                count = self.Note.objects.filter(user=user).count()
                return count
            
            count = await create_note()
            return await self._show_notes_list(user_id)
        
        # Rename note
        if command.startswith('rename '):
            parts = command[7:].strip().split(maxsplit=1)
            if len(parts) < 2:
                return "Usage: rename [ID] [new name]"
            
            try:
                note_id = int(parts[0])
                new_name = parts[1]
                
                @sync_to_async
                def rename_note():
                    from django.contrib.auth import get_user_model
                    User = get_user_model()
                    user = User.objects.get(id=user_id)
                    notes = list(self.Note.objects.filter(user=user).order_by('-created_at'))
                    notes.reverse()  # Oldest first
                    if 1 <= note_id <= len(notes):
                        note = notes[note_id - 1]
                        note.name = new_name
                        note.save()
                        return True
                    return False
                
                success = await rename_note()
                if success:
                    return await self._show_notes_list(user_id)
                else:
                    return f"Note #{note_id} not found. Please check the note ID."
            except (ValueError, IndexError):
                return "Invalid note ID. Please use a number."
        
        # Delete note
        if command.startswith('delete '):
            try:
                note_id = int(command[7:].strip())
                
                @sync_to_async
                def delete_note():
                    from django.contrib.auth import get_user_model
                    User = get_user_model()
                    user = User.objects.get(id=user_id)
                    notes = list(self.Note.objects.filter(user=user).order_by('-created_at'))
                    notes.reverse()
                    if 1 <= note_id <= len(notes):
                        note = notes[note_id - 1]
                        note.delete()
                        return True
                    return False
                
                success = await delete_note()
                if success:
                    return await self._show_notes_list(user_id)
                else:
                    return f"Note #{note_id} not found."
            except ValueError:
                return "Invalid note ID. Please use a number."
        
        # Open note by ID
        try:
            note_id = int(command)
            
            @sync_to_async
            def get_note():
                from django.contrib.auth import get_user_model
                User = get_user_model()
                user = User.objects.get(id=user_id)
                notes = list(self.Note.objects.filter(user=user).order_by('-created_at'))
                notes.reverse()
                if 1 <= note_id <= len(notes):
                    return notes[note_id - 1]
                return None
            
            note = await get_note()
            if note:
                notes_state.set_state(conversation_id, view='detail', current_note_id=str(note.id))
                return await self._show_note_detail(note.id)
            else:
                return f"Note #{note_id} not found. Please check the note ID."
        except ValueError:
            pass
        
        return "I didn't understand that command. Try 'add note', a note number, or 'exit'."
    
    async def _show_note_detail(self, note_id: str) -> str:
        """Show details of a specific note."""
        @sync_to_async
        def get_note_with_entries():
            note = self.Note.objects.get(id=note_id)
            entries = list(note.entries.all())
            return note, entries
        
        note, entries = await get_note_with_entries()
        
        lines = [f"📝 {note.name} (Note #{note_id})", ""]
        
        if entries:
            lines.append("Entries:")
            for idx, entry in enumerate(entries, 1):
                lines.append(f"#{idx}: {entry.content}")
        else:
            lines.append("No entries yet.")
        
        lines.extend([
            "",
            "💡 Options:",
            "• Say 'add [text]' to add an entry",
            "• Say 'edit [#] [text]' to update an entry",
            "• Say 'delete [#]' to remove an entry",
            "• Say 'close' or 'exit' to return to notes list"
        ])
        
        return "\n".join(lines)
    
    async def _handle_detail_view_command(
        self,
        user_id: str,
        conversation_id: str,
        command: str
    ) -> str:
        """Handle commands when viewing note details."""
        state = notes_state.get_state(conversation_id)
        note_id = state['current_note_id']
        
        logger.info(f"📝 Detail view command: '{command}', note_id={note_id}")
        
        # Close note and return to list
        if command in ['close', 'exit', 'back']:
            logger.info(f"📝 Closing note, returning to list")
            notes_state.set_state(conversation_id, view='list', current_note_id=None)
            return await self._show_notes_list(user_id)
        
        # Add entry
        if command.startswith('add '):
            content = command[4:].strip()
            if not content:
                return "Please provide content for the entry. Try 'add [text]'"
            
            @sync_to_async
            def add_entry():
                note = self.Note.objects.get(id=note_id)
                max_pos = note.entries.aggregate(models.Max('position'))['position__max'] or 0
                self.NoteEntry.objects.create(
                    note=note,
                    content=content,
                    position=max_pos + 1
                )
            
            from django.db import models
            await add_entry()
            return await self._show_note_detail(note_id)
        
        # Edit entry
        if command.startswith('edit '):
            parts = command[5:].strip().split(maxsplit=1)
            if len(parts) < 2:
                return "Usage: edit [#] [new text]"
            
            try:
                entry_num = int(parts[0])
                new_content = parts[1]
                
                @sync_to_async
                def edit_entry():
                    note = self.Note.objects.get(id=note_id)
                    entries = list(note.entries.all())
                    if 1 <= entry_num <= len(entries):
                        entry = entries[entry_num - 1]
                        entry.content = new_content
                        entry.save()
                        return True
                    return False
                
                success = await edit_entry()
                if success:
                    return await self._show_note_detail(note_id)
                else:
                    return f"Entry #{entry_num} not found."
            except ValueError:
                return "Invalid entry number."
        
        # Delete entry
        if command.startswith('delete '):
            try:
                entry_num = int(command[7:].strip())
                
                @sync_to_async
                def delete_entry():
                    note = self.Note.objects.get(id=note_id)
                    entries = list(note.entries.all())
                    if 1 <= entry_num <= len(entries):
                        entries[entry_num - 1].delete()
                        return True
                    return False
                
                success = await delete_entry()
                if success:
                    return await self._show_note_detail(note_id)
                else:
                    return f"Entry #{entry_num} not found."
            except ValueError:
                return "Invalid entry number."
        
        return "I didn't understand that command. Try 'add [text]', 'edit [#] [text]', 'delete [#]', or 'close'."
