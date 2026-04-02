import React, { useState, useCallback } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Paper from '@mui/material/Paper';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Chip from '@mui/material/Chip';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import TextField from '@mui/material/TextField';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import dayjs from 'dayjs';
import { useAuth } from '../context/AuthContext';
import { useSuggestions } from '../hooks/useSuggestions';
import { SuggestionStatus, suggestionStatusLabels, suggestionStatusColors } from '../types/suggestion';
import type { Suggestion } from '../types/suggestion';
import ConfirmDialog from '../components/common/ConfirmDialog';

interface SnackbarState {
  open: boolean;
  message: string;
  severity: 'success' | 'error';
}

export default function SuggestionsPage() {
  const { user } = useAuth();
  const isManager = user?.role === 'MANAGER';
  const { suggestions, loading, createSuggestion, updateSuggestion, deleteSuggestion } = useSuggestions();

  // Create dialog
  const [createOpen, setCreateOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // Edit dialog (manager only)
  const [editOpen, setEditOpen] = useState(false);
  const [editingSuggestion, setEditingSuggestion] = useState<Suggestion | null>(null);
  const [editStatus, setEditStatus] = useState<string>('');
  const [editNote, setEditNote] = useState('');

  // Delete
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteId, setDeleteId] = useState('');

  const [snackbar, setSnackbar] = useState<SnackbarState>({ open: false, message: '', severity: 'success' });

  const handleOpenCreate = useCallback(() => {
    setTitle('');
    setDescription('');
    setFormErrors({});
    setCreateOpen(true);
  }, []);

  const handleCreate = useCallback(async () => {
    const errors: Record<string, string> = {};
    if (!title.trim() || title.trim().length < 3) errors.title = 'Titulo deve ter ao menos 3 caracteres';
    if (!description.trim() || description.trim().length < 5) errors.description = 'Descricao deve ter ao menos 5 caracteres';
    setFormErrors(errors);
    if (Object.keys(errors).length > 0) return;

    try {
      await createSuggestion({ title: title.trim(), description: description.trim() });
      setCreateOpen(false);
      setSnackbar({ open: true, message: 'Melhoria registrada com sucesso!', severity: 'success' });
    } catch {
      setSnackbar({ open: true, message: 'Erro ao registrar melhoria.', severity: 'error' });
    }
  }, [title, description, createSuggestion]);

  const handleOpenEdit = useCallback((suggestion: Suggestion) => {
    setEditingSuggestion(suggestion);
    setEditStatus(suggestion.status);
    setEditNote(suggestion.adminNote ?? '');
    setEditOpen(true);
  }, []);

  const handleUpdate = useCallback(async () => {
    if (!editingSuggestion) return;
    try {
      await updateSuggestion(editingSuggestion.id, {
        status: editStatus,
        adminNote: editNote.trim() || null,
      });
      setEditOpen(false);
      setSnackbar({ open: true, message: 'Melhoria atualizada!', severity: 'success' });
    } catch {
      setSnackbar({ open: true, message: 'Erro ao atualizar melhoria.', severity: 'error' });
    }
  }, [editingSuggestion, editStatus, editNote, updateSuggestion]);

  const handleDelete = useCallback(async () => {
    try {
      await deleteSuggestion(deleteId);
      setDeleteOpen(false);
      setSnackbar({ open: true, message: 'Melhoria excluida!', severity: 'success' });
    } catch {
      setSnackbar({ open: true, message: 'Erro ao excluir melhoria.', severity: 'error' });
      setDeleteOpen(false);
    }
  }, [deleteId, deleteSuggestion]);

  return (
    <Box>
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
        <Typography variant="h4">Melhorias do Sistema</Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={handleOpenCreate}>
          Sugerir Melhoria
        </Button>
      </Stack>

      <TableContainer component={Paper} sx={{ borderRadius: 2 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell><strong>Titulo</strong></TableCell>
              <TableCell><strong>Descricao</strong></TableCell>
              <TableCell><strong>Autor</strong></TableCell>
              <TableCell><strong>Status</strong></TableCell>
              <TableCell><strong>Data/Hora</strong></TableCell>
              <TableCell><strong>Nota do Gestor</strong></TableCell>
              {isManager && <TableCell align="right"><strong>Acoes</strong></TableCell>}
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={isManager ? 7 : 6} align="center">Carregando...</TableCell>
              </TableRow>
            ) : suggestions.length === 0 ? (
              <TableRow>
                <TableCell colSpan={isManager ? 7 : 6} align="center">
                  Nenhuma melhoria registrada ainda. Seja o primeiro a sugerir!
                </TableCell>
              </TableRow>
            ) : (
              suggestions.map((s) => (
                <TableRow key={s.id}>
                  <TableCell sx={{ fontWeight: 500, maxWidth: 200 }}>{s.title}</TableCell>
                  <TableCell sx={{ maxWidth: 300, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                    {s.description}
                  </TableCell>
                  <TableCell>{s.author.name}</TableCell>
                  <TableCell>
                    <Chip
                      label={suggestionStatusLabels[s.status]}
                      color={suggestionStatusColors[s.status]}
                      size="small"
                    />
                  </TableCell>
                  <TableCell sx={{ whiteSpace: 'nowrap' }}>
                    {dayjs(s.createdAt).format('DD/MM/YYYY HH:mm')}
                  </TableCell>
                  <TableCell sx={{ maxWidth: 200, fontStyle: s.adminNote ? 'normal' : 'italic', color: s.adminNote ? 'inherit' : 'text.disabled' }}>
                    {s.adminNote || 'Sem nota'}
                  </TableCell>
                  {isManager && (
                    <TableCell align="right">
                      <Tooltip title="Avaliar">
                        <IconButton size="small" onClick={() => handleOpenEdit(s)}>
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Excluir">
                        <IconButton
                          size="small"
                          onClick={() => { setDeleteId(s.id); setDeleteOpen(true); }}
                          sx={{ color: 'error.main' }}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  )}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Create Dialog */}
      <Dialog open={createOpen} onClose={() => setCreateOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Sugerir Melhoria</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              label="Titulo"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              error={!!formErrors.title}
              helperText={formErrors.title}
              fullWidth
              size="small"
              placeholder="Ex: Adicionar filtro por data no dashboard"
            />
            <TextField
              label="Descricao da Melhoria"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              error={!!formErrors.description}
              helperText={formErrors.description}
              fullWidth
              size="small"
              multiline
              minRows={4}
              maxRows={10}
              placeholder="Descreva a melhoria, o problema que ela resolve e como deveria funcionar..."
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateOpen(false)}>Cancelar</Button>
          <Button variant="contained" onClick={handleCreate}>Enviar</Button>
        </DialogActions>
      </Dialog>

      {/* Edit Dialog (Manager) */}
      <Dialog open={editOpen} onClose={() => setEditOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Avaliar Melhoria</DialogTitle>
        <DialogContent>
          {editingSuggestion && (
            <Stack spacing={2} sx={{ mt: 1 }}>
              <Box>
                <Typography variant="subtitle2" color="text.secondary">Titulo</Typography>
                <Typography>{editingSuggestion.title}</Typography>
              </Box>
              <Box>
                <Typography variant="subtitle2" color="text.secondary">Descricao</Typography>
                <Typography sx={{ whiteSpace: 'pre-wrap' }}>{editingSuggestion.description}</Typography>
              </Box>
              <Box>
                <Typography variant="subtitle2" color="text.secondary">
                  Autor: {editingSuggestion.author.name} | {dayjs(editingSuggestion.createdAt).format('DD/MM/YYYY HH:mm')}
                </Typography>
              </Box>
              <FormControl size="small" fullWidth>
                <InputLabel>Status</InputLabel>
                <Select value={editStatus} label="Status" onChange={(e) => setEditStatus(e.target.value)}>
                  {Object.values(SuggestionStatus).map((s) => (
                    <MenuItem key={s} value={s}>{suggestionStatusLabels[s]}</MenuItem>
                  ))}
                </Select>
              </FormControl>
              <TextField
                label="Nota do Gestor"
                value={editNote}
                onChange={(e) => setEditNote(e.target.value)}
                fullWidth
                size="small"
                multiline
                minRows={2}
                maxRows={6}
                placeholder="Feedback sobre a sugestao..."
              />
            </Stack>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditOpen(false)}>Cancelar</Button>
          <Button variant="contained" onClick={handleUpdate}>Salvar</Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={deleteOpen}
        title="Excluir Melhoria"
        message="Tem certeza que deseja excluir esta sugestao de melhoria?"
        confirmLabel="Excluir"
        cancelLabel="Cancelar"
        onConfirm={handleDelete}
        onCancel={() => setDeleteOpen(false)}
      />

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
          severity={snackbar.severity}
          variant="filled"
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
