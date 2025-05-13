import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Checkbox,
  Divider,
  Chip,
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  CheckCircle as CheckCircleIcon,
  RadioButtonUnchecked as UncheckedIcon,
  Edit as EditIcon,
  Save as SaveIcon,
  Close as CloseIcon,
} from '@mui/icons-material';
import { useState } from 'react';

interface Note {
  id: string;
  content: string;
  createdAt: string;
  completed: boolean;
  completedAt?: string;
  createdBy: {
    name: string;
  };
}

interface JobNotesProps {
  jobId: string;
  notes: Note[];
  onNoteAdd: (jobId: string, content: string) => Promise<void>;
  onNoteComplete: (jobId: string, noteId: string) => Promise<void>;
  onNoteDelete: (jobId: string, noteId: string) => Promise<void>;
  onNoteEdit?: (jobId: string, noteId: string, content: string) => Promise<void>;
}

export default function JobNotes({ 
  jobId, 
  notes, 
  onNoteAdd, 
  onNoteComplete, 
  onNoteDelete, 
  onNoteEdit
}: JobNotesProps) {
  const [newNote, setNewNote] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [editingContent, setEditingContent] = useState('');

  const handleAddNote = async () => {
    if (!newNote.trim()) return;
    
    setIsAdding(true);
    try {
      await onNoteAdd(jobId, newNote);
      setNewNote('');
    } catch (error) {
      console.error('Failed to add note:', error);
    } finally {
      setIsAdding(false);
    }
  };

  const handleCompleteNote = async (noteId: string) => {
    try {
      await onNoteComplete(jobId, noteId);
    } catch (error) {
      console.error('Failed to complete note:', error);
    }
  };

  const handleDeleteNote = async (noteId: string) => {
    try {
      await onNoteDelete(jobId, noteId);
    } catch (error) {
      console.error('Failed to delete note:', error);
    }
  };

  const handleEditClick = (note: Note) => {
    setEditingNoteId(note.id);
    setEditingContent(note.content);
  };

  const handleEditCancel = () => {
    setEditingNoteId(null);
    setEditingContent('');
  };

  const handleEditSave = async (noteId: string) => {
    if (!editingContent.trim() || !onNoteEdit) return;
    try {
      await onNoteEdit(jobId, noteId, editingContent);
      setEditingNoteId(null);
      setEditingContent('');
    } catch (error) {
      console.error('Failed to edit note:', error);
    }
  };

  const completedNotes = notes.filter(note => note.completed);
  const pendingNotes = notes.filter(note => !note.completed);

  return (
    <Paper sx={{ p: 3, mb: 3 }}>
      <Typography variant="h6" sx={{ mb: 2 }}>
        Job Notes & Tasks
      </Typography>

      <Box sx={{ mb: 3 }}>
        <TextField
          fullWidth
          multiline
          rows={2}
          placeholder="Add a note or task (e.g., 'Need to order mulch', 'Check irrigation system')"
          value={newNote}
          onChange={(e) => setNewNote(e.target.value)}
          sx={{ mb: 1 }}
        />
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleAddNote}
          disabled={!newNote.trim() || isAdding}
        >
          Add Note
        </Button>
      </Box>

      {notes.length > 0 ? (
        <>
          {pendingNotes.length > 0 && (
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle1" sx={{ mb: 1, color: 'text.secondary' }}>
                Pending Tasks
              </Typography>
              <List>
                {pendingNotes.map((note) => (
                  <ListItem
                    key={note.id}
                    sx={{
                      bgcolor: 'background.paper',
                      borderRadius: 1,
                      mb: 1,
                    }}
                  >
                    <Checkbox
                      icon={<UncheckedIcon />}
                      checkedIcon={<CheckCircleIcon />}
                      checked={note.completed}
                      onChange={() => handleCompleteNote(note.id)}
                    />
                    {editingNoteId === note.id ? (
                      <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                        <TextField
                          value={editingContent}
                          onChange={e => setEditingContent(e.target.value)}
                          size="small"
                          fullWidth
                        />
                        <IconButton onClick={() => handleEditSave(note.id)} color="primary">
                          <SaveIcon />
                        </IconButton>
                        <IconButton onClick={handleEditCancel} color="error">
                          <CloseIcon />
                        </IconButton>
                      </Box>
                    ) : (
                      <ListItemText
                        primary={note.content}
                        secondary={
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Typography variant="caption" color="text.secondary">
                              {new Date(note.createdAt).toLocaleString()}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              • Created by {note.createdBy.name}
                            </Typography>
                          </Box>
                        }
                      />
                    )}
                    <ListItemSecondaryAction>
                      <IconButton edge="end" aria-label="edit" onClick={() => handleEditClick(note)} disabled={editingNoteId === note.id}>
                        <EditIcon />
                      </IconButton>
                      <IconButton edge="end" aria-label="delete" onClick={() => handleDeleteNote(note.id)}>
                        <DeleteIcon />
                      </IconButton>
                    </ListItemSecondaryAction>
                  </ListItem>
                ))}
              </List>
            </Box>
          )}

          {completedNotes.length > 0 && (
            <Box>
              <Typography variant="subtitle1" sx={{ mb: 1, color: 'text.secondary' }}>
                Completed Tasks
              </Typography>
              <List>
                {completedNotes.map((note) => (
                  <ListItem
                    key={note.id}
                    sx={{
                      bgcolor: 'background.paper',
                      borderRadius: 1,
                      mb: 1,
                      opacity: 0.7,
                    }}
                  >
                    <Checkbox
                      icon={<UncheckedIcon />}
                      checkedIcon={<CheckCircleIcon />}
                      checked={note.completed}
                      onChange={() => handleCompleteNote(note.id)}
                    />
                    <ListItemText
                      primary={note.content}
                      secondary={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Typography variant="caption" color="text.secondary">
                            {new Date(note.createdAt).toLocaleString()}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            • Created by {note.createdBy.name}
                          </Typography>
                          {note.completedAt && (
                            <>
                              <Chip
                                label="Completed"
                                size="small"
                                color="success"
                                icon={<CheckCircleIcon />}
                              />
                              <Typography variant="caption" color="text.secondary">
                                {new Date(note.completedAt).toLocaleString()}
                              </Typography>
                            </>
                          )}
                        </Box>
                      }
                    />
                    <ListItemSecondaryAction>
                      <IconButton
                        edge="end"
                        aria-label="delete"
                        onClick={() => handleDeleteNote(note.id)}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </ListItemSecondaryAction>
                  </ListItem>
                ))}
              </List>
            </Box>
          )}
        </>
      ) : (
        <Typography component="div" color="text.secondary" sx={{ textAlign: 'center', py: 3 }}>
          No notes or tasks yet. Add your first note above!
        </Typography>
      )}
    </Paper>
  );
} 