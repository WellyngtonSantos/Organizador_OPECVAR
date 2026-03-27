import React, { useState } from 'react';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Paper from '@mui/material/Paper';
import Divider from '@mui/material/Divider';
import CircularProgress from '@mui/material/CircularProgress';
import DeleteIcon from '@mui/icons-material/Delete';
import SendIcon from '@mui/icons-material/Send';
import type { TaskNote } from '../../types/task';
import { formatDateTime } from '../../utils/dateUtils';
import { useAuth } from '../../context/AuthContext';

interface TaskNotesProps {
  notes: TaskNote[];
  loading: boolean;
  onAddNote: (content: string) => Promise<void>;
  onDeleteNote: (noteId: string) => Promise<void>;
}

export default function TaskNotes({
  notes,
  loading,
  onAddNote,
  onDeleteNote,
}: TaskNotesProps) {
  const [newNote, setNewNote] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { user, isManager } = useAuth();

  const handleAddNote = async () => {
    if (!newNote.trim()) return;
    setSubmitting(true);
    try {
      await onAddNote(newNote.trim());
      setNewNote('');
    } finally {
      setSubmitting(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleAddNote();
    }
  };

  const canDeleteNote = (note: TaskNote): boolean => {
    if (isManager) return true;
    return note.authorId === user?.id;
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 2 }}>
      {/* Add note input */}
      <Stack direction="row" spacing={1} sx={{ mb: 3 }}>
        <TextField
          placeholder="Adicionar uma nota..."
          value={newNote}
          onChange={(e) => setNewNote(e.target.value)}
          onKeyDown={handleKeyDown}
          multiline
          maxRows={4}
          size="small"
          fullWidth
          disabled={submitting}
        />
        <Button
          variant="contained"
          onClick={handleAddNote}
          disabled={!newNote.trim() || submitting}
          sx={{ minWidth: 'auto', px: 2 }}
        >
          <SendIcon fontSize="small" />
        </Button>
      </Stack>

      <Divider sx={{ mb: 2 }} />

      {/* Notes list */}
      {notes.length === 0 ? (
        <Typography color="text.secondary" textAlign="center" sx={{ py: 4 }}>
          Nenhuma nota adicionada ainda.
        </Typography>
      ) : (
        <Stack spacing={1.5}>
          {[...notes].reverse().map((note) => (
            <Paper key={note.id} variant="outlined" sx={{ p: 1.5 }}>
              <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                <Box sx={{ flex: 1 }}>
                  <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 0.5 }}>
                    <Typography variant="subtitle2" fontWeight={600}>
                      {note.author.name}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {formatDateTime(note.createdAt)}
                    </Typography>
                  </Stack>
                  <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                    {note.content}
                  </Typography>
                </Box>
                {canDeleteNote(note) && (
                  <IconButton
                    size="small"
                    onClick={() => onDeleteNote(note.id)}
                    sx={{ ml: 1, color: 'text.secondary', '&:hover': { color: 'error.main' } }}
                  >
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                )}
              </Stack>
            </Paper>
          ))}
        </Stack>
      )}
    </Box>
  );
}
